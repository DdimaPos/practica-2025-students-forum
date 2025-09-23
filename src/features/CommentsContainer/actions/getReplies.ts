'use server';

import db from '@/db';
import { comments, users, commentReactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { CommentType } from '../types/Comment_type';

export async function getReplies(
  parentCommentId: number,
  limit = 5,
  offset = 0
): Promise<{
  comments: (CommentType & { repliesCount: number; rating: number })[];
  total: number;
}> {
  const child = alias(comments, 'child');

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
      repliesCount: sql<number>`COUNT(${child.id})`.as('repliesCount'),
      rating: sql<number>`
        COALESCE(SUM(
          CASE 
            WHEN ${commentReactions.reactionType} = 'upvote' THEN 1
            WHEN ${commentReactions.reactionType} = 'downvote' THEN -1
            ELSE 0
          END
        ), 0)
      `.as('rating'),
    })
    .from(comments)
    .leftJoin(users, eq(users.id, comments.authorId))
    .leftJoin(child, eq(child.parentCommentId, comments.id))
    .leftJoin(commentReactions, eq(commentReactions.commentId, comments.id))
    .where(eq(comments.parentCommentId, parentCommentId))
    .groupBy(
      comments.id,
      comments.postId,
      comments.authorId,
      comments.parentCommentId,
      comments.content,
      comments.isAnonymous,
      comments.createdAt,
      users.firstName,
      users.lastName
    )
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    return { comments: [], total: 0 };
  }

  const commentsList = rows.map(row => {
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
      repliesCount: row.repliesCount ?? 0,
      rating: row.rating ?? 0,
    };
  });

  return { comments: commentsList, total: rows[0].total };
}
