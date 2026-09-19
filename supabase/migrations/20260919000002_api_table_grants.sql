-- Pathfinder Phase 2 Least-Privilege Data API Grants Migration
-- Description: Applies explicit least-privilege PostgreSQL table GRANTs to anon and authenticated API roles.
-- Protects answer keys with 0 client privileges while enabling PostgREST Data API access for catalog and user-owned tables.

-- 1. SCHEMA USAGE GRANTS
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. PUBLIC REFERENCE CATALOG READ GRANTS (anon & authenticated)
GRANT SELECT ON public.careers TO anon, authenticated;
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT SELECT ON public.career_skills TO anon, authenticated;

-- 3. ASSESSMENT CONTENT READ GRANTS (authenticated ONLY)
GRANT SELECT ON public.assessment_questions TO authenticated;
GRANT SELECT ON public.assessment_options TO authenticated;

-- 3. USER-OWNED APPLICATION TABLE GRANTS (authenticated ONLY, 0 privileges for anon)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.assessments TO authenticated;
GRANT SELECT, INSERT ON public.assessment_answers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.roadmaps TO authenticated;
GRANT SELECT ON public.roadmap_items TO authenticated;
GRANT SELECT ON public.daily_tasks TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.task_completions TO authenticated;

-- 4. ANSWER-KEY ISOLATION (STRICT ENFORCEMENT)
-- DO NOT GRANT ANY PRIVILEGES ON public.assessment_answer_keys TO anon OR authenticated ROLES.

-- 5. NOTIFY POSTGREST TO RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
