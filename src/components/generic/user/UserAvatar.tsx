'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  profilePictureUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fallback?: string;
  className?: string;
}

export function UserAvatar({
  profilePictureUrl,
  firstName,
  lastName,
  fallback,
  className,
}: UserAvatarProps) {
  const getInitials = () => {
    if (fallback) return fallback;

    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';

    if (first || last) return `${first}${last}`;

    return 'U';
  };

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User';

  return (
    <Avatar className={cn('h-10 w-10', className)}>
      <AvatarImage
        src={profilePictureUrl ?? undefined}
        alt={fullName}
        className='object-cover'
      />
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
}
