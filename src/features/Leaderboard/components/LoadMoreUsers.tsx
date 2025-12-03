'use client';

import { useState } from 'react';
import { getUsersLeaderboard } from '../../HPLeaderboardContainer/actions/getUsersLeaderboard';
import UserCard from '../../HPLeaderboardContainer/components/UserCard';
import { Button } from '@/components/ui/button';

type LoadMoreUsersProps = {
  initialOffset: number;
  limit: number;
  total: number;
};

type UserCardProps = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
  userType: 'student' | 'verified' | 'admin' | null;
  avgRating: number;
  ratingsCount: number;
};

export default function LoadMoreUsers({
  initialOffset,
  limit,
  total,
}: LoadMoreUsersProps) {
  const [users, setUsers] = useState<UserCardProps[]>([]);
  const [offset, setOffset] = useState(initialOffset);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const { users: newUsers } = await getUsersLeaderboard(limit, offset);
    setUsers(prev => [...prev, ...newUsers]);
    setOffset(prev => prev + limit);
    setLoading(false);
  }

  return (
    <div className='mt-4'>
      {users.map(user => (
        <UserCard
          key={user.id}
          {...user}
          firstName={user.firstName ?? 'Unknown'}
          lastName={user.lastName ?? 'User'}
        />
      ))}

      {offset < total && (
        <div className='mt-4 text-center'>
          <Button onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
