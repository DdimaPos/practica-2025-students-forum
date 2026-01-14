import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getChannels } from '@/utils/getChannels';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';
import { rateLimits } from '@/lib/ratelimits';

export async function GET() {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.channelView.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      ip_address: ip,
      endpoint: '/api/channels',
      limit_type: 'channel_view',
    });

    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const channels = await getChannels();

    Sentry.metrics.distribution('channels.get', Date.now() - startTime, {
      unit: 'milliseconds',
    });

    return NextResponse.json({ channels });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Channel fetch failed', {
      error_message: error.message,
      endpoint: '/api/channels',
    });

    Sentry.captureException(error, {
      tags: { endpoint: '/api/channels' },
    });

    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}
