import db from '@/db';
import { comments, users } from '@/db/schema';
import { eq, isNull, and, sql } from 'drizzle-orm';
import { CommentType } from '../types/Comment_type';

export async function getComments(
  postId: number,
  limit = 5,
  offset = 0
): Promise<{
  comments: CommentType[];
  total: number;
}> {
  //Counting total comments for the post excluding replies
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(and(eq(comments.postId, postId), isNull(comments.parentCommentId)));

  const total = totalResult[0]?.count ?? 0;

  //Fetching comments for the post excluding replies with pagination
  const result = await db
    .select()
    .from(comments)
    .where(and(eq(comments.postId, postId), isNull(comments.parentCommentId)))
    .limit(limit)
    .offset(offset);

  // Enriching comments with author names
  const enriched = await Promise.all(
    result.map(async comment => {
      let authorName = 'Anonymous';
      if (comment.authorId && !comment.isAnonymous) {
        const userResult = await db
          .select({ firstName: users.firstName, lastName: users.lastName })
          .from(users)
          .where(eq(users.id, comment.authorId));

        if (userResult.length > 0) {
          authorName = `${userResult[0].firstName} ${userResult[0].lastName}`;
        }
      }

      return {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        parentComment: comment.parentCommentId,
        content: comment.content,
        isAnonymous: comment.isAnonymous,
        createdAt: comment.createdAt,
        authorName,
      };
    })
  );

  return { comments: enriched, total };
}
