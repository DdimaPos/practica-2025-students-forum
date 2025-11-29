'use server';

import db from '@/db';
import { posts, users, postReactions } from '@/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export type ChannelPost = {
  id: string;
  title: string;
  content: string;
  postType: string;
  authorId: string | null;
  isAnonymous: boolean;
  createdAt: Date | null;
  rating: number;
  authorName: string;
};

export type SortOption = 'newest' | 'oldest' | 'popular';

export async function getChannelPosts(
  channelId: string,
  sortBy: SortOption = 'newest',
  limit: number = 50
): Promise<ChannelPost[]> {
  try {
    const baseQuery = db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        postType: posts.postType,
        authorId: posts.authorId,
        isAnonymous: posts.isAnonymous,
        createdAt: posts.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        rating: sql<number>`COALESCE(SUM(
          CASE
            WHEN ${postReactions.reactionType} = 'upvote' THEN 1
            WHEN ${postReactions.reactionType} = 'downvote' THEN -1
            ELSE 0
          END
        ), 0)`.as('rating'),
      })
      .from(posts)
      .leftJoin(users, eq(users.id, posts.authorId))
      .leftJoin(postReactions, eq(postReactions.postId, posts.id))
      .where(and(eq(posts.channelId, channelId), eq(posts.isActive, true)))
      .groupBy(posts.id, users.firstName, users.lastName);

    let query;

    if (sortBy === 'popular') {
      query = baseQuery.orderBy(desc(sql`rating`), desc(posts.createdAt));
    } else if (sortBy === 'oldest') {
      query = baseQuery.orderBy(asc(posts.createdAt));
    } else {
      query = baseQuery.orderBy(desc(posts.createdAt));
    }

    const result = await query.limit(limit);

    return result.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      postType: post.postType || 'basic',
      authorId: post.authorId,
      isAnonymous: post.isAnonymous || false,
      createdAt: post.createdAt,
      rating: post.rating,
      authorName:
        post.isAnonymous || !post.authorId
          ? 'Anonymous'
          : `${post.firstName ?? ''} ${post.lastName ?? ''}`.trim(),
    }));
  } catch (error) {
    console.error('Error fetching channel posts:', channelId, sortBy, error);

    return [];
  }
}
