import ChannelCard from '@/features/HPLeaderboardContainer/components/ChannelCard';
import { getChannelsLeaderboard } from '@/features/HPLeaderboardContainer/actions/getChannelsLeaderboard';
import LoadMoreChannels from './LoadMoreChannels';
import { Card } from '@/components/ui/card';

export default async function ChannelsLeaderboard() {
  const limit = 10;
  const { channels, total } = await getChannelsLeaderboard(limit, 0);

  return (
    <Card className='p-4 shadow-sm'>
      <h2 className='mb-4 text-xl font-bold'>Channels Leaderboard</h2>

      <div className='hide-scrollbar flex max-h-[67vh] flex-col gap-2 overflow-y-auto'>
        {channels.map(channel => (
          <ChannelCard
            key={channel.id}
            id={channel.id}
            name={channel.name}
            usersCount={channel.postsCount + channel.reactionsCount}
          />
        ))}
        <LoadMoreChannels initialOffset={limit} limit={limit} total={total} />
      </div>
    </Card>
  );
}
