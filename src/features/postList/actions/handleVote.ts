'use server';

import { togglePostReaction } from './postVote';
import { getUser } from '@/utils/getUser';

export async function handleVote(
  postId: string,
  reactionType: 'upvote' | 'downvote'
) {
  const user = await getUser();

  if (!user || !user.id) {
    console.log('User not logged in. Cannot vote.');

    return { success: false, error: 'User not authenticated' };
  }

  const result = await togglePostReaction(postId, user.id, reactionType);

  return result;
}
