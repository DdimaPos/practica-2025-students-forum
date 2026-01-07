import { NextResponse } from 'next/server';
import { getChannels } from '@/utils/getChannels';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';
import { rateLimits } from '@/lib/ratelimits';

export async function GET() {
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.channelView.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const channels = await getChannels();

    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Error in channels API:', error);

    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}
