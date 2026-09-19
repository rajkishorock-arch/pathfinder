-- Migration 20260919000005: Create submit_and_score_assessment RPC function for secure scoring

CREATE OR REPLACE FUNCTION public.submit_and_score_assessment(p_assessment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_total INT;
  v_correct INT;
  v_score NUMERIC;
BEGIN
  -- 1. Verify assessment exists and belongs to the calling authenticated user
  SELECT user_id INTO v_user_id
  FROM public.assessments
  WHERE id = p_assessment_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized or assessment not found';
  END IF;

  -- 2. Count distinct questions answered for this assessment by the authenticated user
  SELECT COUNT(DISTINCT question_id) INTO v_total
  FROM public.assessment_answers
  WHERE assessment_id = p_assessment_id AND user_id = auth.uid();

  IF v_total = 0 THEN
    RAISE EXCEPTION 'No answers recorded for this assessment';
  END IF;

  -- 3. Calculate correct answers by comparing user answers against protected answer keys
  SELECT COUNT(*) INTO v_correct
  FROM public.assessment_answers aa
  JOIN public.assessment_answer_keys ak
    ON aa.question_id = ak.question_id AND aa.option_id = ak.correct_option_id
  WHERE aa.assessment_id = p_assessment_id AND aa.user_id = auth.uid();

  -- 4. Calculate score percentage rounded to 1 decimal place
  v_score := ROUND((v_correct::NUMERIC / v_total::NUMERIC) * 100, 1);

  -- 5. Update assessment status and score
  UPDATE public.assessments
  SET status = 'completed',
      score = v_score,
      completed_at = NOW()
  WHERE id = p_assessment_id AND user_id = auth.uid();

  -- 6. Return safe result JSON without revealing answer keys
  RETURN jsonb_build_object(
    'assessment_id', p_assessment_id,
    'total_questions', v_total,
    'correct_answers', v_correct,
    'score_percentage', v_score
  );
END;
$$;

-- Grant EXECUTE to authenticated users, revoke from anon
GRANT EXECUTE ON FUNCTION public.submit_and_score_assessment(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_and_score_assessment(UUID) FROM anon;
