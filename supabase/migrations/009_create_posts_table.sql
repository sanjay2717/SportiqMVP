-- no likes/comments tables in this migration — interaction features (Like/Comment) are explicitly deferred, UI-only for now, real counters/threads are separate future schema work.

CREATE TABLE public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  sport text,
  created_at timestamptz default now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view posts"
ON public.posts FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users create their own posts"
ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users update their own posts"
ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users delete their own posts"
ON public.posts FOR DELETE USING (auth.uid() = author_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
