'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import * as Sentry from '@sentry/nextjs';

export async function revalidateCommentsCache(postId: string) {
  const newPostId = postId.replace(/\n|\r/g, '');

  try {
    revalidateTag(`comments-${newPostId}`);
    revalidatePath(`/posts/${newPostId}`);

    Sentry.logger.debug('Cache revalidated', {
      operation: 'revalidate',
      cache_key: `comments-${newPostId}`,
      post_id: newPostId,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Cache revalidation failed', {
      error_message: error.message,
      error_stack: error.stack,
      cache_key: `comments-${newPostId}`,
      post_id: newPostId,
      operation: 'revalidate',
    });

    Sentry.captureException(error, {
      tags: { operation: 'cache.revalidate' },
      extra: { post_id: newPostId },
    });
  }
}
