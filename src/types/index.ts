export interface UserProfile {
  id: string;
  name: string;
  email: string;
  educationLevel?: string;
  field?: string;
  careerGoalId?: string;
  careerGoalTitle?: string;
  availableHoursPerDay?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  isOnboarded: boolean;
  createdAt: string;
}

export interface CareerOption {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  demandLevel: 'High' | 'Very High' | 'Moderate';
  avgSalaryRange: string;
  requiredSkillsCount: number;
  featured?: boolean;
}

export interface SkillNode {
  id: string;
  name: string;
  category: 'core' | 'framework' | 'tools' | 'soft-skills';
  level: 'essential' | 'recommended' | 'advanced';
  description: string;
  estimatedHours: number;
  status?: 'not-started' | 'in-progress' | 'completed';
}

export interface RoadmapStage {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  skills: SkillNode[];
  progressPercentage: number;
}

export interface DailyTask {
  id: string;
  title: string;
  topic: string;
  estimatedMinutes: number;
  category: string;
  completed: boolean;
  dueDate: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noIndex?: boolean;
}

export interface OnboardingState {
  step: number;
  name: string;
  educationLevel: string;
  field: string;
  careerGoalId: string;
  availableHoursPerDay: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}
