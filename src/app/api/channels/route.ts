import { NextResponse } from 'next/server';
import { getChannels } from '@/utils/getChannels';

export async function GET() {
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
