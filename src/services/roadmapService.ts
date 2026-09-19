import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/types/database';

export interface RoadmapItemData {
  id: string;
  stageNumber: number;
  skillId: string | null;
  skillName: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export interface RoadmapData {
  id: string;
  careerId: string | null;
  careerTitle: string;
  title: string;
  status: 'active' | 'paused' | 'completed';
  progressPercentage: number;
  items: RoadmapItemData[];
  createdAt: string;
  updatedAt: string;
}

type RoadmapRow = Database['public']['Tables']['roadmaps']['Row'];
type CareerRow = Database['public']['Tables']['careers']['Row'];

export const roadmapService = {
  /**
   * Get the active roadmap with items for the specified user.
   */
  async getActiveRoadmap(userId: string): Promise<RoadmapData | null> {
    if (!isSupabaseConfigured) return null;

    try {
      // 1. Fetch active roadmap for user
      const { data: roadmap, error: rError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (rError || !roadmap) {
        return null;
      }

      const rRow = roadmap as RoadmapRow;

      // 2. Fetch career title
      let careerTitle = 'Target Career';
      if (rRow.career_id) {
        const { data: career } = await supabase
          .from('careers')
          .select('title')
          .eq('id', rRow.career_id)
          .maybeSingle();
        if (career) {
          careerTitle = (career as CareerRow).title;
        }
      }

      // 3. Fetch roadmap items
      const { data: itemsData, error: itemsError } = await (supabase
        .from('roadmap_items') as any)
        .select('*, skills(name)')
        .eq('roadmap_id', rRow.id)
        .order('stage_number', { ascending: true });

      if (itemsError || !itemsData) {
        console.error('Error fetching roadmap items:', itemsError);
      }

      const items: RoadmapItemData[] = (itemsData || []).map((item: any) => ({
        id: item.id,
        stageNumber: item.stage_number,
        skillId: item.skill_id || null,
        skillName: item.skills?.name || 'Skill Step',
        title: item.title,
        description: item.description,
        createdAt: item.created_at,
      }));

      return {
        id: rRow.id,
        careerId: rRow.career_id,
        careerTitle,
        title: rRow.title,
        status: rRow.status,
        progressPercentage: rRow.progress_percentage,
        items,
        createdAt: rRow.created_at,
        updatedAt: rRow.updated_at,
      };
    } catch (e: unknown) {
      console.error('Exception fetching active roadmap:', e);
      return null;
    }
  },

  /**
   * Execute secure RPC function `generate_or_update_roadmap()`.
   * Requires authenticated session, career_goal_id, and completed assessment.
   */
  async generateOrUpdateRoadmap(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase client is not configured.' };
    }

    try {
      const { data, error } = await supabase.rpc('generate_or_update_roadmap' as any);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (e: unknown) {
      console.error('Exception executing generate_or_update_roadmap RPC:', e);
      return { success: false, error: 'Failed to generate roadmap.' };
    }
  },
};
