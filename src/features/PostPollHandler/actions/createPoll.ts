'use server';

import * as Sentry from '@sentry/nextjs';
import db from '@/db';
import { posts, pollOptions } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { sanitize, isValidUuid } from '@/lib/security';
import { getUser } from '@/utils/getUser';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';
import { rateLimits } from '@/lib/ratelimits';

export async function createPollAction(formData: {
  title: string;
  content: string;
  channel_id?: string | null;
  is_anonymous?: boolean;
  is_active?: boolean;
  poll_options: string[];
}) {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.createPost.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'createPoll',
      ip_address: ip,
      rate_limit_type: 'createPost',
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Too many requests' };
  }

  const user = await getUser();
  const author_id = user?.id;

  try {
    const {
      title,
      content,
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

    const newPost = await db.transaction(async tx => {
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

    Sentry.logger.info('Poll created', {
      action: 'createPoll',
      post_id: newPost.id,
      user_id: author_id,
      channel_id: channel_id || null,
      is_anonymous: is_anonymous || false,
      poll_options_count: validOptions.length,
      title_length: sanitizedTitle.length,
      content_length: sanitizedContent.length,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return {
      success: true,
      message: 'Poll created successfully',
      data: newPost,
    };
  } catch (err) {
    const isErrorObject = err instanceof Error;
    const error = isErrorObject ? err : new Error(String(err));

    Sentry.logger.error('Poll creation failed', {
      action: 'createPoll',
      error_message: error.message,
      error_stack: error.stack,
      user_id: author_id,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { action: 'createPoll' },
      extra: { user_id: author_id, ip_address: ip },
    });

    return {
      success: false,
      message: isErrorObject ? error.message : 'Failed to create poll',
    };
  }
}
