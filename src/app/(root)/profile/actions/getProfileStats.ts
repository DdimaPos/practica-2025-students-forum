'use server';

import db from '@/db';
import { posts, comments } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function getProfileStats(userId: string) {
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

    return {
      postsCount: postsCount[0]?.count || 0,
      commentsCount: commentsCount[0]?.count || 0,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching profile stats:', errorMessage);

    return {
      postsCount: 0,
      commentsCount: 0,
    };
  }
}
