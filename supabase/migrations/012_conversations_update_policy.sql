CREATE POLICY "Participants can update their conversation metadata"
ON public.conversations FOR UPDATE
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

GRANT UPDATE ON public.conversations TO authenticated;
