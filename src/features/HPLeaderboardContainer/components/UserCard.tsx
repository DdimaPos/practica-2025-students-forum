'use client';

import Link from 'next/link';
import { UserAvatar } from '@/components/generic/user';
import { Card } from '@/components/ui/card';
import { BadgeCheck, Star } from 'lucide-react';

type UserCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  userType?: 'student' | 'verified' | 'admin' | null;
  avgRating: number;
  ratingsCount: number;
};

function getDisplayName(
  firstName: string,
  lastName: string
): { full: string; short: string } {
  if (!firstName && !lastName) {
    return { full: 'Unknown User', short: 'Unknown' };
  }

  if (!lastName) {
    return { full: firstName || 'Unknown', short: firstName || 'Unknown' };
  }

  if (!firstName) {
    return { full: lastName, short: lastName };
  }

  const full = `${firstName} ${lastName}`;
  const short = `${firstName} ${lastName.charAt(0)}.`;

  return { full, short };
}

export default function UserCard({
  id,
  firstName,
  lastName,
  profilePictureUrl,
  userType,
  avgRating,
  ratingsCount,
}: UserCardProps) {
  const isVerified = userType === 'verified' || userType === 'admin';
  const { full, short } = getDisplayName(firstName, lastName);

  return (
    <Link href={`/profile/${id}`}>
      <Card className='flex min-h-14 cursor-pointer flex-row flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 shadow-sm transition hover:shadow-md'>
        <div className='flex min-w-0 flex-1 items-center space-x-3'>
          <UserAvatar
            profilePictureUrl={profilePictureUrl}
            firstName={firstName}
            lastName={lastName}
            className='h-10 w-10 shrink-0'
          />
          <span className='inline-flex items-center text-sm font-medium whitespace-nowrap xl:text-base'>
            <span className='hidden xl:inline'>{full}</span>
            <span className='inline xl:hidden'>{short}</span>
            {isVerified && (
              <BadgeCheck className='ml-1 inline-block h-4 w-4 shrink-0 text-blue-600' />
            )}
          </span>
        </div>
        <Star className='h-4 w-4 text-yellow-500' />
        <div className='text-gray-600'>
          {`${avgRating.toFixed(1)} (${ratingsCount})`}
        </div>
      </Card>
    </Link>
  );
}
