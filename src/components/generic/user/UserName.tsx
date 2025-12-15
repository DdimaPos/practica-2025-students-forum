'use client';

import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserNameProps {
  firstName?: string | null;
  lastName?: string | null;
  userType?: 'student' | 'verified' | 'admin' | null;
  isAnonymous?: boolean | null;
  userId?: string | null;
  showLink?: boolean;
  showVerifiedBadge?: boolean;
  prefix?: string;
  className?: string;
  linkClassName?: string;
}

export function UserName({
  firstName,
  lastName,
  userType,
  isAnonymous,
  userId,
  showLink = false,
  showVerifiedBadge = true,
  prefix,
  className,
  linkClassName,
}: UserNameProps) {
  const displayName = isAnonymous
    ? 'Anonymous'
    : [firstName, lastName].filter(Boolean).join(' ') || 'Unknown User';

  const isVerified = userType === 'verified' || userType === 'admin';
  const canLink = showLink && userId && !isAnonymous;

  const nameContent = (
    <>
      {prefix && `${prefix} `}
      <span className={canLink ? linkClassName : undefined}>{displayName}</span>
      {showVerifiedBadge && isVerified && !isAnonymous && (
        <BadgeCheck className='ml-1 inline-block h-4 w-4 text-blue-600' />
      )}
    </>
  );

  if (canLink) {
    return (
      <span className={cn('inline-flex items-center', className)}>
        {prefix && <>{prefix}&nbsp;</>}
        <Link
          href={`/profile/${userId}`}
          className={cn('hover:text-blue-600 hover:underline', linkClassName)}
        >
          {displayName}
        </Link>
        {showVerifiedBadge && isVerified && (
          <BadgeCheck className='ml-1 inline-block h-4 w-4 text-blue-600' />
        )}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      {nameContent}
    </span>
  );
}
