import { createContext } from 'react';
import type { UserProfile, OnboardingState } from '@/types';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateOnboarding: (onboardingData: Partial<OnboardingState>) => void;
  completeOnboarding: (onboardingData: OnboardingState) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
