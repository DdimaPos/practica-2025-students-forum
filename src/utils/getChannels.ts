'use server';

import db from '@/db';
import { channels } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export type ChannelType = {
  id: string;
  name: string;
  description: string | null;
  channelType: string;
};

export async function getChannels(): Promise<ChannelType[]> {
  const rows = await db
    .select({
      id: channels.id,
      name: channels.name,
      description: channels.description,
      channelType: channels.channelType,
    })
    .from(channels)
    .where(eq(channels.isApproved, true))
    .orderBy(asc(channels.name));

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    channelType: row.channelType,
  }));
}