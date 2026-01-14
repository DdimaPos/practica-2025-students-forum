'use server';

import * as Sentry from '@sentry/nextjs';
import db from '@/db';
import { posts } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { sanitize, isValidUuid } from '@/lib/security';
import { getUser } from '@/utils/getUser';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';
import { rateLimits } from '@/lib/ratelimits';

export async function createPostAction(formData: {
  title: string;
  content: string;
  post_type?: 'basic' | 'poll' | 'event';
  channel_id?: string | null;
  is_anonymous?: boolean;
  is_active?: boolean;
}) {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.createPost.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'createPost',
      ip_address: ip,
      rate_limit_type: 'createPost',
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Too many requests' };
  }

  const user = await getUser();
  const author_id = user?.id;

  try {
    const { title, content, post_type, channel_id, is_anonymous, is_active } =
      formData;

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

    const sanitizedTitle = sanitize(title);
    const sanitizedContent = sanitize(content);

    if (!sanitizedTitle.trim() || !sanitizedContent.trim()) {
      throw new Error('Title and content cannot be empty after sanitization');
    }

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

    Sentry.logger.info('Post created', {
      action: 'createPost',
      post_id: newPost.id,
      post_type: post_type || 'basic',
      user_id: author_id,
      channel_id: channel_id || null,
      is_anonymous: is_anonymous || false,
      title_length: sanitizedTitle.length,
      content_length: sanitizedContent.length,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return {
      success: true,
      message: 'Post created successfully',
      post: newPost,
    };
  } catch (err) {
    const isErrorObject = err instanceof Error;
    const error = isErrorObject ? err : new Error(String(err));

    Sentry.logger.error('Post creation failed', {
      action: 'createPost',
      error_message: error.message,
      error_stack: error.stack,
      user_id: author_id,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { action: 'createPost' },
      extra: { user_id: author_id, ip_address: ip },
    });

    return {
      success: false,
      message: isErrorObject ? error.message : 'Internal server error',
    };
  }
}
