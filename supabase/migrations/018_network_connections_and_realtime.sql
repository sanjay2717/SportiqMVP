CREATE TABLE public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'accepted' check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  constraint unique_connection unique (requester_id, recipient_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own connections"
ON public.connections FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users create connections they initiate"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users delete their own connections"
ON public.connections FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

GRANT SELECT, INSERT, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
