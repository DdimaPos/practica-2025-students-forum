import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import db from '@/db';
import { comments } from '@/db/schema';
import { revalidateCommentsCache } from '@/lib/cache';
import { sanitize, isValidUuid } from '@/lib/security';
import { getUser } from '@/utils/getUser';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';

export async function POST(request: Request) {
  const startTime = Date.now();
  const ip = getFirstIP(request.headers.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.comment.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      ip_address: ip,
      endpoint: '/api/comments',
      limit_type: 'comment_creation',
    });

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

    const insertedComment = result[0];

    await revalidateCommentsCache(post_id.toString());

    // One wide log with all context at request completion
    Sentry.logger.info('Comment created successfully', {
      // Operation result
      comment_id: insertedComment.id,
      status_code: 201,
      duration: Date.now() - startTime,

      // User context
      user_id: author_id,
      is_anonymous: Boolean(isAnonymous),

      // Business context
      post_id: post_id,
      parent_comment_id: parent_comment_id,
      content_length: sanitizedContent.length,
      is_reply: parentCommentId !== null,

      // Request metadata
      endpoint: '/api/comments',
      method: 'POST',
      ip_address: ip,
    });

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
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Comment creation failed', {
      error_message: error.message,
      error_stack: error.stack,
      endpoint: '/api/comments',
      duration: Date.now() - startTime,
      ip_address: ip,
      user_id: authorId,
    });

    Sentry.captureException(error, {
      tags: { endpoint: '/api/comments' },
      extra: { ip, user_id: authorId },
    });

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
