import { NextResponse } from 'next/server';
import db from '@/db';
import { comments } from '@/db/schema';
import { revalidateCommentsCache } from '@/lib/cache';
import { sanitize, isValidUuid } from '@/lib/security';
import { getUser } from '@/utils/getUser';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';

export async function POST(request: Request) {
  const ip = getFirstIP(request.headers.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.comment.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const user = await getUser();
  const authorId = user?.id;

  try {
    const body = await request.json();
    const {
      postId,
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

    if (parentCommentId && !isValidUuid(parentCommentId)) {
      return NextResponse.json(
        { error: 'Invalid parent comment ID' },
        { status: 400 }
      );
    }

    const sanitizedContent = sanitize(content);

    if (!sanitizedContent.trim()) {
      return NextResponse.json(
        { error: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

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
