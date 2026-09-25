-- Create the posts bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create the achievements bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achievements',
  'achievements',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Note: In Supabase, the storage.objects table handles all objects across all buckets.
-- We use the bucket_id to scope the policies.
-- The path in the bucket will be: {user_id}/{timestamp}.{ext}
-- We extract the user_id from the path using (storage.foldername(name))[1]

-- -----------------------------------------------------------------------------
-- Policies for 'posts' bucket
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Access for posts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own posts" ON storage.objects;
CREATE POLICY "Public Access for posts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload posts" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own posts" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- -----------------------------------------------------------------------------
-- Policies for 'achievements' bucket
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Access for achievements" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload achievements" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own achievements" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own achievements" ON storage.objects;
CREATE POLICY "Public Access for achievements" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'achievements');

CREATE POLICY "Authenticated users can upload achievements" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'achievements' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own achievements" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own achievements" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'achievements' AND auth.uid()::text = (storage.foldername(name))[1]);
