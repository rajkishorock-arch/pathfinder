import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export interface AuthResponse {
  user: UserProfile | null;
  error: string | null;
  requiresEmailConfirmation?: boolean;
}

function mapAuthError(errorMsg: string): string {
  const lower = errorMsg.toLowerCase();
  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('email_exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials') || lower.includes('wrong password')) {
    return 'Email or password is incorrect.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please check your inbox and confirm your email before signing in.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak_password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  }
  return 'Something went wrong while connecting. Please try again.';
}

export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      const mockUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: fullName,
        email,
        isOnboarded: false,
        createdAt: new Date().toISOString(),
      };
      return { user: mockUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { user: null, error: mapAuthError(error.message) };
      }

      if (!data.user) {
        return { user: null, error: 'Registration succeeded, but user data was not returned.' };
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        name: fullName || email.split('@')[0],
        email: data.user.email || email,
        isOnboarded: false,
        createdAt: data.user.created_at,
      };

      const requiresConfirmation = !data.session;
      return { user: userProfile, error: null, requiresEmailConfirmation: requiresConfirmation };
    } catch (e: unknown) {
      console.error('Auth signup exception:', e);
      return { user: null, error: 'Something went wrong while connecting. Please try again.' };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured) {
      const mockUser: UserProfile = {
        id: 'usr_demo',
        name: email.split('@')[0],
        email,
        isOnboarded: true,
        careerGoalId: 'software-developer',
        careerGoalTitle: 'Software Developer',
        availableHoursPerDay: 2,
        experienceLevel: 'intermediate',
        createdAt: new Date().toISOString(),
      };
      return { user: mockUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: mapAuthError(error.message) };
      }

      if (!data.user) {
        return { user: null, error: 'Authentication succeeded, but user session was not created.' };
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || email.split('@')[0],
        email: data.user.email || email,
        isOnboarded: true,
        createdAt: data.user.created_at,
      };

      return { user: userProfile, error: null };
    } catch (e: unknown) {
      console.error('Auth signin exception:', e);
      return { user: null, error: 'Something went wrong while connecting. Please try again.' };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? mapAuthError(error.message) : null };
    } catch (e: unknown) {
      console.error('Auth signout exception:', e);
      return { error: 'Failed to log out cleanly.' };
    }
  },

  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) return { error: null };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        console.warn('Password reset request error:', error.message);
      }
      return { error: null };
    } catch (e: unknown) {
      console.error('Password reset exception:', e);
      return { error: null };
    }
  },
};
