'use server';

import db from '@/db';
import { pollOptions, pollVotes } from '@/db/schema';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';

export interface PollOption {
  id: string;
  optionText: string;
  voteCount: number;
  optionOrder: number;
  hasVoted: boolean;
}

export async function getPollOptions(
  postId: string,
  userId?: string | null
): Promise<PollOption[]> {
  try {
    const options = await db
      .select({
        id: pollOptions.id,
        optionText: pollOptions.optionText,
        voteCount: pollOptions.voteCount,
        optionOrder: pollOptions.optionOrder,
      })
      .from(pollOptions)
      .where(eq(pollOptions.postId, postId))
      .orderBy(pollOptions.optionOrder);

    // If user is logged in, check which options they voted for
    let userVotes: string[] = [];

    if (userId) {
      const votes = await db
        .select({ pollOptionId: pollVotes.pollOptionId })
        .from(pollVotes)
        .where(eq(pollVotes.userId, userId));

      userVotes = votes
        .map(v => v.pollOptionId)
        .filter((id): id is string => id !== null);
    }

    return options.map(option => ({
      ...option,
      voteCount: option.voteCount ?? 0,
      hasVoted: userVotes.includes(option.id),
    }));
  } catch (error) {
    console.error('Error fetching poll options:', error);

    return [];
  }
}

export async function votePoll(
  pollOptionId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.postVote.limit(ip);

  if (!success) {
    return { success: false, message: 'Too many requests' };
  }

  try {
    // Get the option to find the postId
    const option = await db
      .select({ postId: pollOptions.postId })
      .from(pollOptions)
      .where(eq(pollOptions.id, pollOptionId))
      .limit(1);

    if (option.length === 0) {
      return { success: false, message: 'Poll option not found' };
    }

    const postId = option[0].postId;

    if (!postId) {
      return { success: false, message: 'Invalid poll option' };
    }

    // Check if user already voted on this poll
    const allOptionsForPost = await db
      .select({ id: pollOptions.id })
      .from(pollOptions)
      .where(eq(pollOptions.postId, postId));

    const optionIds = allOptionsForPost.map(opt => opt.id);

    const existingVotes = await db
      .select()
      .from(pollVotes)
      .where(
        and(
          eq(pollVotes.userId, userId)
          // Check if user voted for any option in this poll
        )
      );

    // Check if any existing vote is for this poll
    const hasVotedOnThisPoll = existingVotes.some(
      vote => vote.pollOptionId && optionIds.includes(vote.pollOptionId)
    );

    if (hasVotedOnThisPoll) {
      return { success: false, message: 'You have already voted on this poll' };
    }

    // Insert vote
    await db.insert(pollVotes).values({
      userId,
      pollOptionId,
    });

    // Get current vote count and increment
    const currentOption = await db
      .select({ voteCount: pollOptions.voteCount })
      .from(pollOptions)
      .where(eq(pollOptions.id, pollOptionId))
      .limit(1);

    const newVoteCount = (currentOption[0]?.voteCount ?? 0) + 1;

    await db
      .update(pollOptions)
      .set({ voteCount: newVoteCount })
      .where(eq(pollOptions.id, pollOptionId));

    return { success: true, message: 'Vote recorded successfully' };
  } catch (error) {
    console.error('Error voting on poll:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to vote',
    };
  }
}
