'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

type ChannelCardProps = {
  id: string;
  name: string;
  description: string | null;
  channelType: string;
};

export default function ChannelCard({
  id,
  name,
  description,
  channelType,
}: ChannelCardProps) {
  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      case 'announcements':
        return 'bg-yellow-100 text-yellow-800';
      case 'local':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/channels/${id}`}>
      <Card className='hover:border-primary h-full cursor-pointer shadow-sm transition-all hover:shadow-md'>
        <CardHeader>
          <div className='flex items-start justify-between gap-2'>
            <CardTitle className='text-xl'>{name}</CardTitle>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getChannelTypeColor(channelType)}`}
            >
              {channelType}
            </span>
          </div>
          {description && (
            <CardDescription className='line-clamp-2'>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
