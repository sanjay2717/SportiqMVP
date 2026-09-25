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
    role: string;
  };
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

export const postService = {
  async getFeedPosts(userId?: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id (full_name, avatar_url, role),
        likes:post_likes(user_id),
        comments:post_comments(id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return (data || []).map((post: any) => ({
      ...post,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
      isLiked: userId ? post.likes?.some((l: any) => l.user_id === userId) : false,
      author: post.author
    }));
  },

  async getPostsByAuthor(authorId: string, currentUserId?: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id (full_name, avatar_url, role),
        likes:post_likes(user_id),
        comments:post_comments(id)
      `)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching author posts:', error);
      throw error;
    }

    return (data || []).map((post: any) => ({
      ...post,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
      isLiked: currentUserId ? post.likes?.some((l: any) => l.user_id === currentUserId) : false,
      author: post.author
    }));
  },

  async createPost(payload: { content: string; image_url?: string; sport?: string }): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert({
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

  async updatePost(postId: string, userId: string, payload: { content: string }): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .update({ content: payload.content })
      .eq('id', postId)
      .eq('author_id', userId);

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  async uploadPostImage(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  async toggleLike(postId: string, userId: string, currentlyLiked: boolean): Promise<void> {
    if (currentlyLiked) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });
      if (error) throw error;
    }
  },

  async addComment(postId: string, userId: string, content: string): Promise<any> {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, content })
      .select('*, author:profiles!user_id(full_name, avatar_url)')
      .single();
    if (error) throw error;
    return data;
  },

  async getComments(postId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, author:profiles!user_id(full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }
};
