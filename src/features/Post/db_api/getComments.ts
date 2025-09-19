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
  const rows = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      authorId: comments.authorId,
      parentComment: comments.parentCommentId,
      content: comments.content,
      isAnonymous: comments.isAnonymous,
      createdAt: comments.createdAt,
      firstName: users.firstName,
      lastName: users.lastName, 
      total: sql<number>`COUNT(*) OVER()`.as('total'),
    })
    .from(comments)
    .leftJoin(users, eq(users.id, comments.authorId))
    .where(and(eq(comments.postId, postId), isNull(comments.parentCommentId)))
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    return { comments: [], total: 0 };
  }

  const commentsList: CommentType[] = rows.map(row => {
    const authorName =
      row.isAnonymous || !row.authorId
        ? 'Anonymous'
        : `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim();

    return {
      id: row.id,
      postId: row.postId,
      authorId: row.authorId,
      parentComment: row.parentComment,
      content: row.content,
      isAnonymous: row.isAnonymous,
      createdAt: row.createdAt,
      authorName,
    };
  });

  return { comments: commentsList, total: rows[0].total };
}
