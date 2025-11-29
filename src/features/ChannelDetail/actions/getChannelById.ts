'use server';

import db from '@/db';
import { channels, posts } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

export type ChannelDetail = {
  id: string;
  name: string;
  description: string | null;
  channelType: string;
  createdAt: Date | null;
  postCount: number;
};

export async function getChannelById(
  channelId: string
): Promise<ChannelDetail | null> {
  try {
    const channelResult = await db
      .select({
        id: channels.id,
        name: channels.name,
        description: channels.description,
        channelType: channels.channelType,
        createdAt: channels.createdAt,
      })
      .from(channels)
      .where(and(eq(channels.id, channelId), eq(channels.isApproved, true)))
      .limit(1);

    if (channelResult.length === 0) {
      return null;
    }

    const postCountResult = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.channelId, channelId), eq(posts.isActive, true)));

    const channel = channelResult[0];
    const postCount = Number(postCountResult[0]?.count || 0);

    return {
      id: channel.id,
      name: channel.name,
      description: channel.description,
      channelType: channel.channelType,
      createdAt: channel.createdAt,
      postCount: postCount,
    };
  } catch (error) {
    console.error('Error fetching channel:', channelId, error);

    return null;
  }
}
