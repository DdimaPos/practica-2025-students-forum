import { getChannelsLeaderboard } from '../actions/getChannelsLeaderboard';
import ChannelCard from './ChannelCard';
import Link from 'next/link';

export default async function ChannelsLeaderboard() {
  const { channels } = await getChannelsLeaderboard();

  return (
    <div className='bg-background w-[100%] items-center justify-center rounded-lg p-10 pt-5 pb-5 text-center shadow-md'>
      <p className='mb-2 text-xl font-bold'>Most Popular Channels</p>
      {channels.map(channel => (
        <ChannelCard
          key={channel.id}
          id={channel.id}
          name={channel.name}
          usersCount={channel.postsCount + channel.reactionsCount}
        />
      ))}
      <Link
        className='text-sm text-gray-500 hover:underline'
        href={`/channels_leaderboard`}
      >
        Show more
      </Link>
    </div>
  );
}
