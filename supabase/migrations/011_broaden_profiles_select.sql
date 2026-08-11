-- This codifies a policy that was applied directly via SQL Editor
-- earlier in the project (never captured as a migration file) — the
-- live database already has broader read access working for search/
-- feed/directory features, but that grant was never tracked in the
-- repo. This migration makes it idempotent and reproducible.

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

-- Note: this replaces the original self-only SELECT policy with a
-- broader one. Write policies (UPDATE own profile only) are UNCHANGED
-- and still correctly self-scoped — only READ access is broadened,
-- consistent with every directory/search/feed feature already built
-- assuming this is true.
