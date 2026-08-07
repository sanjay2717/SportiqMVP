-- SELECT is broad (any authenticated user) so achievements can eventually surface on Public Profile too — same pattern already used for events. INSERT/UPDATE/DELETE stay self-only.

CREATE TABLE public.achievements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  issuer text,
  description text,
  start_date date,
  end_date date,
  icon_name text,
  image_url text,
  is_verified boolean default false,
  metric_value text,
  created_at timestamptz default now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view achievements"
ON public.achievements FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users manage their own achievements"
ON public.achievements FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users update their own achievements"
ON public.achievements FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users delete their own achievements"
ON public.achievements FOR DELETE USING (auth.uid() = profile_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
