-- Migration 20260919000009: Phase 3E Deterministic Daily Learning Engine
-- Description: Add UNIQUE constraint on daily_tasks(roadmap_item_id, due_date), create secure RPC functions for daily task generation, completion, and uncompletion.

-- 1. SCHEMA CONSTRAINTS & INDEXES
-- Ensure same roadmap item does not produce duplicate tasks for the same due date
ALTER TABLE public.daily_tasks
ADD CONSTRAINT unique_daily_task_item_date UNIQUE (roadmap_item_id, due_date);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_due_date ON public.daily_tasks(due_date);

-- 2. SECURE DAILY TASK GENERATION RPC FUNCTION
CREATE OR REPLACE FUNCTION public.generate_daily_tasks(p_target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_roadmap_id UUID;
  r_item RECORD;
  v_tasks_generated INT := 0;
  v_target_date DATE;
BEGIN
  -- A. Obtain authenticated user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated request';
  END IF;

  v_target_date := COALESCE(p_target_date, CURRENT_DATE);

  -- B. Find user's active roadmap
  SELECT id INTO v_roadmap_id
  FROM public.roadmaps
  WHERE user_id = v_user_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_roadmap_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'no_active_roadmap',
      'tasks_generated', 0,
      'due_date', v_target_date
    );
  END IF;

  -- C. Loop through ordered roadmap items and insert missing daily tasks
  FOR r_item IN
    SELECT
      ri.id AS roadmap_item_id,
      ri.title AS item_title,
      ri.stage_number,
      s.name AS skill_name,
      s.category AS skill_category
    FROM public.roadmap_items ri
    LEFT JOIN public.skills s ON ri.skill_id = s.id
    WHERE ri.roadmap_id = v_roadmap_id
    ORDER BY ri.stage_number ASC, ri.skill_id ASC, ri.id ASC
  LOOP
    INSERT INTO public.daily_tasks (
      roadmap_item_id,
      title,
      topic,
      estimated_minutes,
      category,
      due_date
    )
    VALUES (
      r_item.roadmap_item_id,
      'Study Stage ' || r_item.stage_number || ': ' || r_item.item_title,
      r_item.item_title,
      45,
      COALESCE(r_item.skill_category, 'Learning'),
      v_target_date
    )
    ON CONFLICT (roadmap_item_id, due_date) DO NOTHING;

    IF FOUND THEN
      v_tasks_generated := v_tasks_generated + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'status', 'success',
    'roadmap_id', v_roadmap_id,
    'tasks_generated', v_tasks_generated,
    'due_date', v_target_date
  );
END;
$$;

-- 3. SECURE TASK COMPLETION RPC FUNCTION
CREATE OR REPLACE FUNCTION public.complete_daily_task(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_task_owner_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated request';
  END IF;

  -- Verify task exists and belongs to a roadmap owned by v_user_id
  SELECT r.user_id INTO v_task_owner_id
  FROM public.daily_tasks dt
  JOIN public.roadmap_items ri ON dt.roadmap_item_id = ri.id
  JOIN public.roadmaps r ON ri.roadmap_id = r.id
  WHERE dt.id = p_task_id;

  IF v_task_owner_id IS NULL OR v_task_owner_id <> v_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Daily task does not belong to user roadmap';
  END IF;

  -- Insert task completion idempotently
  INSERT INTO public.task_completions (user_id, daily_task_id)
  VALUES (v_user_id, p_task_id)
  ON CONFLICT (user_id, daily_task_id) DO NOTHING;

  RETURN jsonb_build_object(
    'status', 'success',
    'task_id', p_task_id
  );
END;
$$;

-- 4. SECURE TASK UNCOMPLETION RPC FUNCTION
CREATE OR REPLACE FUNCTION public.uncomplete_daily_task(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated request';
  END IF;

  DELETE FROM public.task_completions
  WHERE user_id = v_user_id AND daily_task_id = p_task_id;

  RETURN jsonb_build_object(
    'status', 'success',
    'task_id', p_task_id
  );
END;
$$;

-- 5. PRIVILEGE RESTRICTIONS FOR RPC FUNCTIONS
REVOKE ALL ON FUNCTION public.generate_daily_tasks(DATE) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_daily_tasks(DATE) FROM anon;
GRANT EXECUTE ON FUNCTION public.generate_daily_tasks(DATE) TO authenticated;

REVOKE ALL ON FUNCTION public.complete_daily_task(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_daily_task(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_daily_task(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.uncomplete_daily_task(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.uncomplete_daily_task(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.uncomplete_daily_task(UUID) TO authenticated;
