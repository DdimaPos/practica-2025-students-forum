'use client';

import Link from 'next/link';

type ChannelCardProps = {
  id: number;
  name: string;
  usersCount: number;
};

export default function ChannelCard({
  id,
  name,
  usersCount,
}: ChannelCardProps) {
  return (
    <Link href={`/channels/${id}`}>
      <div className='mb-2 flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 shadow-md transition hover:shadow-lg border'>
        <span className='font-medium text-gray-800'>{name}</span>
        <span className='font-semibold text-green-600'>{usersCount} users</span>
      </div>
    </Link>
  );
}
