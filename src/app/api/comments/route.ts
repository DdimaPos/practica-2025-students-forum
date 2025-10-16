import { NextResponse } from 'next/server';
import db from '@/db';
import { comments } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      postId,
      authorId,
      parentCommentId = null,
      content,
      isAnonymous = false,
    } = body;

    if (!postId || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const author_id = Number(authorId);
    const post_id = Number(postId);
    const parent_comment_id = parentCommentId ? Number(parentCommentId) : null;

    const result = await db
      .insert(comments)
      .values({
        postId: post_id,
        parentCommentId: parent_comment_id,
        authorId: author_id,
        content: content.trim(),
        isAnonymous: Boolean(isAnonymous),
        createdAt: new Date(),
        updatedAt: null,
      })
      .returning();

    console.log('Inserted comment:', result);

    const insertedComment = result[0];

    return NextResponse.json(
      {
        ok: true,
        inserted: true,
        comment: {
          id: insertedComment.id,
          postId: insertedComment.postId,
          authorId: insertedComment.authorId,
          parentCommentId: insertedComment.parentCommentId,
          content: insertedComment.content,
          isAnonymous: insertedComment.isAnonymous,
          createdAt: insertedComment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error in /api/comments POST', err);

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
