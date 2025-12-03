import { VoteType } from '../types/VoteType';

export const getInitialVoteType = (
  userReaction?: 'upvote' | 'downvote' | null
): VoteType => {
  if (!userReaction) return VoteType.none;

  return userReaction === 'upvote' ? VoteType.upvote : VoteType.downvote;
};
