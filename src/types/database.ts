export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      careers: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          category: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          category?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          description: string | null;
          estimated_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          description?: string | null;
          estimated_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          category?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          description?: string | null;
          estimated_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      career_skills: {
        Row: {
          id: string;
          career_id: string;
          skill_id: string;
          importance: 'essential' | 'recommended' | 'advanced';
          created_at: string;
        };
        Insert: {
          id?: string;
          career_id: string;
          skill_id: string;
          importance?: 'essential' | 'recommended' | 'advanced';
          created_at?: string;
        };
        Update: {
          id?: string;
          career_id?: string;
          skill_id?: string;
          importance?: 'essential' | 'recommended' | 'advanced';
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          education_level: string | null;
          field_of_study: string | null;
          career_goal_id: string | null;
          available_learning_minutes: number;
          experience_level: 'beginner' | 'intermediate' | 'advanced' | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          education_level?: string | null;
          field_of_study?: string | null;
          career_goal_id?: string | null;
          available_learning_minutes?: number;
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          education_level?: string | null;
          field_of_study?: string | null;
          career_goal_id?: string | null;
          available_learning_minutes?: number;
          experience_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          status: 'not_started' | 'in_progress' | 'completed';
          mastery_level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          mastery_level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_id?: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          mastery_level?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          career_id: string | null;
          status: 'in_progress' | 'completed';
          score: number | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          career_id?: string | null;
          status?: 'in_progress' | 'completed';
          score?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          career_id?: string | null;
          status?: 'in_progress' | 'completed';
          score?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      assessment_questions: {
        Row: {
          id: string;
          skill_id: string;
          question_text: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          created_at: string;
        };
        Insert: {
          id?: string;
          skill_id: string;
          question_text: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          created_at?: string;
        };
        Update: {
          id?: string;
          skill_id?: string;
          question_text?: string;
          difficulty?: 'beginner' | 'intermediate' | 'advanced';
          created_at?: string;
        };
      };
      assessment_options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_text: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_text?: string;
        };
      };
      assessment_answers: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          question_id: string;
          option_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          question_id: string;
          option_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string;
          question_id?: string;
          option_id?: string;
          created_at?: string;
        };
      };
      roadmaps: {
        Row: {
          id: string;
          user_id: string;
          career_id: string | null;
          title: string;
          status: 'active' | 'paused' | 'completed';
          progress_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          career_id?: string | null;
          title: string;
          status?: 'active' | 'paused' | 'completed';
          progress_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          career_id?: string | null;
          title?: string;
          status?: 'active' | 'paused' | 'completed';
          progress_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      roadmap_items: {
        Row: {
          id: string;
          roadmap_id: string;
          stage_number: number;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          roadmap_id: string;
          stage_number: number;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          roadmap_id?: string;
          stage_number?: number;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      daily_tasks: {
        Row: {
          id: string;
          roadmap_item_id: string;
          title: string;
          topic: string;
          estimated_minutes: number;
          category: string;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          roadmap_item_id: string;
          title: string;
          topic: string;
          estimated_minutes?: number;
          category: string;
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          roadmap_item_id?: string;
          title?: string;
          topic?: string;
          estimated_minutes?: number;
          category?: string;
          due_date?: string | null;
          created_at?: string;
        };
      };
      task_completions: {
        Row: {
          id: string;
          user_id: string;
          daily_task_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_task_id: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_task_id?: string;
          completed_at?: string;
        };
      };
    };
    Functions: {
      generate_or_update_roadmap: {
        Args: Record<string, never>;
        Returns: Json;
      };
      generate_daily_tasks: {
        Args: { p_target_date?: string };
        Returns: Json;
      };
      complete_daily_task: {
        Args: { p_task_id: string };
        Returns: Json;
      };
      uncomplete_daily_task: {
        Args: { p_task_id: string };
        Returns: Json;
      };
    };
  };
}
