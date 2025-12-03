'use server';

import db from '@/db';
import { posts, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getUserPosts(userId: string, limit = 10, offset = 0) {
  try {
    const results = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt), desc(posts.id))
      .limit(limit)
      .offset(offset);

    const transformedResults = results.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      author: `${result.authorFirstName} ${result.authorLastName}`,
      created_at: result.createdAt!.toISOString(),
      rating: 0,
      photo: '',
    }));

    return {
      posts: transformedResults,
      hasMore: results.length === limit,
    };
  } catch (error) {
    console.error('Error fetching user posts:', error);

    return {
      posts: [],
      hasMore: false,
    };
  }
}
