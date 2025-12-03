import { NextResponse } from 'next/server';
import db from '@/db';
import { comments } from '@/db/schema';
import { revalidateCommentsCache } from '@/lib/cache';
import { sanitize, isValidUuid, rateLimit } from '@/lib/security';

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

    if (!isValidUuid(postId) || !isValidUuid(authorId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // 10 comments per minute per user
    const { allowed } = rateLimit(`comment:${authorId}`, 10, 60000);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before commenting again.' },
        { status: 429 }
      );
    }

    if (parentCommentId && !isValidUuid(parentCommentId)) {
      return NextResponse.json({ error: 'Invalid parent comment ID' }, { status: 400 });
    }

    // Sanitize content to prevent XSS
    const sanitizedContent = sanitize(content);

    const author_id = String(authorId);
    const post_id = String(postId);
    const parent_comment_id = parentCommentId ? String(parentCommentId) : null;

    const result = await db
      .insert(comments)
      .values({
        postId: post_id,
        parentCommentId: parent_comment_id,
        authorId: author_id,
        content: sanitizedContent,
        isAnonymous: Boolean(isAnonymous),
        createdAt: new Date(),
        updatedAt: null,
      })
      .returning();

    console.log('Inserted comment:', result);

    const insertedComment = result[0];

    console.log(`✅ Comment ${insertedComment.id} created for post ${post_id}`);

    // Revalidate cache for comments
    await revalidateCommentsCache(post_id.toString());

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
