import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { skillGapService, type SkillGapItem } from '@/services/skillGapService';

export interface LearningHistoryDay {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface AssessmentHistoryItem {
  id: string;
  completedAt: string;
  scorePercentage: number;
}

export interface CareerReadinessOverview {
  totalRequiredSkills: number;
  assessedSkillsCount: number;
  skillsMeetingRequirement: number;
  skillsBelowRequirement: number;
  highPriorityGaps: number;
  totalCompletedTasks: number;
}

export interface UserProgressOverview {
  career: {
    id: string;
    title: string;
  } | null;
  dailyProgress: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    hasTasksToday: boolean;
  };
  learningHistory: LearningHistoryDay[];
  skillStatus: SkillGapItem[];
  hasHistoricalSkillData: boolean;
  assessmentHistory: {
    items: AssessmentHistoryItem[];
    overallScoreDelta: number | null;
    hasEnoughAssessments: boolean;
  };
  readinessOverview: CareerReadinessOverview | null;
}

export const progressService = {
  /**
   * Fetches full progress overview for the authenticated user.
   * SECURITY ENFORCEMENT: If userId is provided, it must match the authenticated user's ID.
   */
  async getUserProgressOverview(requestedUserId?: string): Promise<{ data: UserProgressOverview | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase client is not configured') };
    }

    try {
      // 1. Authenticate user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // Security check: Never trust arbitrary userId from browser unless it matches authenticated user
      if (requestedUserId && requestedUserId !== user.id) {
        return { data: null, error: new Error('Unauthorized access: requested user identity does not match authenticated session') };
      }

      const userId = user.id;

      // 2. Fetch User Profile & Career Goal
      const { data: profile } = await supabase
        .from('profiles')
        .select('career_goal_id')
        .eq('id', userId)
        .maybeSingle();

      let career: { id: string; title: string } | null = null;
      const careerGoalId = (profile as { career_goal_id: string | null } | null)?.career_goal_id;

      if (careerGoalId) {
        const { data: careerData } = await supabase
          .from('careers')
          .select('id, title')
          .eq('id', careerGoalId)
          .maybeSingle();

        if (careerData) {
          career = careerData as { id: string; title: string };
        }
      }

      // 3. Fetch Skill Status & Gaps (reusing skillGapService)
      let skillStatus: SkillGapItem[] = [];
      let readinessOverview: CareerReadinessOverview | null = null;

      if (career) {
        const gapData = await skillGapService.getUserSkillGaps(userId, career.id);
        if (gapData) {
          skillStatus = gapData.skills;
        }
      }

      // 4. Daily Learning Progress & History calculation
      const todayISO = new Date().toISOString().split('T')[0];

      // Fetch active roadmap items for user
      const { data: rawRoadmaps } = await supabase
        .from('roadmaps')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active');

      const activeRoadmapIds = (rawRoadmaps || []).map((r: any) => r.id);

      let dailyProgress = {
        totalTasks: 0,
        completedTasks: 0,
        progressPercentage: 0,
        hasTasksToday: false,
      };

      const learningHistoryMap = new Map<string, { total: number; completed: number }>();
      let totalCompletedTasksAllTime = 0;

      if (activeRoadmapIds.length > 0) {
        // Fetch roadmap items
        const { data: rawItems } = await supabase
          .from('roadmap_items')
          .select('id')
          .in('roadmap_id', activeRoadmapIds);

        const itemIds = (rawItems || []).map((i: any) => i.id);

        if (itemIds.length > 0) {
          // Fetch daily tasks
          const { data: rawTasks } = await supabase
            .from('daily_tasks')
            .select('id, due_date')
            .in('roadmap_item_id', itemIds);

          const tasks = rawTasks || [];
          const taskIds = tasks.map((t: any) => t.id);

          if (taskIds.length > 0) {
            // Fetch task completions for user
            const { data: rawCompletions } = await supabase
              .from('task_completions')
              .select('daily_task_id')
              .eq('user_id', userId)
              .in('daily_task_id', taskIds);

            const completedTaskIds = new Set((rawCompletions || []).map((c: any) => c.daily_task_id));
            totalCompletedTasksAllTime = completedTaskIds.size;

            // Group tasks by due_date
            tasks.forEach((t: any) => {
              const d = t.due_date;
              if (!d) return;

              const isComp = completedTaskIds.has(t.id);
              const current = learningHistoryMap.get(d) || { total: 0, completed: 0 };
              current.total += 1;
              if (isComp) current.completed += 1;
              learningHistoryMap.set(d, current);
            });

            // Calculate Today's Progress
            const todayData = learningHistoryMap.get(todayISO);
            if (todayData && todayData.total > 0) {
              const pct = Math.round((todayData.completed / todayData.total) * 100);
              dailyProgress = {
                totalTasks: todayData.total,
                completedTasks: todayData.completed,
                progressPercentage: pct,
                hasTasksToday: true,
              };
            }
          }
        }
      }

      // Format Learning History array sorted by date descending
      const learningHistory: LearningHistoryDay[] = Array.from(learningHistoryMap.entries())
        .map(([date, counts]) => ({
          date,
          totalTasks: counts.total,
          completedTasks: counts.completed,
          completionPercentage: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      // 5. Assessment Score History
      const { data: rawAssessments } = await supabase
        .from('assessments')
        .select('id, score_percentage, completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: true });

      const completedAssessments: AssessmentHistoryItem[] = (rawAssessments || []).map((a: any) => ({
        id: a.id,
        completedAt: a.completed_at,
        scorePercentage: Number(a.score_percentage || 0),
      }));

      let overallScoreDelta: number | null = null;
      const hasEnoughAssessments = completedAssessments.length >= 2;

      if (hasEnoughAssessments) {
        const latestScore = completedAssessments[completedAssessments.length - 1].scorePercentage;
        const previousScore = completedAssessments[completedAssessments.length - 2].scorePercentage;
        overallScoreDelta = latestScore - previousScore;
      }

      // 6. Career Readiness Breakdown (Transparent Components)
      if (career) {
        const totalReq = skillStatus.length;
        const assessedCount = skillStatus.filter((s) => s.isAssessed).length;
        const meetingReq = skillStatus.filter((s) => s.gap === 0).length;
        const belowReq = skillStatus.filter((s) => s.gap > 0).length;
        const highPriority = skillStatus.filter((s) => s.priority === 'High Priority').length;

        readinessOverview = {
          totalRequiredSkills: totalReq,
          assessedSkillsCount: assessedCount,
          skillsMeetingRequirement: meetingReq,
          skillsBelowRequirement: belowReq,
          highPriorityGaps: highPriority,
          totalCompletedTasks: totalCompletedTasksAllTime,
        };
      }

      return {
        data: {
          career,
          dailyProgress,
          learningHistory,
          skillStatus,
          hasHistoricalSkillData: false, // Honest state: schema does not record historical per-skill mastery progression
          assessmentHistory: {
            items: completedAssessments,
            overallScoreDelta,
            hasEnoughAssessments,
          },
          readinessOverview,
        },
        error: null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch progress overview';
      return { data: null, error: new Error(msg) };
    }
  },
};
