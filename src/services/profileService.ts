import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { UserProfile, OnboardingState } from '@/types';
import type { Database } from '@/types/database';


export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await (supabase
        .from('profiles') as any)
        .select('*, careers:career_goal_id(id, title)')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      const profile = data as any;
      const careerTitle = profile.careers?.title || undefined;

      return {
        id: profile.id,
        name: profile.full_name || 'Student',
        email: '',
        educationLevel: profile.education_level || undefined,
        field: profile.field_of_study || undefined,
        careerGoalId: profile.career_goal_id || undefined,
        careerGoalTitle: careerTitle,
        availableHoursPerDay: profile.available_learning_minutes ? Math.round(profile.available_learning_minutes / 60) : 2,
        experienceLevel: profile.experience_level || undefined,
        isOnboarded: Boolean(profile.onboarding_completed),
        createdAt: profile.created_at,
      };
    } catch (e: unknown) {
      console.error('Error fetching profile:', e);
      return null;
    }
  },

  async ensureProfile(userId: string, fullName?: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const payload: Database['public']['Tables']['profiles']['Insert'] = {
        id: userId,
        full_name: fullName || 'Student',
        onboarding_completed: false,
      };
      await (supabase.from('profiles') as any).upsert(payload, { onConflict: 'id', ignoreDuplicates: true });
    } catch (e: unknown) {
      console.error('Error ensuring profile exists:', e);
    }
  },

  async upsertOnboarding(
    userId: string,
    data: OnboardingState
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) return { success: true, error: null };

    try {
      const payload: Database['public']['Tables']['profiles']['Insert'] = {
        id: userId,
        full_name: data.name,
        education_level: data.educationLevel,
        field_of_study: data.field,
        career_goal_id: data.careerGoalId || null,
        available_learning_minutes: (data.availableHoursPerDay || 2) * 60,
        experience_level: data.experienceLevel,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase.from('profiles') as any)
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (e: unknown) {
      console.error('Error saving onboarding data:', e);
      return { success: false, error: 'Failed to persist onboarding information to database.' };
    }
  },
};
