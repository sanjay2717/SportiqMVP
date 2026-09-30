-- Add positions jsonb to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS positions jsonb NOT NULL DEFAULT '{}'::jsonb;
