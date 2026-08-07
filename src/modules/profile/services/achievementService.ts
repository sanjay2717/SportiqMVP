import { supabase } from '../../../core/database/supabaseClient';

export interface Achievement {
  id: string;
  profile_id: string;
  title: string;
  issuer: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  icon_name: string | null;
  image_url: string | null;
  is_verified: boolean;
  metric_value: string | null;
  created_at: string;
}

export interface AchievementPayload {
  title: string;
  issuer?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  icon_name?: string | null;
  image_url?: string | null;
  metric_value?: string | null;
}

export async function getAchievements(profileId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('profile_id', profileId)
    .order('start_date', { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }
  
  return data as Achievement[];
}

export async function getAchievementById(id: string): Promise<Achievement | null> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }
  
  return data as Achievement;
}

export async function createAchievement(profileId: string, payload: AchievementPayload): Promise<Achievement> {
  const { data, error } = await supabase
    .from('achievements')
    .insert([{ profile_id: profileId, ...payload }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Achievement;
}

export async function updateAchievement(id: string, payload: AchievementPayload): Promise<Achievement> {
  const { data, error } = await supabase
    .from('achievements')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Achievement;
}

export async function deleteAchievement(id: string): Promise<void> {
  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}
