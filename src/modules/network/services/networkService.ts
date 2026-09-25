import { supabase } from '../../../core/database/supabaseClient';

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  recipient_profile?: {
    full_name: string;
    avatar_url: string | null;
    role: string | null;
  };
}

export const networkService = {
  async getConnections(userId: string): Promise<Connection[]> {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        recipient_profile:profiles!recipient_id(full_name, avatar_url, role)
      `)
      .eq('requester_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching connections:', error);
      throw error;
    }
    return data as any as Connection[];
  },

  async getConnectionStatus(requesterId: string, recipientId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('connections')
      .select('id')
      .eq('requester_id', requesterId)
      .eq('recipient_id', recipientId)
      .maybeSingle();

    if (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
    return !!data;
  },

  async follow(requesterId: string, recipientId: string): Promise<void> {
    const { error } = await supabase
      .from('connections')
      .insert({ requester_id: requesterId, recipient_id: recipientId });

    if (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  async unfollow(requesterId: string, recipientId: string): Promise<void> {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('requester_id', requesterId)
      .eq('recipient_id', recipientId);

    if (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }
};
