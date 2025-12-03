'use client';

import Link from 'next/link';
import { UserAvatar, UserName } from '@/components/generic/user';

type UserCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  userType?: 'student' | 'verified' | 'admin' | null;
  avgRating: number;
  ratingsCount: number;
};

export default function UserCard({
  id,
  firstName,
  lastName,
  profilePictureUrl,
  userType,
  avgRating,
  ratingsCount,
}: UserCardProps) {
  return (
    <Link
      href={`/profile/${id}`}
      className='hover:bg-accent mb-2 flex items-center justify-between rounded-lg border-b px-2 pb-2 transition'
    >
      <div className='flex items-center space-x-3'>
        <UserAvatar
          profilePictureUrl={profilePictureUrl}
          firstName={firstName}
          lastName={lastName}
          className='h-10 w-10'
        />
        <UserName
          firstName={firstName}
          lastName={lastName}
          userType={userType}
          showLink={false}
          className='font-medium'
        />
      </div>
      <div className='text-sm text-gray-600'>
        ⭐ {avgRating.toFixed(1)} ({ratingsCount})
      </div>
    </Link>
  );
}
