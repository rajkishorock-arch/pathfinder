import { supabase } from '@/lib/supabase';

export interface DailyLearningTask {
  id: string;
  roadmap_item_id: string;
  title: string;
  topic: string;
  estimated_minutes: number;
  category: string;
  due_date: string | null;
  created_at: string;
  is_completed: boolean;
  completed_at: string | null;
  stage_number?: number;
  roadmap_title?: string;
}

export interface DailyLearningProgress {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
}

export interface TaskGenerationResult {
  status: 'success' | 'no_active_roadmap' | 'error';
  roadmap_id?: string;
  tasks_generated?: number;
  due_date?: string;
  message?: string;
}

interface RoadmapRow {
  id: string;
  title: string;
}

interface RoadmapItemRow {
  id: string;
  stage_number: number;
  title: string;
}

interface DailyTaskRow {
  id: string;
  roadmap_item_id: string;
  title: string;
  topic: string;
  estimated_minutes: number;
  category: string;
  due_date: string | null;
  created_at: string;
}

interface TaskCompletionRow {
  daily_task_id: string;
  completed_at: string;
}

function getTodayISODate(): string {
  return new Date().toISOString().split('T')[0];
}

export const dailyLearningService = {
  /**
   * Fetch today's tasks for the authenticated user along with completion status.
   */
  async getTodayTasks(targetDate?: string): Promise<{ data: DailyLearningTask[] | null; error: Error | null; hasActiveRoadmap: boolean }> {
    try {
      const date = targetDate || getTodayISODate();

      // 1. Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: new Error('User not authenticated'), hasActiveRoadmap: false };
      }

      // 2. Fetch active roadmap for user
      const { data: rawRoadmaps, error: rmError } = await supabase
        .from('roadmaps')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (rmError) {
        return { data: null, error: new Error(rmError.message), hasActiveRoadmap: false };
      }

      const roadmaps = (rawRoadmaps || []) as unknown as RoadmapRow[];

      if (roadmaps.length === 0) {
        return { data: [], error: null, hasActiveRoadmap: false };
      }

      const activeRoadmap = roadmaps[0];

      // 3. Fetch roadmap items for active roadmap
      const { data: rawItems, error: itemsError } = await supabase
        .from('roadmap_items')
        .select('id, stage_number, title')
        .eq('roadmap_id', activeRoadmap.id);

      if (itemsError) {
        return { data: null, error: new Error(itemsError.message), hasActiveRoadmap: true };
      }

      const items = (rawItems || []) as unknown as RoadmapItemRow[];

      if (items.length === 0) {
        return { data: [], error: null, hasActiveRoadmap: true };
      }

      const itemIds = items.map((i) => i.id);
      const itemMap = new Map(items.map((i) => [i.id, i]));

      // 4. Fetch daily tasks matching due_date and roadmap_item_ids
      const { data: rawTasks, error: tasksError } = await supabase
        .from('daily_tasks')
        .select('*')
        .in('roadmap_item_id', itemIds)
        .eq('due_date', date);

      if (tasksError) {
        return { data: null, error: new Error(tasksError.message), hasActiveRoadmap: true };
      }

      const tasks = (rawTasks || []) as unknown as DailyTaskRow[];

      if (tasks.length === 0) {
        return { data: [], error: null, hasActiveRoadmap: true };
      }

      const taskIds = tasks.map((t) => t.id);

      // 5. Fetch completions for these daily tasks
      const { data: rawCompletions, error: compError } = await supabase
        .from('task_completions')
        .select('daily_task_id, completed_at')
        .eq('user_id', user.id)
        .in('daily_task_id', taskIds);

      if (compError) {
        return { data: null, error: new Error(compError.message), hasActiveRoadmap: true };
      }

      const completions = (rawCompletions || []) as unknown as TaskCompletionRow[];
      const completionMap = new Map(completions.map((c) => [c.daily_task_id, c.completed_at]));

      const result: DailyLearningTask[] = tasks.map((t) => {
        const item = itemMap.get(t.roadmap_item_id);
        const completedAt = completionMap.get(t.id) || null;
        return {
          id: t.id,
          roadmap_item_id: t.roadmap_item_id,
          title: t.title,
          topic: t.topic,
          estimated_minutes: t.estimated_minutes,
          category: t.category,
          due_date: t.due_date,
          created_at: t.created_at,
          is_completed: !!completedAt,
          completed_at: completedAt,
          stage_number: item?.stage_number,
          roadmap_title: activeRoadmap.title,
        };
      });

      // Sort deterministically by stage_number, then task title
      result.sort((a, b) => {
        const stageA = a.stage_number || 0;
        const stageB = b.stage_number || 0;
        if (stageA !== stageB) return stageA - stageB;
        return a.title.localeCompare(b.title);
      });

      return { data: result, error: null, hasActiveRoadmap: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch daily tasks';
      return { data: null, error: new Error(msg), hasActiveRoadmap: false };
    }
  },

  /**
   * Deterministically generate daily tasks for the current user for targetDate.
   */
  async generateTodayTasks(targetDate?: string): Promise<{ data: TaskGenerationResult | null; error: Error | null }> {
    try {
      const date = targetDate || getTodayISODate();
      const { data, error } = await supabase.rpc('generate_daily_tasks' as never, { p_target_date: date } as never);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as TaskGenerationResult, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate daily tasks';
      return { data: null, error: new Error(msg) };
    }
  },

  /**
   * Complete a daily task using secure RPC.
   */
  async completeTask(taskId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.rpc('complete_daily_task' as never, { p_task_id: taskId } as never);
      if (error) {
        return { success: false, error: new Error(error.message) };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete task';
      return { success: false, error: new Error(msg) };
    }
  },

  /**
   * Uncomplete a daily task using secure RPC.
   */
  async uncompleteTask(taskId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.rpc('uncomplete_daily_task' as never, { p_task_id: taskId } as never);
      if (error) {
        return { success: false, error: new Error(error.message) };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to uncomplete task';
      return { success: false, error: new Error(msg) };
    }
  },

  /**
   * Calculate real progress ratio: (completed today's tasks / total today's tasks) * 100.
   */
  async getTodayProgress(targetDate?: string): Promise<{ progress: DailyLearningProgress; error: Error | null }> {
    const { data: tasks, error } = await this.getTodayTasks(targetDate);
    if (error || !tasks || tasks.length === 0) {
      return {
        progress: { totalTasks: 0, completedTasks: 0, progressPercentage: 0 },
        error: error || null,
      };
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.is_completed).length;
    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

    return {
      progress: { totalTasks, completedTasks, progressPercentage },
      error: null,
    };
  },
};
