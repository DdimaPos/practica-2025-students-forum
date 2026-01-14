import * as Sentry from '@sentry/nextjs';
import db from '@/db';
import { postReactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

type ReactionType = 'upvote' | 'downvote';

export async function togglePostReaction(
  postId: string,
  userId: string,
  reactionType: ReactionType
) {
  const startTime = Date.now();

  try {
    // Check if user already has a reaction on this post
    const existingReaction = await db
      .select()
      .from(postReactions)
      .where(
        and(eq(postReactions.postId, postId), eq(postReactions.userId, userId))
      )
      .limit(1);

    if (existingReaction.length > 0) {
      const currentReaction = existingReaction[0];

      // If clicking the same reaction type, remove it (toggle off)
      if (currentReaction.reactionType === reactionType) {
        await db
          .delete(postReactions)
          .where(
            and(
              eq(postReactions.postId, postId),
              eq(postReactions.userId, userId)
            )
          );

        Sentry.logger.info('Post reaction removed', {
          action: 'togglePostReaction',
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType,
          vote_action: 'removed',
          duration: Date.now() - startTime,
        });

        return { success: true, action: 'removed', reactionType };
      }
      // If clicking different reaction type, update it
      else {
        await db
          .update(postReactions)
          .set({ reactionType })
          .where(
            and(
              eq(postReactions.postId, postId),
              eq(postReactions.userId, userId)
            )
          );

        Sentry.logger.info('Post reaction updated', {
          action: 'togglePostReaction',
          post_id: postId,
          user_id: userId,
          previous_reaction: currentReaction.reactionType,
          new_reaction: reactionType,
          vote_action: 'updated',
          duration: Date.now() - startTime,
        });

        return { success: true, action: 'updated', reactionType };
      }
    }

    // No existing reaction, create new one
    else {
      await db.insert(postReactions).values({
        postId,
        userId,
        reactionType,
      });

      Sentry.logger.info('Post reaction created', {
        action: 'togglePostReaction',
        post_id: postId,
        user_id: userId,
        reaction_type: reactionType,
        vote_action: 'created',
        duration: Date.now() - startTime,
      });

      return { success: true, action: 'created', reactionType };
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Post reaction toggle failed', {
      action: 'togglePostReaction',
      post_id: postId,
      user_id: userId,
      reaction_type: reactionType,
      error_message: error.message,
      error_stack: error.stack,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { action: 'togglePostReaction' },
      extra: { post_id: postId, user_id: userId, reaction_type: reactionType },
    });

    return { success: false, error: 'Failed to update reaction' };
  }
}
