-- Migration 20260919000006: Harden submit_and_score_assessment RPC against re-submission and incomplete submissions

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
BEGIN
  -- 1. Check assessment existence, ownership, and current status
  SELECT user_id, status INTO v_user_id, v_status
  FROM public.assessments
  WHERE id = p_assessment_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized or assessment not found';
  END IF;

  IF v_status = 'completed' THEN
    RAISE EXCEPTION 'Assessment has already been submitted and completed';
  END IF;

  -- 2. Count total available assessment questions in the system (Denominator)
  SELECT COUNT(*) INTO v_total_questions
  FROM public.assessment_questions;

  IF v_total_questions = 0 THEN
    RAISE EXCEPTION 'No assessment questions exist in the system';
  END IF;

  -- 3. Count distinct questions answered by the authenticated user for this assessment
  SELECT COUNT(DISTINCT question_id) INTO v_answered_questions
  FROM public.assessment_answers
  WHERE assessment_id = p_assessment_id AND user_id = auth.uid();

  -- Reject incomplete assessment submissions
  IF v_answered_questions < v_total_questions THEN
    RAISE EXCEPTION 'Assessment is incomplete. All questions must be answered before submission';
  END IF;

  -- 4. Calculate correct answers against protected answer keys
  SELECT COUNT(*) INTO v_correct
  FROM public.assessment_answers aa
  JOIN public.assessment_answer_keys ak
    ON aa.question_id = ak.question_id AND aa.option_id = ak.correct_option_id
  WHERE aa.assessment_id = p_assessment_id AND aa.user_id = auth.uid();

  -- 5. Calculate score percentage based on total system questions
  v_score := ROUND((v_correct::NUMERIC / v_total_questions::NUMERIC) * 100, 1);

  -- 6. Update assessment status and score
  UPDATE public.assessments
  SET status = 'completed',
      score = v_score,
      completed_at = NOW()
  WHERE id = p_assessment_id AND user_id = auth.uid();

  -- 7. Return safe result JSON without revealing answer keys
  RETURN jsonb_build_object(
    'assessment_id', p_assessment_id,
    'total_questions', v_total_questions,
    'correct_answers', v_correct,
    'score_percentage', v_score
  );
END;
$$;

-- Explicitly enforce execution privileges
REVOKE EXECUTE ON FUNCTION public.submit_and_score_assessment(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_and_score_assessment(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_and_score_assessment(UUID) TO authenticated;
