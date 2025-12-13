'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

type ChannelCardProps = {
  id: string;
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
      <Card className='flex min-h-14 cursor-pointer flex-row items-center justify-between px-3 py-1.5 shadow-sm transition hover:shadow-md'>
        <span className='font-medium text-gray-800'>{name}</span>
        <span className='font-semibold text-green-600'>{usersCount} users</span>
      </Card>
    </Link>
  );
}
