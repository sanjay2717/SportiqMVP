-- reconstructed from live state, NOT APPLIED
-- Depends on: public.posts, public.profiles, and function public.handle_new_like()
-- (defined in 021_notifications_and_triggers.sql, not reproduced here).

CREATE TABLE IF NOT EXISTS public.post_likes (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  post_id     uuid        NOT NULL,
  user_id     uuid        NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Auto-names the check post_likes_reaction_type_check, matching live.
ALTER TABLE public.post_likes
  ADD COLUMN IF NOT EXISTS reaction_type text NOT NULL DEFAULT 'like'
  CHECK (reaction_type IN ('like','love','support','congrats','insightful'));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conrelid='public.post_likes'::regclass AND conname='post_likes_pkey') THEN
    ALTER TABLE public.post_likes ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conrelid='public.post_likes'::regclass AND conname='post_likes_post_id_fkey') THEN
    ALTER TABLE public.post_likes ADD CONSTRAINT post_likes_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conrelid='public.post_likes'::regclass AND conname='post_likes_user_id_fkey') THEN
    ALTER TABLE public.post_likes ADD CONSTRAINT post_likes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conrelid='public.post_likes'::regclass AND conname='post_likes_post_id_user_id_key') THEN
    ALTER TABLE public.post_likes ADD CONSTRAINT post_likes_post_id_user_id_key UNIQUE (post_id, user_id);
  END IF;
END $$;

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public likes view" ON public.post_likes;
CREATE POLICY "Public likes view" ON public.post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like" ON public.post_likes;
CREATE POLICY "Users can like" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike" ON public.post_likes;
CREATE POLICY "Users can unlike" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own likes" ON public.post_likes;
CREATE POLICY "Users can update their own likes" ON public.post_likes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- REFERENCES/TRIGGER/TRUNCATE on all three roles come from the public-schema
-- default ACL, so only the CRUD grants are stated here.
GRANT SELECT ON public.post_likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_likes TO authenticated, service_role;

DROP TRIGGER IF EXISTS on_like_created ON public.post_likes;
CREATE TRIGGER on_like_created
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();
