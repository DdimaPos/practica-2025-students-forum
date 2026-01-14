'use server';

import * as Sentry from '@sentry/nextjs';
import db from '@/db';
import { channels, posts } from '@/db/schema';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { eq, and, count } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.channelView.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'getChannelById',
      channel_id: channelId,
      ip_address: ip,
      rate_limit_type: 'channelView',
    });
    redirect('/error');
  }

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

    Sentry.metrics.distribution('channel.getById', Date.now() - startTime, {
      unit: 'milliseconds',
    });

    return {
      id: channel.id,
      name: channel.name,
      description: channel.description,
      channelType: channel.channelType,
      createdAt: channel.createdAt,
      postCount: postCount,
    };

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Channel fetch failed', {
      action: 'getChannelById',
      channel_id: channelId,
      error_message: error.message,
    });

    Sentry.captureException(error, {
      tags: { action: 'getChannelById' },
    });

    return null;
  }
}
