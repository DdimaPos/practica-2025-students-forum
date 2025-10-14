import ChannelCard from '@/features/HPLeaderboardContainer/components/ChannelCard';
import { getChannelsLeaderboard } from '@/features/HPLeaderboardContainer/actions/getChannelsLeaderboard';
import LoadMoreChannels from './LoadMoreChannels';

export default async function ChannelsLeaderboard() {
  const limit = 10;
  const { channels, total } = await getChannelsLeaderboard(limit, 0);

  return (
    <div className='bg-background rounded p-4 shadow-md'>
      <h2 className='mb-4 text-xl font-bold'>Users Leaderboard</h2>

      <div className='hide-scrollbar h-[67vh] overflow-y-auto'>
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
    </div>
  );
}
