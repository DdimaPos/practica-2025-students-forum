import { getUsersLeaderboard } from '../actions/getUsersLeaderboard';
import Link from 'next/link';
import UserCard from './UserCard';
import { Card } from '@/components/ui/card';

export default async function UsersLeaderboard() {
  const { users } = await getUsersLeaderboard();

  return (
    <Card className='flex w-full flex-col gap-3 p-3 shadow-sm'>
      <p className='pl-3 text-lg font-bold'>Top Rated Students</p>
      <div className='flex flex-col gap-3'>
        {users.map(user => (
          <UserCard
            key={user.id}
            {...user}
            firstName={user.firstName ?? 'Unknown'}
            lastName={user.lastName ?? 'User'}
          />
        ))}
      </div>
      <Link
        className='pl-3 text-sm text-gray-500 hover:underline'
        href={`/leaderboard?tab=users`}
      >
        Show more
      </Link>
    </Card>
  );
}
