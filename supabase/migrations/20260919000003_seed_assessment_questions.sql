-- Pathfinder Phase 2 Assessment Questions Reference Seed Migration
-- Description: Inserts production reference assessment questions, multiple-choice options, and secure answer keys for core skills.

-- 1. SEED ASSESSMENT QUESTIONS
INSERT INTO public.assessment_questions (id, skill_id, question_text, difficulty) VALUES
  ('c1111111-1111-4111-c111-111111111111', 'a1111111-1111-4111-b111-111111111111', 'Which of the following data structures in Python is mutable?', 'beginner'),
  ('c2222222-2222-4222-c222-222222222222', 'a3333333-3333-4333-b333-333333333333', 'Which SQL clause is used to filter aggregate groups created by a GROUP BY clause?', 'intermediate');

-- 2. SEED ASSESSMENT OPTIONS
INSERT INTO public.assessment_options (id, question_id, option_text) VALUES
  -- Options for Question 1 (Python)
  ('d1111111-1111-4111-d111-111111111111', 'c1111111-1111-4111-c111-111111111111', 'Tuple'),
  ('d1111111-1111-4111-d111-111111111112', 'c1111111-1111-4111-c111-111111111111', 'List'),
  ('d1111111-1111-4111-d111-111111111113', 'c1111111-1111-4111-c111-111111111111', 'String'),

  -- Options for Question 2 (SQL)
  ('d2222222-2222-4222-d222-222222222211', 'c2222222-2222-4222-c222-222222222222', 'WHERE'),
  ('d2222222-2222-4222-d222-222222222212', 'c2222222-2222-4222-c222-222222222222', 'HAVING'),
  ('d2222222-2222-4222-d222-222222222213', 'c2222222-2222-4222-c222-222222222222', 'ORDER BY');

-- 3. SEED SECURE ANSWER KEYS (0 Client SELECT Privileges)
INSERT INTO public.assessment_answer_keys (question_id, correct_option_id) VALUES
  ('c1111111-1111-4111-c111-111111111111', 'd1111111-1111-4111-d111-111111111112'),
  ('c2222222-2222-4222-c222-222222222222', 'd2222222-2222-4222-d222-222222222212');
