-- Pathfinder Phase 2 Security Correction: Restrict Assessment Content to Authenticated Users
-- Description: Revokes table-level SELECT on assessment_questions and assessment_options from anon, and restricts RLS SELECT policies strictly to authenticated role.

-- 1. REVOKE ANONYMOUS TABLE-LEVEL SELECT PRIVILEGES
REVOKE SELECT ON public.assessment_questions FROM anon;
REVOKE SELECT ON public.assessment_options FROM anon;

-- 2. REMOVE OLD PUBLIC RLS SELECT POLICIES
DROP POLICY IF EXISTS "Public assessment_questions selectable" ON public.assessment_questions;
DROP POLICY IF EXISTS "Public assessment_options selectable" ON public.assessment_options;

-- 3. CREATE AUTHENTICATED-ONLY RLS SELECT POLICIES
CREATE POLICY "Authenticated assessment_questions selectable"
  ON public.assessment_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated assessment_options selectable"
  ON public.assessment_options
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. RELOAD POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
