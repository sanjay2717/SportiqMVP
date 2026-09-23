-- Migration 016: Handle new user creation with Google OAuth metadata
-- Safely replaces the existing trigger function to extract full_name and avatar_url from Google OIDC claims.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url,
    role
  )
  VALUES (
    NEW.id,
    -- Prefer explicit metadata (e.g. from custom email signup) but fallback to Google OIDC claims
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    -- Custom role provided during our custom email signup flow, otherwise NULL (e.g., Google OAuth first-time)
    NEW.raw_user_meta_data->>'role'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
