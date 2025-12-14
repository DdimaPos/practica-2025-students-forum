import { getUsersLeaderboard } from '../actions/getUsersLeaderboard';
import Link from 'next/link';
import UserCard from './UserCard';
import { Card } from '@/components/ui/card';

export default async function UsersLeaderboard() {
  const { users } = await getUsersLeaderboard();

  return (
    <Card className='flex w-full flex-col gap-3 p-3 shadow-sm'>
      <p className='pl-1 text-base font-semibold md:pl-3 md:text-lg'>
        Top Rated Students
      </p>
      <div className='flex flex-col gap-3'>
        {users.map((user, index) => (
          <div
            key={user.id}
            className={index >= 3 ? 'short:hidden hidden xl:block' : ''}
          >
            <UserCard
              {...user}
              firstName={user.firstName ?? 'Unknown'}
              lastName={user.lastName ?? 'User'}
            />
          </div>
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
