'use server';

import * as Sentry from '@sentry/nextjs';
import { togglePostReaction } from './postVote';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/utils/getUser';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';
import { rateLimits } from '@/lib/ratelimits';

export async function handleVote(
  postId: string,
  reactionType: 'upvote' | 'downvote'
) {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.postVote.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'handleVote',
      post_id: postId,
      reaction_type: reactionType,
      ip_address: ip,
      rate_limit_type: 'postVote',
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Too many requests' };
  }

  const user = await getUser();

  if (!user || !user.id) {
    console.log('User not logged in. Cannot vote.');

    return { success: false, error: 'User not authenticated' };
  }

  const result = await togglePostReaction(postId, user.id, reactionType);

  if (result.success) {
    revalidatePath('/posts');

    Sentry.logger.info('Vote handled', {
      action: 'handleVote',
      post_id: postId,
      user_id: user.id,
      reaction_type: reactionType,
      vote_action: result.action,
      ip_address: ip,
      duration: Date.now() - startTime,
    });
  }

  return result;
}
