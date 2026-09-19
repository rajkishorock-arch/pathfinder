import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/types/database';

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  skillCategory: string;
  currentLevel: number; // 0 = Not Assessed, 1 = Beginner, 2 = Intermediate, 3 = Advanced
  currentLevelLabel: 'Not Assessed' | 'Beginner' | 'Intermediate' | 'Advanced';
  requiredLevel: number; // 1 = Beginner, 2 = Intermediate, 3 = Advanced
  requiredLevelLabel: 'Beginner' | 'Intermediate' | 'Advanced';
  gap: number; // Math.max(0, requiredLevel - currentLevel)
  priority: 'Ready' | 'Needs Improvement' | 'High Priority';
  isAssessed: boolean;
  masteryPercentage: number | null;
  lastAssessedAt: string | null;
}

export interface CareerSkillGapOverview {
  careerId: string;
  careerTitle: string;
  skills: SkillGapItem[];
  readyCount: number;
  totalSkills: number;
}

type CareerRow = Database['public']['Tables']['careers']['Row'];
type SkillRow = Database['public']['Tables']['skills']['Row'];

function levelToLabel(level: number): 'Not Assessed' | 'Beginner' | 'Intermediate' | 'Advanced' {
  switch (level) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Intermediate';
    case 3:
      return 'Advanced';
    default:
      return 'Not Assessed';
  }
}

function scoreToLevel(score: number): number {
  if (score < 40) return 1; // Beginner
  if (score < 70) return 2; // Intermediate
  return 3; // Advanced
}

export const skillGapService = {
  /**
   * Fetches the user's target career from profiles (or defaults to Software Developer),
   * fetches required skills from career_skills, queries user_skills for auth.uid(),
   * and computes deterministic skill gaps.
   */
  async getUserSkillGaps(userId: string, targetCareerId?: string): Promise<CareerSkillGapOverview | null> {
    if (!isSupabaseConfigured) return null;

    try {
      // 1. Determine career ID strictly from parameter or user profile
      let careerId = targetCareerId;
      if (!careerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('career_goal_id')
          .eq('id', userId)
          .maybeSingle();
        careerId = (profile as { career_goal_id: string | null } | null)?.career_goal_id || undefined;
      }

      if (!careerId) {
        return null;
      }

      const activeCareerId = careerId;

      // 2. Fetch career details
      const { data: careerData } = await supabase
        .from('careers')
        .select('id, title')
        .eq('id', activeCareerId)
        .maybeSingle();

      if (!careerData) {
        return null;
      }

      const careerTitle = (careerData as CareerRow).title;

      // 3. Fetch required skills for this career
      const { data: csData, error: csError } = await (supabase
        .from('career_skills') as any)
        .select('skill_id, required_level, skills(id, name, category)')
        .eq('career_id', activeCareerId);

      if (csError || !csData || csData.length === 0) {
        return {
          careerId: activeCareerId,
          careerTitle,
          skills: [],
          readyCount: 0,
          totalSkills: 0,
        };
      }

      // 4. Fetch user's current user_skills
      const { data: userSkillsData } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId);

      const userSkillsMap = new Map<string, { mastery_level: number; updated_at: string; status: string }>();
      (userSkillsData || []).forEach((us: any) => {
        userSkillsMap.set(us.skill_id, {
          mastery_level: us.mastery_level,
          updated_at: us.updated_at,
          status: us.status,
        });
      });

      // 5. Build deterministic SkillGapItem list
      let readyCount = 0;
      const skills: SkillGapItem[] = (csData as any[]).map((cs) => {
        const skillObj = cs.skills as SkillRow;
        const reqLevel = Number(cs.required_level || 2);
        const reqLabel = levelToLabel(reqLevel) as 'Beginner' | 'Intermediate' | 'Advanced';

        const userSkill = userSkillsMap.get(cs.skill_id);
        const isAssessed = Boolean(userSkill && userSkill.status === 'completed');

        let currentLevel = 0;
        let masteryPercentage: number | null = null;
        let lastAssessedAt: string | null = null;

        if (isAssessed && userSkill) {
          masteryPercentage = userSkill.mastery_level;
          currentLevel = scoreToLevel(userSkill.mastery_level);
          lastAssessedAt = userSkill.updated_at;
        }

        const currentLabel = levelToLabel(currentLevel);
        const gap = Math.max(0, reqLevel - currentLevel);

        let priority: 'Ready' | 'Needs Improvement' | 'High Priority' = 'High Priority';
        if (gap === 0) {
          priority = 'Ready';
          readyCount++;
        } else if (gap === 1) {
          priority = 'Needs Improvement';
        }

        return {
          skillId: cs.skill_id,
          skillName: skillObj?.name || 'Technical Skill',
          skillCategory: skillObj?.category || 'General',
          currentLevel,
          currentLevelLabel: currentLabel,
          requiredLevel: reqLevel,
          requiredLevelLabel: reqLabel,
          gap,
          priority,
          isAssessed,
          masteryPercentage,
          lastAssessedAt,
        };
      });

      return {
        careerId: activeCareerId,
        careerTitle,
        skills,
        readyCount,
        totalSkills: skills.length,
      };
    } catch (e: unknown) {
      console.error('Exception in getUserSkillGaps:', e);
      return null;
    }
  },
};
