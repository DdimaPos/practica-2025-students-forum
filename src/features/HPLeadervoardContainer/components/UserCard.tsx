'use client';

import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type UserCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  avgRating: number;
  ratingsCount: number;
};

export default function UserCard({
  id,
  firstName,
  lastName,
  profilePictureUrl,
  avgRating,
  ratingsCount,
}: UserCardProps) {
  return (
    <Link
      href={`/profile/${id}`}
      className='hover:bg-accent mb-2 flex items-center justify-between rounded-lg border-b px-2 pb-2 transition'
    >
      <div className='flex items-center space-x-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage
            src={profilePictureUrl ?? undefined}
            alt={`${firstName} ${lastName}`}
          />
          <AvatarFallback>
            {firstName[0]}
            {lastName[0]}
          </AvatarFallback>
        </Avatar>
        <span className='font-medium'>
          {firstName} {lastName}
        </span>
      </div>
      <div className='text-sm text-gray-600'>
        ⭐ {avgRating.toFixed(1)} ({ratingsCount})
      </div>
    </Link>
  );
}
