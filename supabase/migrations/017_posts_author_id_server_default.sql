-- Add default auth.uid() to author_id so client doesn't need to send it
ALTER TABLE public.posts ALTER COLUMN author_id SET DEFAULT auth.uid();
