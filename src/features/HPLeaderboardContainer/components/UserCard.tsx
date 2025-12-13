'use client';

import Link from 'next/link';
import { UserAvatar, UserName } from '@/components/generic/user';
import { Card } from '@/components/ui/card';

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
    <Link href={`/profile/${id}`}>
      <Card className='flex min-h-14 cursor-pointer flex-row items-center justify-between px-3 py-1.5 shadow-sm transition hover:shadow-md'>
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
      </Card>
    </Link>
  );
}
