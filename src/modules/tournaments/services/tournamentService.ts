import { supabase } from '../../../core/database/supabaseClient';

export interface Tournament {
  id: string;
  title: string;
  description: string | null;
  sport: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  organiser_id: string;
  created_at: string;
  organiser_name?: string;
  organiser_avatar?: string | null;
}

export interface CreateTournamentPayload {
  title: string;
  description?: string;
  sport?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  organiser_id: string;
}

export async function createTournament(payload: CreateTournamentPayload): Promise<Tournament> {
  const { data, error } = await supabase
    .from('tournaments')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }

  return data as Tournament;
}

export async function getTournaments(): Promise<Tournament[]> {
  const { data, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      profiles:organiser_id (
        full_name,
        avatar_url
      )
    `)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching tournaments:', error);
    throw error;
  }

  return data.map((t: any) => ({
    ...t,
    organiser_name: t.profiles?.full_name || 'Unknown',
    organiser_avatar: t.profiles?.avatar_url || null,
  })) as Tournament[];
}
