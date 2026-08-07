import { supabase } from '../../../core/database/supabaseClient';

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  sport: string | null;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const postService = {
  async getFeedPosts(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id (full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return (data as any) || [];
  },

  async createPost(payload: { content: string; image_url?: string; sport?: string }): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        content: payload.content,
        image_url: payload.image_url || null,
        sport: payload.sport || null,
      })
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error creating post:', error);
      throw error;
    }

    return data as any;
  },

  async uploadPostImage(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `posts/${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars') // Reusing the avatars bucket as instructed to avoid needing new bucket creation
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }
};
