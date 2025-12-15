import { getChannelsLeaderboard } from '../actions/getChannelsLeaderboard';
import ChannelCard from './ChannelCard';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default async function ChannelsLeaderboard() {
  const { channels } = await getChannelsLeaderboard();

  return (
    <Card className='flex w-full flex-col gap-3 p-3 shadow-sm'>
      <p className='pl-3 text-lg font-bold'>Most Popular Channels</p>
      <div className='flex flex-col gap-3'>
        {channels.map((channel, index) => (
          <div
            key={channel.id}
            className={index >= 3 ? 'short:hidden hidden xl:block' : ''}
          >
            <ChannelCard
              id={channel.id}
              name={channel.name}
              usersCount={channel.postsCount + channel.reactionsCount}
            />
          </div>
        ))}
      </div>
      <Link
        className='pl-3 text-sm text-gray-500 hover:underline'
        href={`/leaderboard?tab=channels`}
      >
        Show more
      </Link>
    </Card>
  );
}
