import { VoteType } from '../types/VoteType';
import { VoteResult } from '../types/VoteResult';

export const changeDynamicRating = (
  result: VoteResult,
  setDynamicRating: React.Dispatch<React.SetStateAction<number>>,
  setVoteType: React.Dispatch<React.SetStateAction<VoteType>>
) => {
  if (result.success === true) {
    switch (result.reactionType) {
      case VoteType.upvote:
        if (result.action === 'updated') {
          setDynamicRating(prev => Number(prev) + 2);
          setVoteType(VoteType.upvote);
        } else if (result.action === 'created') {
          setDynamicRating(prev => Number(prev) + 1);
          setVoteType(VoteType.upvote);
        } else if (result.action === 'removed') {
          setDynamicRating(prev => Number(prev) - 1);
          setVoteType(VoteType.none);
        }
        break;
      case VoteType.downvote:
        if (result.action === 'updated') {
          setDynamicRating(prev => Number(prev) - 2);
          setVoteType(VoteType.downvote);
        } else if (result.action === 'created') {
          setDynamicRating(prev => Number(prev) - 1);
          setVoteType(VoteType.downvote);
        } else if (result.action === 'removed') {
          setDynamicRating(prev => Number(prev) + 1);
          setVoteType(VoteType.none);
        }
        break;
      default:
        console.log('Changing rating went wrong.');
    }
  }
};
