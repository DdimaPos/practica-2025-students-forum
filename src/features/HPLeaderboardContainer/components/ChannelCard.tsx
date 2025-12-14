'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';

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
      <Card className='flex min-h-14 cursor-pointer flex-row flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 shadow-sm transition hover:shadow-md'>
        <span className='flex-1 font-medium text-gray-800'>{name}</span>
        <User className='h-5 w-5 text-blue-500' />
        <span className='text-gray-600'>
          {`${usersCount}`}
        </span>
      </Card>
    </Link>
  );
}
