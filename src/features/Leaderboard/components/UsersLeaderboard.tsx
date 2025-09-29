// components/leaderboards/UsersLeaderboard.tsx
import { getUsersLeaderboard } from '../../HPLeaderboardContainer/actions/getUsersLeaderboard';
import UserCard from '../../HPLeaderboardContainer/components/UserCard';
import LoadMoreUsers from './LoadMoreUsers';

export default async function UsersLeaderboard() {
  const limit = 10;
  const { users, total } = await getUsersLeaderboard(limit, 0);

  return (
    <div className='bg-background rounded p-4 shadow-md'>
      <h2 className='mb-4 text-xl font-bold'>Users Leaderboard</h2>

      <div className='hide-scrollbar h-[67vh] overflow-y-auto'>
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

    </div>
  );
}
