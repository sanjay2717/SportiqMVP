-- Create sport_reports table (Internal Review Queue)
CREATE TABLE public.sport_reports (
    id uuid primary key default gen_random_uuid(),
    reported_by uuid references profiles(id) on delete set null,
    sport_name text not null,
    location text,
    popularity_note text,
    created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.sport_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own reports
CREATE POLICY "Users can submit sport reports"
    ON public.sport_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (reported_by = auth.uid());

-- Note: No SELECT/UPDATE/DELETE policy is added for users.
-- Only the service_role (backend/admins) will have access to read this internal queue.
