'use server';

import db from '@/db';
import { posts, channels, postReactions } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function getChannelsLeaderboard(): Promise<{
  channels: {
    id: number;
    name: string;
    description: string | null;
    postsCount: number;
    reactionsCount: number;
  }[];
  total: number;
}> {
  const rows = await db
    .select({
      id: channels.id,
      name: channels.name,
      description: channels.description,
      postsCount: sql<number>`COUNT(DISTINCT ${posts.id})`.as('postsCount'),
      reactionsCount: sql<number>`COUNT(${postReactions.id})`.as(
        'reactionsCount'
      ),
      total: sql<number>`COUNT(*) OVER()`.as('total'),
    })
    .from(channels)
    .leftJoin(posts, eq(posts.channelId, channels.id))
    .leftJoin(postReactions, eq(postReactions.postId, posts.id))
    .groupBy(channels.id, channels.name, channels.description)
    .orderBy(sql`COUNT(DISTINCT ${posts.id}) + COUNT(${postReactions.id}) DESC`)
    .limit(4)
    .offset(0);

  if (rows.length === 0) {
    return { channels: [], total: 0 };
  }

  const channelsList = rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    postsCount: row.postsCount ?? 0,
    reactionsCount: row.reactionsCount ?? 0,
  }));

  return { channels: channelsList, total: rows[0].total ?? 0 };
}
