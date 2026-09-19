-- Pathfinder Phase 2 Database Schema & Security Migration
-- Target: PostgreSQL / Supabase
-- Description: Complete relational schema with RLS policies, strict foreign key constraints, 1:1 auth.users->profiles linkage, answer-key isolation, and ownership enforcement triggers.

-- 1. EXTENSIONS & UTILITY FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PUBLIC REFERENCE CATALOG TABLES
CREATE TABLE public.careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  description TEXT,
  estimated_hours INT DEFAULT 0 CHECK (estimated_hours >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.career_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  importance TEXT NOT NULL DEFAULT 'essential' CHECK (importance IN ('essential', 'recommended', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_career_skill UNIQUE (career_id, skill_id)
);

-- 3. USER PROFILES & USER SKILLS
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  education_level TEXT,
  field_of_study TEXT,
  career_goal_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,
  available_learning_minutes INT DEFAULT 120 CHECK (available_learning_minutes >= 0),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  mastery_level INT DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_skill UNIQUE (user_id, skill_id)
);

-- 4. ASSESSMENTS SCHEMA (Answer Key Isolated for Security)
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  score INT CHECK (score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_question_id_text UNIQUE (id, question_text)
);

CREATE TABLE public.assessment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  CONSTRAINT unique_option_question UNIQUE (id, question_id)
);

-- Mandatory Security Correction 4: Answer key stored separately, hidden from client RLS SELECT
CREATE TABLE public.assessment_answer_keys (
  question_id UUID PRIMARY KEY REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  correct_option_id UUID NOT NULL REFERENCES public.assessment_options(id) ON DELETE CASCADE
);

-- Mandatory Security Correction 1: Assessment answers enforced via composite foreign keys & uniqueness
CREATE TABLE public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.assessment_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_answer_option_belongs_to_question FOREIGN KEY (option_id, question_id) REFERENCES public.assessment_options(id, question_id) ON DELETE CASCADE,
  CONSTRAINT unique_assessment_question_answer UNIQUE (assessment_id, question_id)
);

-- 5. ROADMAPS & DAILY TASKS
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  stage_number INT NOT NULL CHECK (stage_number > 0),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_item_id UUID NOT NULL REFERENCES public.roadmap_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  estimated_minutes INT DEFAULT 45 CHECK (estimated_minutes > 0),
  category TEXT NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_task_id UUID NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_task_completion UNIQUE (user_id, daily_task_id)
);

-- Mandatory Security Correction 2: Trigger function checking task completion ownership
CREATE OR REPLACE FUNCTION public.verify_task_completion_ownership()
RETURNS TRIGGER AS $$
DECLARE
  task_owner_id UUID;
BEGIN
  SELECT r.user_id INTO task_owner_id
  FROM public.daily_tasks dt
  JOIN public.roadmap_items ri ON dt.roadmap_item_id = ri.id
  JOIN public.roadmaps r ON ri.roadmap_id = r.id
  WHERE dt.id = NEW.daily_task_id;

  IF task_owner_id IS NULL OR task_owner_id <> NEW.user_id THEN
    RAISE EXCEPTION 'Unauthorized: Daily task does not belong to user roadmap.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_task_completion_ownership
  BEFORE INSERT ON public.task_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.verify_task_completion_ownership();

-- 6. UPDATED_AT TRIGGERS
CREATE TRIGGER set_updated_at_careers BEFORE UPDATE ON public.careers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_skills BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_user_skills BEFORE UPDATE ON public.user_skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_roadmaps BEFORE UPDATE ON public.roadmaps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. AUTOMATIC SIGNUP PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. INDEXES FOR HIGH-PERFORMANCE SEARCH & FOREIGN KEYS
CREATE INDEX idx_profiles_career_goal ON public.profiles(career_goal_id);
CREATE INDEX idx_career_skills_career ON public.career_skills(career_id);
CREATE INDEX idx_career_skills_skill ON public.career_skills(skill_id);
CREATE INDEX idx_user_skills_user ON public.user_skills(user_id);
CREATE INDEX idx_assessments_user ON public.assessments(user_id);
CREATE INDEX idx_assessment_answers_assessment ON public.assessment_answers(assessment_id);
CREATE INDEX idx_roadmaps_user ON public.roadmaps(user_id);
CREATE INDEX idx_roadmap_items_roadmap ON public.roadmap_items(roadmap_id);
CREATE INDEX idx_daily_tasks_item ON public.daily_tasks(roadmap_item_id);
CREATE INDEX idx_task_completions_user ON public.task_completions(user_id);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- Public Reference Catalog Read Policies
CREATE POLICY "Public catalog careers selectable" ON public.careers FOR SELECT USING (true);
CREATE POLICY "Public catalog skills selectable" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public catalog career_skills selectable" ON public.career_skills FOR SELECT USING (true);
CREATE POLICY "Public assessment_questions selectable" ON public.assessment_questions FOR SELECT USING (true);
CREATE POLICY "Public assessment_options selectable" ON public.assessment_options FOR SELECT USING (true);

-- Answer key isolation policy: NO public SELECT policy on assessment_answer_keys

-- User-Owned Table Security Policies (auth.uid() = user_id / id)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own user_skills" ON public.user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own user_skills" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user_skills" ON public.user_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own user_skills" ON public.user_skills FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments" ON public.assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessments" ON public.assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessments" ON public.assessments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessment_answers" ON public.assessment_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessment_answers" ON public.assessment_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own roadmaps" ON public.roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON public.roadmaps FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view roadmap_items of own roadmaps" ON public.roadmap_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.roadmaps r WHERE r.id = roadmap_items.roadmap_id AND r.user_id = auth.uid())
);

CREATE POLICY "Users can view daily_tasks of own roadmaps" ON public.daily_tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roadmap_items ri
    JOIN public.roadmaps r ON ri.roadmap_id = r.id
    WHERE ri.id = daily_tasks.roadmap_item_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own task_completions" ON public.task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task_completions" ON public.task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own task_completions" ON public.task_completions FOR DELETE USING (auth.uid() = user_id);
