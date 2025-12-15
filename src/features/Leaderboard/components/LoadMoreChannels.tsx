'use client';

import { useState } from 'react';
import { getChannelsLeaderboard } from '@/features/HPLeaderboardContainer/actions/getChannelsLeaderboard';
import ChannelCard from '@/features/HPLeaderboardContainer/components/ChannelCard';
import { Button } from '@/components/ui/button';

type LoadMoreChannelsProps = {
  initialOffset: number;
  limit: number;
  total: number;
};

type ChannelCardProps = {
  id: string;
  name: string;
  description: string | null;
  postsCount: number;
  reactionsCount: number;
};

export default function LoadMoreChannels({
  initialOffset,
  limit,
  total,
}: LoadMoreChannelsProps) {
  const [channels, setChannels] = useState<ChannelCardProps[]>([]);
  const [offset, setOffset] = useState(initialOffset);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const { channels: newChannels } = await getChannelsLeaderboard(limit, offset);
    setChannels(prev => [...prev, ...newChannels]);
    setOffset(prev => prev + limit);
    setLoading(false);
  }

  return (
    <div className='mt-1'>
      {channels.map(channel => (
        <ChannelCard
          key={channel.id}
          id={channel.id}
          name={channel.name}
          usersCount={channel.postsCount + channel.reactionsCount}
        />
      ))}

      {offset < total && (
        <div className="mt-4 text-center">
          <Button onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
