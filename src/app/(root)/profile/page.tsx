import { ChartLineMultiple } from '@/features/Profile/chart-line-multiple';
import UserPosts from './components/UserPosts';
import { getUserPosts } from './actions/getUserPosts';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/getUser';
import { UserAvatar, UserName } from '@/components/generic/user';

import { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'Profile page of the user',
};

export default async function Profile() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const { posts: userPosts } = await getUserPosts(user.id);

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <div className='bg-background text-foreground'>
      <main className='flex-1 p-6'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <section className='col-span-2 rounded-xl border bg-white p-8 shadow-sm'>
            <div className='bg-background text-foreground'>
              <UserAvatar
                profilePictureUrl={user.profilePictureUrl}
                firstName={user.firstName}
                lastName={user.lastName}
                className='mx-auto h-44 w-44'
              />
              <div className='text-center'>
                <h1 className='text-2xl font-semibold'>
                  <UserName
                    firstName={user.firstName}
                    lastName={user.lastName}
                    userType={user.userType}
                  />
                </h1>
                {user.bio && (
                  <p className='text-muted-foreground mt-2'>{user.bio}</p>
                )}
                <div className='bg-background text-foreground mt-4'>
                  <p>Joined: {joinedDate}</p>
                  {user.yearOfStudy && <p>Year of Study: {user.yearOfStudy}</p>}
                  <p>Email: {user.email}</p>
                </div>
              </div>
            </div>
          </section>

          <section className='col-span-1'>
            <ChartLineMultiple />
          </section>
        </div>

        <h2 className='mt-8 text-center text-lg font-semibold'>Your Posts</h2>

        <section className='scrollbar-hide mt-4 max-h-[80vh] overflow-y-auto rounded-lg bg-white p-4 shadow-sm'>
          <UserPosts initialPosts={userPosts} />
        </section>
      </main>
    </div>
  );
}
