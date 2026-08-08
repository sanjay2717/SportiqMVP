import { supabase } from '../../../core/database/supabaseClient';
import { Conversation, Message, ConversationWithProfiles } from '../types';

export const messageService = {
  /**
   * Fetch all conversations for a user, ordered by most recent message.
   */
  async getConversations(userId: string): Promise<ConversationWithProfiles[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_one_profile:profiles!participant_one(id, full_name, avatar_url, role),
        participant_two_profile:profiles!participant_two(id, full_name, avatar_url, role)
      `)
      .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    return data as any as ConversationWithProfiles[];
  },

  /**
   * Fetch messages for a specific conversation.
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data as Message[];
  },

  /**
   * Send a new message in a conversation.
   */
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Update parent conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as Message;
  },

  /**
   * Get an existing conversation between two users, or create a new one.
   */
  async getOrCreateConversation(currentUserId: string, otherUserId: string): Promise<string> {
    // Check if conversation exists (either direction)
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_one.eq.${currentUserId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${currentUserId})`)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      throw fetchError;
    }

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const { data: newConv, error: insertError } = await supabase
      .from('conversations')
      .insert({
        participant_one: currentUserId,
        participant_two: otherUserId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating conversation:', insertError);
      throw insertError;
    }

    return newConv.id;
  },

  /**
   * Subscribe to new messages for a specific conversation in real-time.
   */
  subscribeToMessages(conversationId: string, onNewMessage: (message: Message) => void) {
    const channel = supabase.channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
