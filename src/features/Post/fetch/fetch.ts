import db from '@/db';
import {posts, users} from '@/db/schema';
import {eq} from 'drizzle-orm';
import calculateRating from './calculateRating';
import {Post_type} from '@/features/Post/types/Post_type';

export async function getPostById(id: string): Promise<Post_type | null> {
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, Number(id)));

  if (result.length === 0) return null;

  const post = result[0];
  const rating = await calculateRating(Number(id));

  let authorName = 'Anonymous';
  if (post.authorId && !post.isAnonymous) {
    const authorResult = await db
      .select({name: users.firstName, lastName: users.lastName})
      .from(users)
      .where(eq(users.id, post.authorId));

    if (authorResult.length > 0) {
      authorName = `${authorResult[0].name} ${authorResult[0].lastName}`;
    }
  }

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
    rating,
    authorName,
  };
}

