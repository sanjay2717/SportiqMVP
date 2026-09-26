ALTER TABLE public.connections
ADD CONSTRAINT no_self_follow CHECK (requester_id != recipient_id);
