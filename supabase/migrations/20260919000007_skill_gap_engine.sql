-- Migration 20260919000007: Phase 3C Deterministic Skill Gap Engine
-- Description: Add required_level to career_skills and upgrade submit_and_score_assessment RPC for atomic per-skill user_skills updates.

-- 1. ADD required_level TO public.career_skills
ALTER TABLE public.career_skills
ADD COLUMN IF NOT EXISTS required_level INT NOT NULL DEFAULT 2 CHECK (required_level BETWEEN 1 AND 3);

-- 2. POPULATE DETERMINISTIC REQUIRED PROFICIENCY LEVELS FOR SEEDED CAREER SKILLS
-- Software Developer
UPDATE public.career_skills SET required_level = 2 WHERE career_id = '11111111-1111-4111-a111-111111111111' AND skill_id = 'a1111111-1111-4111-b111-111111111111'; -- Python: Intermediate
UPDATE public.career_skills SET required_level = 3 WHERE career_id = '11111111-1111-4111-a111-111111111111' AND skill_id = 'a2222222-2222-4222-b222-222222222222'; -- DSA: Advanced
UPDATE public.career_skills SET required_level = 2 WHERE career_id = '11111111-1111-4111-a111-111111111111' AND skill_id = 'a3333333-3333-4333-b333-333333333333'; -- SQL: Intermediate
UPDATE public.career_skills SET required_level = 2 WHERE career_id = '11111111-1111-4111-a111-111111111111' AND skill_id = 'a5555555-5555-4555-b555-555555555555'; -- JS/TS: Intermediate

-- Data Scientist
UPDATE public.career_skills SET required_level = 3 WHERE career_id = '22222222-2222-4222-a222-222222222222' AND skill_id = 'a1111111-1111-4111-b111-111111111111'; -- Python: Advanced
UPDATE public.career_skills SET required_level = 2 WHERE career_id = '22222222-2222-4222-a222-222222222222' AND skill_id = 'a2222222-2222-4222-b222-222222222222'; -- DSA: Intermediate
UPDATE public.career_skills SET required_level = 3 WHERE career_id = '22222222-2222-4222-a222-222222222222' AND skill_id = 'a3333333-3333-4333-b333-333333333333'; -- SQL: Advanced

-- DevOps Engineer
UPDATE public.career_skills SET required_level = 3 WHERE career_id = '33333333-3333-4333-a333-333333333333' AND skill_id = 'a7777777-7777-4777-b777-777777777777'; -- Linux: Advanced
UPDATE public.career_skills SET required_level = 2 WHERE career_id = '33333333-3333-4333-a333-333333333333' AND skill_id = 'a8888888-8888-4888-b888-888888888888'; -- Docker: Intermediate
UPDATE public.career_skills SET required_level = 2 WHERE career_id = '33333333-3333-4333-a333-333333333333' AND skill_id = 'a1111111-1111-4111-b111-111111111111'; -- Python: Intermediate

-- Frontend Engineer
UPDATE public.career_skills SET required_level = 2 WHERE career_id = '44444444-4444-4444-a444-444444444444' AND skill_id = 'a4444444-4444-4444-b444-444444444444'; -- HTML/CSS: Intermediate
UPDATE public.career_skills SET required_level = 3 WHERE career_id = '44444444-4444-4444-a444-444444444444' AND skill_id = 'a5555555-5555-4555-b555-555555555555'; -- JS/TS: Advanced
UPDATE public.career_skills SET required_level = 3 WHERE career_id = '44444444-4444-4444-a444-444444444444' AND skill_id = 'a6666666-6666-4666-b666-666666666666'; -- React: Advanced

