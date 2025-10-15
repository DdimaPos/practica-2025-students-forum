'use server';

import db from '@/db';
import { posts, users, postReactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Post_type } from '../types/Post_type';

export async function getPostById(id: string): Promise<Post_type | null> {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      postType: posts.postType,
      authorId: posts.authorId,
      channelId: posts.channelId,
      isAnonymous: posts.isAnonymous,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      rating: sql<number>`COALESCE(SUM(
        CASE
          WHEN ${postReactions.reactionType} = 'upvote' THEN 1
          WHEN ${postReactions.reactionType} = 'downvote' THEN -1
          ELSE 0
        END
      ), 0)`.as('rating'),
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .leftJoin(postReactions, eq(postReactions.postId, posts.id))
    .where(eq(posts.id, id))
    .groupBy(posts.id, users.firstName, users.lastName);

  if (result.length === 0) return null;

  const post = result[0];
  const authorName =
    post.isAnonymous || !post.authorId
      ? 'Anonymous'
      : `${post.firstName ?? ''} ${post.lastName ?? ''}`.trim();

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    postType: post.postType,
    authorId: post.authorId,
    channelId: post.channelId,
    isAnonymous: post.isAnonymous,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    rating: post.rating,
    authorName,
  };
}
