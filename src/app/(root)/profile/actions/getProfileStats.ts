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

    Sentry.metrics.distribution('profile.stats.posts_count', Date.now() - startTime, {
      unit: 'milliseconds',
    })

    return stats;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Profile stats fetch failed', {
      action: 'getProfileStats',
      error_message: error.message,
    });

    Sentry.captureException(error, {
      tags: { action: 'getProfileStats' },
    });

    return {
      postsCount: 0,
      commentsCount: 0,
    };
  }
}
