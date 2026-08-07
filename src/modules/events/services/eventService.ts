import { supabase } from '../../../core/database/supabaseClient';

export interface SportEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  sport: string | null;
  created_by: string;
  created_at: string;
  creator_name?: string; // Joined from profiles
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  sport?: string;
  created_by: string;
}

export async function createEvent(payload: CreateEventPayload): Promise<SportEvent> {
  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data as SportEvent;
}

export async function getEvents(): Promise<SportEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  // Map the joined profile name directly to the event object for easier consumption
  return data.map((event: any) => ({
    ...event,
    creator_name: event.profiles?.full_name || 'Unknown',
  })) as SportEvent[];
}

export async function getEventById(id: string): Promise<SportEvent | null> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Row not found
      return null;
    }
    console.error('Error fetching event by id:', error);
    throw error;
  }

  return {
    ...data,
    creator_name: data.profiles?.full_name || 'Unknown',
  } as SportEvent;
}
