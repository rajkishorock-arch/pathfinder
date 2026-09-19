import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Database } from '@/types/database';

export interface AssessmentQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
}

export interface AssessmentQuestion {
  id: string;
  skillId: string;
  questionText: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  options: AssessmentQuestionOption[];
}

export interface AssessmentResult {
  assessmentId: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
}

type QuestionRow = Database['public']['Tables']['assessment_questions']['Row'];
type OptionRow = Database['public']['Tables']['assessment_options']['Row'];
type AssessmentRow = Database['public']['Tables']['assessments']['Row'];

export const assessmentService = {
  /**
   * Fetch assessment questions and options from public schema.
   * NEVER queries assessment_answer_keys.
   */
  async getQuestionsWithOptions(): Promise<AssessmentQuestion[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('assessment_questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (questionsError || !questionsData) {
        console.error('Failed to fetch assessment questions:', questionsError);
        return [];
      }

      const { data: optionsData, error: optionsError } = await supabase
        .from('assessment_options')
        .select('*');

      if (optionsError || !optionsData) {
        console.error('Failed to fetch assessment options:', optionsError);
        return [];
      }

      const optionsByQuestionId = new Map<string, AssessmentQuestionOption[]>();
      (optionsData as OptionRow[]).forEach((opt) => {
        const list = optionsByQuestionId.get(opt.question_id) || [];
        list.push({
          id: opt.id,
          questionId: opt.question_id,
          optionText: opt.option_text,
        });
        optionsByQuestionId.set(opt.question_id, list);
      });

      return (questionsData as QuestionRow[]).map((q) => ({
        id: q.id,
        skillId: q.skill_id,
        questionText: q.question_text,
        difficulty: q.difficulty,
        options: optionsByQuestionId.get(q.id) || [],
      }));
    } catch (e: unknown) {
      console.error('Exception fetching questions with options:', e);
      return [];
    }
  },

  /**
   * Get an existing 'in_progress' assessment for the authenticated user,
   * or create a new assessment row.
   */
  async getOrCreateActiveAssessment(userId: string): Promise<{ assessmentId: string | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { assessmentId: null, error: 'Supabase client is not configured.' };
    }

    try {
      // 1. Check for active assessment
      const { data: existing, error: fetchError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (fetchError) {
        console.error('Error querying active assessment:', fetchError);
        return { assessmentId: null, error: 'Failed to retrieve assessment session.' };
      }

      if (existing) {
        return { assessmentId: (existing as AssessmentRow).id, error: null };
      }

      // 2. Create new assessment row
      const { data: newAssessment, error: createError } = await (supabase.from('assessments') as any)
        .insert({
          user_id: userId,
          status: 'in_progress',
        })
        .select('id')
        .single();

      if (createError || !newAssessment) {
        console.error('Error creating assessment:', createError);
        return { assessmentId: null, error: 'Failed to initialize assessment session.' };
      }

      return { assessmentId: newAssessment.id, error: null };
    } catch (e: unknown) {
      console.error('Exception in getOrCreateActiveAssessment:', e);
      return { assessmentId: null, error: 'Something went wrong while connecting. Please try again.' };
    }
  },

  /**
   * Recover existing answers for an active assessment to handle browser reloads gracefully.
   */
  async getExistingAnswers(assessmentId: string): Promise<Record<string, string>> {
    if (!isSupabaseConfigured) return {};

    try {
      const { data, error } = await supabase
        .from('assessment_answers')
        .select('question_id, option_id')
        .eq('assessment_id', assessmentId);

      if (error || !data) return {};

      const answers: Record<string, string> = {};
      (data as { question_id: string; option_id: string }[]).forEach((ans) => {
        answers[ans.question_id] = ans.option_id;
      });
      return answers;
    } catch (e: unknown) {
      console.error('Exception fetching existing answers:', e);
      return {};
    }
  },

  /**
   * Save or update an answer for a specific question.
   */
  async saveAnswer(
    assessmentId: string,
    questionId: string,
    optionId: string,
    userId: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase client is not configured.' };

    try {
      const payload: Database['public']['Tables']['assessment_answers']['Insert'] = {
        assessment_id: assessmentId,
        question_id: questionId,
        option_id: optionId,
        user_id: userId,
      };

      const { error } = await (supabase.from('assessment_answers') as any).upsert(payload, {
        onConflict: 'assessment_id, question_id',
      });

      if (error) {
        console.error('Error saving answer:', error);
        return { success: false, error: 'Failed to record answer.' };
      }

      return { success: true, error: null };
    } catch (e: unknown) {
      console.error('Exception saving answer:', e);
      return { success: false, error: 'Something went wrong while connecting. Please try again.' };
    }
  },

  /**
   * Submit and score the assessment via the secure RPC function.
   */
  async submitAndScoreAssessment(
    assessmentId: string
  ): Promise<{ result: AssessmentResult | null; error: string | null }> {
    if (!isSupabaseConfigured) return { result: null, error: 'Supabase client is not configured.' };

    try {
      const { data, error } = await supabase.rpc('submit_and_score_assessment' as any, {
        p_assessment_id: assessmentId,
      } as any);

      if (error || !data) {
        console.error('RPC submit_and_score_assessment error:', error);
        return { result: null, error: 'Failed to submit and score assessment.' };
      }

      const res = data as any;
      return {
        result: {
          assessmentId: res.assessment_id,
          totalQuestions: Number(res.total_questions),
          correctAnswers: Number(res.correct_answers),
          scorePercentage: Number(res.score_percentage),
        },
        error: null,
      };
    } catch (e: unknown) {
      console.error('Exception submitting assessment:', e);
      return { result: null, error: 'Something went wrong while processing your assessment.' };
    }
  },
};
