'use server';

import db from '@/db';
import { posts, users, postReactions } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getUser } from '@/utils/getUser';
import type { PostListItem } from '@/features/postList/types/post';

export async function getUserPosts(
  userId: string,
  limit = 10,
  offset = 0
): Promise<{ posts: PostListItem[]; hasMore: boolean }> {
  try {
    const currentUser = await getUser();

    const results = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        postType: posts.postType,
        isAnonymous: posts.isAnonymous,
        authorId: posts.authorId,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorUserType: users.userType,
        authorProfilePictureUrl: users.profilePictureUrl,
        rating: sql<number>`COALESCE(SUM(
          CASE
            WHEN ${postReactions.reactionType} = 'upvote' THEN 1
            WHEN ${postReactions.reactionType} = 'downvote' THEN -1
            ELSE 0
          END
        ), 0)`.as('rating'),
        userReaction: currentUser
          ? sql<string | null>`MAX(
              CASE
                WHEN ${postReactions.userId} = ${currentUser.id} 
                THEN ${postReactions.reactionType}
                ELSE NULL
              END
            )`.as('user_reaction')
          : sql<string | null>`NULL`.as('user_reaction'),
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .leftJoin(postReactions, eq(postReactions.postId, posts.id))
      .where(eq(posts.authorId, userId))
      .groupBy(
        posts.id,
        posts.title,
        posts.content,
        posts.createdAt,
        posts.postType,
        posts.isAnonymous,
        posts.authorId,
        users.firstName,
        users.lastName,
        users.userType,
        users.profilePictureUrl
      )
      .orderBy(desc(posts.createdAt), desc(posts.id))
      .limit(limit)
      .offset(offset);

    const transformedResults: PostListItem[] = results.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      created_at: result.createdAt!.toISOString(),
      rating: result.rating,
      postType: result.postType,
      isAnonymous: result.isAnonymous,
      authorId: result.authorId,
      authorFirstName: result.authorFirstName,
      authorLastName: result.authorLastName,
      authorUserType: result.authorUserType,
      authorProfilePictureUrl: result.authorProfilePictureUrl,
      userReaction: result.userReaction as 'upvote' | 'downvote' | null,
    }));

    return {
      posts: transformedResults,
      hasMore: results.length === limit,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching user posts:', errorMessage);

    return {
      posts: [],
      hasMore: false,
    };
  }
}