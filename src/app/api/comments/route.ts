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

    const result = await db.insert(comments).values({
      postId: post_id,
      parentCommentId: parent_comment_id,
      authorId: author_id,
      content: content.trim(),
      isAnonymous: Boolean(isAnonymous),
      createdAt: new Date(),
      updatedAt: null,
    });

    console.log('Inserted comment:', result);

    return NextResponse.json({ ok: true, inserted: true }, { status: 201 });
  } catch (err) {
    console.error('Error in /api/comments POST', err);

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
