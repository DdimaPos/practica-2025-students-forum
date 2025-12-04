'use server';

import db from '@/db';
import { posts, pollOptions } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { sanitize, isValidUuid } from '@/lib/security';

export async function createPollAction(formData: {
  title: string;
  content: string;
  author_id: string | null;
  channel_id?: string | null;
  is_anonymous?: boolean;
  is_active?: boolean;
  poll_options: string[];
}) {
  try {
    const {
      title,
      content,
      author_id,
      channel_id,
      is_anonymous,
      is_active,
      poll_options,
    } = formData;

    if (!title || !content || !author_id) {
      throw new Error(
        'Missing required fields: title, content, and author_id are required'
      );
    }

    if (!isValidUuid(author_id)) {
      throw new Error('Invalid author ID format');
    }

    if (channel_id && !isValidUuid(channel_id)) {
      throw new Error('Invalid channel ID format');
    }

    if (!poll_options || poll_options.length < 2) {
      throw new Error('At least 2 poll options are required');
    }

    const validOptions = poll_options
      .map(opt => sanitize(opt))
      .filter(opt => opt.trim().length > 0);

    if (validOptions.length < 2) {
      throw new Error('At least 2 non-empty poll options are required');
    }

    const sanitizedTitle = sanitize(title);
    const sanitizedContent = sanitize(content);

    if (!sanitizedTitle.trim() || !sanitizedContent.trim()) {
      throw new Error('Title and content cannot be empty after sanitization');
    }

    const newPost = await db.transaction(async (tx) => {
      const [post] = await tx
        .insert(posts)
        .values({
          title: sanitizedTitle,
          content: sanitizedContent,
          postType: 'poll',
          authorId: author_id,
          channelId: channel_id || null,
          isAnonymous: is_anonymous || false,
          isActive: is_active !== undefined ? is_active : true,
        })
        .returning();

      const pollOptionsData = validOptions.map((optionText, index) => ({
        postId: post.id,
        optionText: optionText.trim(),
        voteCount: 0,
        optionOrder: index + 1,
      }));

      await tx.insert(pollOptions).values(pollOptionsData);

      return post;
    });

    revalidatePath('/');

    return {
      success: true,
      message: 'Poll created successfully',
      data: newPost,
    };
  } catch (error) {
    console.error('Error creating poll:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create poll',
    };
  }
}
