import {postReactions} from '@/db/schema';
import db from '@/db';
import {eq} from 'drizzle-orm';

export default async function calculateRating(postId: number) {
  const reactions = await db
    .select()
    .from(postReactions)
    .where(eq(postReactions.postId, postId));

  let rating = 0;

  reactions.forEach(r => {
    if (r.reactionType === 'upvote') rating += 1;
    if (r.reactionType === 'downvote') rating -= 1;
  });

  return rating;
}
