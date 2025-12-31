'use server';

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
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.postVote.limit(ip);

  if (!success) {
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
  }

  return result;
}
