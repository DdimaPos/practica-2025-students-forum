'use server';

import * as Sentry from '@sentry/nextjs';
import db from '@/db';
import { posts, comments } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function getProfileStats(userId: string) {
  const startTime = Date.now();

  try {
    // Get posts count
    const postsCount = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.authorId, userId), eq(posts.isActive, true)));

    // Get comments count
    const commentsCount = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.authorId, userId));

    const stats = {
      postsCount: postsCount[0]?.count || 0,
      commentsCount: commentsCount[0]?.count || 0,
    };

    Sentry.logger.info('Profile stats fetched', {
      action: 'getProfileStats',
      user_id: userId,
      posts_count: stats.postsCount,
      comments_count: stats.commentsCount,
      duration: Date.now() - startTime,
    });

    return stats;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Profile stats fetch failed', {
      action: 'getProfileStats',
      user_id: userId,
      error_message: error.message,
      error_stack: error.stack,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { action: 'getProfileStats' },
      extra: { user_id: userId },
    });

    return {
      postsCount: 0,
      commentsCount: 0,
    };
  }
}