-- 3. UPGRADE RPC SCORING FUNCTION TO ATOMICALLY SCORING AND UPSERTING user_skills PER SKILL
CREATE OR REPLACE FUNCTION public.submit_and_score_assessment(p_assessment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_status TEXT;
  v_total_questions INT;
  v_answered_questions INT;
  v_correct INT;
  v_score NUMERIC;
  r_skill RECORD;
  v_skill_total INT;
  v_skill_correct INT;
  v_skill_score INT;
  v_skills_updated INT := 0;
BEGIN
  -- 1. Validate assessment existence, ownership, and current status
  SELECT user_id, status INTO v_user_id, v_status
  FROM public.assessments
  WHERE id = p_assessment_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized or assessment not found';
  END IF;

  IF v_status = 'completed' THEN
    RAISE EXCEPTION 'Assessment has already been submitted and completed';
  END IF;

  -- 2. Count total available assessment questions in system (Overall Denominator)
  SELECT COUNT(*) INTO v_total_questions
  FROM public.assessment_questions;

  IF v_total_questions = 0 THEN
    RAISE EXCEPTION 'No assessment questions exist in the system';
  END IF;

  -- 3. Count distinct questions answered for this assessment by auth user
  SELECT COUNT(DISTINCT question_id) INTO v_answered_questions
  FROM public.assessment_answers
  WHERE assessment_id = p_assessment_id AND user_id = auth.uid();

  IF v_answered_questions < v_total_questions THEN
    RAISE EXCEPTION 'Assessment is incomplete. All questions must be answered before submission';
  END IF;

  -- 4. Calculate overall correct answers against protected answer keys
  SELECT COUNT(*) INTO v_correct
  FROM public.assessment_answers aa
  JOIN public.assessment_answer_keys ak
    ON aa.question_id = ak.question_id AND aa.option_id = ak.correct_option_id
  WHERE aa.assessment_id = p_assessment_id AND aa.user_id = auth.uid();

  -- Overall percentage
  v_score := ROUND((v_correct::NUMERIC / v_total_questions::NUMERIC) * 100, 1);

  -- 5. ATOMICALLY CALCULATE PER-SKILL SCORES & UPSERT user_skills
  -- Loop over each skill present in the assessment answers
  FOR r_skill IN
    SELECT DISTINCT aq.skill_id
    FROM public.assessment_answers aa
    JOIN public.assessment_questions aq ON aa.question_id = aq.id
    WHERE aa.assessment_id = p_assessment_id AND aa.user_id = auth.uid()
  LOOP
    -- Count questions for THIS skill in the assessment (Per-skill Denominator)
    SELECT COUNT(DISTINCT aq.id) INTO v_skill_total
    FROM public.assessment_answers aa
    JOIN public.assessment_questions aq ON aa.question_id = aq.id
    WHERE aa.assessment_id = p_assessment_id AND aa.user_id = auth.uid() AND aq.skill_id = r_skill.skill_id;

    -- Count correct answers for THIS skill
    SELECT COUNT(*) INTO v_skill_correct
    FROM public.assessment_answers aa
    JOIN public.assessment_questions aq ON aa.question_id = aq.id
    JOIN public.assessment_answer_keys ak ON aa.question_id = ak.question_id AND aa.option_id = ak.correct_option_id
    WHERE aa.assessment_id = p_assessment_id AND aa.user_id = auth.uid() AND aq.skill_id = r_skill.skill_id;

    IF v_skill_total > 0 THEN
      v_skill_score := ROUND((v_skill_correct::NUMERIC / v_skill_total::NUMERIC) * 100);

      -- Upsert user_skills for authenticated user & skill
      INSERT INTO public.user_skills (user_id, skill_id, mastery_level, status, updated_at)
      VALUES (auth.uid(), r_skill.skill_id, v_skill_score, 'completed', NOW())
      ON CONFLICT (user_id, skill_id)
      DO UPDATE SET
        mastery_level = EXCLUDED.mastery_level,
        status = 'completed',
        updated_at = NOW();

      v_skills_updated := v_skills_updated + 1;
    END IF;
  END LOOP;

  -- 6. Update assessment status and score
  UPDATE public.assessments
  SET status = 'completed',
      score = v_score,
      completed_at = NOW()
  WHERE id = p_assessment_id AND user_id = auth.uid();

  -- 7. Return safe aggregate result without exposing answer keys
  RETURN jsonb_build_object(
    'assessment_id', p_assessment_id,
    'total_questions', v_total_questions,
    'correct_answers', v_correct,
    'score_percentage', v_score,
    'skills_updated', v_skills_updated
  );
END;
$$;

-- Explicitly enforce execution privileges
REVOKE ALL ON FUNCTION public.submit_and_score_assessment(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_and_score_assessment(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_and_score_assessment(UUID) TO authenticated;
