import { supabase } from '../../../core/database/supabaseClient';

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'follow';
  post_id: string | null;
  read: boolean;
  created_at: string;
  actor?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const NOTIFICATION_READ_EVENT = 'sportiq:notifications_read';

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }

  return count || 0;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!actor_id(full_name, avatar_url)
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return (data || []) as Notification[];
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATION_READ_EVENT));
  }
}

export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('recipient_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(NOTIFICATION_READ_EVENT));
  }
}
