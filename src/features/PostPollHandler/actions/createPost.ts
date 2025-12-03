'use server';

import db from '@/db';
import { posts } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { sanitize } from '@/lib/security';

export async function createPostAction(formData: {
  title: string;
  content: string;
  post_type?: 'basic' | 'poll' | 'event';
  author_id: string | null;
  channel_id?: string | null;
  is_anonymous?: boolean;
  is_active?: boolean;
}) {
  try {
    const {
      title,
      content,
      post_type,
      author_id,
      channel_id,
      is_anonymous,
      is_active,
    } = formData;

    if (!title || !content || !author_id) {
      throw new Error(
        'Missing required fields: title, content, and author_id are required'
      );
    }

    const sanitizedTitle = sanitize(title);
    const sanitizedContent = sanitize(content);

    const [newPost] = await db
      .insert(posts)
      .values({
        title: sanitizedTitle,
        content: sanitizedContent,
        postType: post_type || 'basic',
        authorId: author_id,
        channelId: channel_id || null,
        isAnonymous: is_anonymous || false,
        isActive: is_active !== undefined ? is_active : true,
      })
      .returning();

    revalidatePath('/');

    return {
      success: true,
      message: 'Post created successfully',
      post: newPost,
    };
  } catch (error) {
    console.error('Error creating post:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    };
  }
}
