-- Migration 20260919000008: Phase 3D Deterministic Roadmap Engine
-- Description: Add skill_id to roadmap_items, RLS policies for roadmap_items, and generate_or_update_roadmap RPC function.

-- 1. SCHEMA ADDITION: Add skill_id to public.roadmap_items
ALTER TABLE public.roadmap_items
ADD COLUMN IF NOT EXISTS skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL;

-- Index for skill_id on roadmap_items
CREATE INDEX IF NOT EXISTS idx_roadmap_items_skill ON public.roadmap_items(skill_id);

-- 2. RLS POLICIES FOR public.roadmap_items WRITES
CREATE POLICY "Users can insert roadmap_items into own roadmaps" ON public.roadmap_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_items.roadmap_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update roadmap_items of own roadmaps" ON public.roadmap_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_items.roadmap_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete roadmap_items of own roadmaps" ON public.roadmap_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.roadmaps r
    WHERE r.id = roadmap_items.roadmap_id AND r.user_id = auth.uid()
  )
);

-- 3. DETERMINISTIC ROADMAP ENGINE RPC FUNCTION
CREATE OR REPLACE FUNCTION public.generate_or_update_roadmap()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_career_id UUID;
  v_career_title TEXT;
  v_completed_count INT;
  v_roadmap_id UUID;
  v_stage INT := 1;
  r_skill RECORD;
  v_items_created INT := 0;
BEGIN
  -- A. Obtain authenticated user ID from session
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated request';
  END IF;

  -- B. Obtain target career from profiles.career_goal_id
  SELECT career_goal_id INTO v_career_id
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_career_id IS NULL THEN
    RAISE EXCEPTION 'No career goal selected';
  END IF;

  -- Verify career exists in catalog
  SELECT title INTO v_career_title
  FROM public.careers
  WHERE id = v_career_id;

  IF v_career_title IS NULL THEN
    RAISE EXCEPTION 'Selected career not found in catalog';
  END IF;

  -- C. Verify completed assessment requirement
  SELECT COUNT(*) INTO v_completed_count
  FROM public.assessments
  WHERE user_id = v_user_id AND status = 'completed';

  IF v_completed_count = 0 THEN
    RAISE EXCEPTION 'No completed assessment found';
  END IF;

  -- D. Reuse existing active roadmap or create a new one
  SELECT id INTO v_roadmap_id
  FROM public.roadmaps
  WHERE user_id = v_user_id AND career_id = v_career_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_roadmap_id IS NULL THEN
    INSERT INTO public.roadmaps (user_id, career_id, title, status, progress_percentage)
    VALUES (v_user_id, v_career_id, v_career_title || ' Learning Roadmap', 'active', 0)
    RETURNING id INTO v_roadmap_id;
  ELSE
    UPDATE public.roadmaps
    SET updated_at = NOW()
    WHERE id = v_roadmap_id;

    -- Clear existing roadmap items for atomic regeneration
    DELETE FROM public.roadmap_items
    WHERE roadmap_id = v_roadmap_id;
  END IF;

  -- E. Query skills required for career, compute gap, and order deterministically
  FOR r_skill IN
    SELECT
      cs.skill_id,
      s.name AS skill_name,
      cs.importance,
      cs.required_level,
      COALESCE(
        CASE
          WHEN us.status = 'completed' AND us.mastery_level >= 70 THEN 3
          WHEN us.status = 'completed' AND us.mastery_level >= 40 THEN 2
          WHEN us.status = 'completed' THEN 1
          ELSE 0
        END, 0
      ) AS current_level,
      GREATEST(0, cs.required_level - COALESCE(
        CASE
          WHEN us.status = 'completed' AND us.mastery_level >= 70 THEN 3
          WHEN us.status = 'completed' AND us.mastery_level >= 40 THEN 2
          WHEN us.status = 'completed' THEN 1
          ELSE 0
        END, 0
      )) AS gap
    FROM public.career_skills cs
    JOIN public.skills s ON cs.skill_id = s.id
    LEFT JOIN public.user_skills us ON cs.skill_id = us.skill_id AND us.user_id = v_user_id
    WHERE cs.career_id = v_career_id
      AND GREATEST(0, cs.required_level - COALESCE(
        CASE
          WHEN us.status = 'completed' AND us.mastery_level >= 70 THEN 3
          WHEN us.status = 'completed' AND us.mastery_level >= 40 THEN 2
          WHEN us.status = 'completed' THEN 1
          ELSE 0
        END, 0
      )) > 0
    ORDER BY
      GREATEST(0, cs.required_level - COALESCE(
        CASE
          WHEN us.status = 'completed' AND us.mastery_level >= 70 THEN 3
          WHEN us.status = 'completed' AND us.mastery_level >= 40 THEN 2
          WHEN us.status = 'completed' THEN 1
          ELSE 0
        END, 0
      )) DESC, -- Primary: Higher gap first
      CASE cs.importance
        WHEN 'essential' THEN 1
        WHEN 'advanced' THEN 2
        WHEN 'recommended' THEN 3
        ELSE 4
      END ASC, -- Secondary: Importance
      s.name ASC -- Tertiary: Skill name tie-breaker
  LOOP
    INSERT INTO public.roadmap_items (roadmap_id, stage_number, skill_id, title, description)
    VALUES (
      v_roadmap_id,
      v_stage,
      r_skill.skill_id,
      'Advance ' || r_skill.skill_name,
      'Target: Level ' || r_skill.required_level || '. Current: ' ||
      CASE r_skill.current_level
        WHEN 0 THEN 'Not Assessed'
        WHEN 1 THEN 'Beginner'
        WHEN 2 THEN 'Intermediate'
        WHEN 3 THEN 'Advanced'
      END || '. Calculated Gap: ' || r_skill.gap || ' level(s).'
    );

    v_stage := v_stage + 1;
    v_items_created := v_items_created + 1;
  END LOOP;

  -- F. Return safe aggregate result
  RETURN jsonb_build_object(
    'roadmap_id', v_roadmap_id,
    'career_id', v_career_id,
    'career_title', v_career_title,
    'items_created', v_items_created
  );
END;
$$;

-- 4. PRIVILEGE CONFIGURATION
REVOKE ALL ON FUNCTION public.generate_or_update_roadmap() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_or_update_roadmap() FROM anon;
GRANT EXECUTE ON FUNCTION public.generate_or_update_roadmap() TO authenticated;
