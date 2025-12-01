// components/leaderboards/UsersLeaderboard.tsx
import { getUsersLeaderboard } from '../../HPLeaderboardContainer/actions/getUsersLeaderboard';
import UserCard from '../../HPLeaderboardContainer/components/UserCard';
import LoadMoreUsers from './LoadMoreUsers';
import { Card } from '@/components/ui/card';

export default async function UsersLeaderboard() {
  const limit = 10;
  const { users, total } = await getUsersLeaderboard(limit, 0);

  return (
    <Card className='p-4 shadow-sm'>
      <h2 className='mb-4 text-xl font-bold'>Users Leaderboard</h2>

      <div className='hide-scrollbar flex max-h-[67vh] flex-col gap-2 overflow-y-auto'>
        {users.map(user => (
          <UserCard
            key={user.id}
            {...user}
            firstName={user.firstName ?? 'Unknown'}
            lastName={user.lastName ?? 'User'}
          />
        ))}
        <LoadMoreUsers initialOffset={limit} limit={limit} total={total} />
      </div>
    </Card>
  );
}
