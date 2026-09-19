import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, OnboardingState } from '@/types';
import { AuthContext } from './AuthContext';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(() => isSupabaseConfigured);
  const isMounted = useRef(true);

  const resolveUserProfile = async (sessionUser: any): Promise<UserProfile> => {
    const dbProfile = await profileService.getProfile(sessionUser.id);
    return {
      id: sessionUser.id,
      name: dbProfile?.name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'Student',
      email: sessionUser.email || '',
      educationLevel: dbProfile?.educationLevel,
      field: dbProfile?.field,
      careerGoalId: dbProfile?.careerGoalId,
      careerGoalTitle: dbProfile?.careerGoalTitle,
      availableHoursPerDay: dbProfile?.availableHoursPerDay || 2,
      experienceLevel: dbProfile?.experienceLevel,
      isOnboarded: dbProfile ? dbProfile.isOnboarded : Boolean(sessionUser.user_metadata?.onboarded),
      createdAt: sessionUser.created_at,
    };
  };

  useEffect(() => {
    isMounted.current = true;

    if (!isSupabaseConfigured) {
      return;
    }

    // Initial session restoration from Supabase Auth
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted.current) return;
      if (session?.user) {
        const profile = await resolveUserProfile(session.user);
        if (isMounted.current) setUser(profile);
      }
      if (isMounted.current) setIsLoadingSession(false);
    }).catch((err) => {
      console.error('Error fetching initial session:', err);
      if (isMounted.current) setIsLoadingSession(false);
    });

    // Subscribe to runtime auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;
      if (session?.user) {
        const profile = await resolveUserProfile(session.user);
        if (isMounted.current) setUser(profile);
      } else if (event === 'SIGNED_OUT' || !session) {
        if (isMounted.current) setUser(null);
      }
      if (isMounted.current) setIsLoadingSession(false);
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const res = await authService.signIn(email, password);
    if (res.error) {
      return { error: res.error };
    }
    if (res.user) {
      setUser(res.user);
    }
    return { error: null };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ error: string | null }> => {
    const res = await authService.signUp(email, password, name);
    if (res.error) {
      return { error: res.error };
    }
    if (res.user) {
      await profileService.ensureProfile(res.user.id, name);
      setUser(res.user);
    }
    return { error: null };
  };

  const logout = async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
  };

  const updateOnboarding = (onboardingData: Partial<OnboardingState>) => {
    if (!user) return;
    const updated = { ...user, ...onboardingData };
    setUser(updated as UserProfile);
  };

  const completeOnboarding = (onboardingData: OnboardingState) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      name: onboardingData.name || user.name,
      educationLevel: onboardingData.educationLevel,
      field: onboardingData.field,
      careerGoalId: onboardingData.careerGoalId,
      careerGoalTitle: onboardingData.careerGoalId === 'software-developer' ? 'Software Developer' : 'Target Role',
      availableHoursPerDay: onboardingData.availableHoursPerDay,
      experienceLevel: onboardingData.experienceLevel,
      isOnboarded: true,
    };

    setUser(updated);

    // Persist to database asynchronously via RLS profileService
    profileService.upsertOnboarding(user.id, onboardingData).catch((err) => {
      console.error('Failed to persist onboarding state to Supabase:', err);
    });
  };

  if (isLoadingSession && isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Restoring session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        updateOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
