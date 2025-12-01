'use server';

import db from '@/db';
import { postReactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

type ReactionType = 'upvote' | 'downvote';

export async function togglePostReaction(
  postId: string,
  userId: string,
  reactionType: ReactionType
) {
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

      return { success: true, action: 'created', reactionType };
    }
  } catch (error) {
    console.error('Error toggling post reaction:', error);

    return { success: false, error: 'Failed to update reaction' };
  }
}
