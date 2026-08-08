-- Note: unlike posts/events/achievements, this is NOT broadly readable — RLS strictly scopes both tables to the two named participants only.
-- The unique constraint on (participant_one, participant_two) prevents duplicate conversation threads between the same two users — 
-- application code must always query in a consistent order or check both directions before inserting.

CREATE TABLE public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid references public.profiles(id) on delete cascade not null,
  participant_two uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  last_message_at timestamptz default now(),
  constraint unique_participants unique (participant_one, participant_two)
);

CREATE TABLE public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Strict: only participants can see their own conversations
CREATE POLICY "Participants can view their conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can start conversations they're part of"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Strict: only participants of the parent conversation can see/send messages
CREATE POLICY "Participants can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (auth.uid() = c.participant_one OR auth.uid() = c.participant_two)
  )
);

CREATE POLICY "Participants can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (auth.uid() = c.participant_one OR auth.uid() = c.participant_two)
  )
);

GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.messages TO authenticated;
