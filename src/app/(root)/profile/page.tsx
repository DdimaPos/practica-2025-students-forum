import { ChartLineMultiple } from '@/features/Profile/chart-line-multiple';
import UserPosts from './components/UserPosts';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { Metadata } from 'next';
import { getUser } from '@/utils/getUser';
import { getProfileStats } from './actions/getProfileStats';
import { getUserPosts } from './actions/getUserPosts';

export const metadata: Metadata = {
  description: 'Profile page of the user',
};

export default async function Profile() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const { postsCount, commentsCount } = await getProfileStats(user.id);
  const { posts } = await getUserPosts(user.id, 50);

  const fullName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown';

  return (
    <div className='bg-background text-foreground'>
      <main className='flex-1 p-6'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <section className='col-span-2 rounded-xl border bg-white p-8 shadow-sm'>
            <div className='bg-background text-foreground'>
              <Image
                src={user.profilePictureUrl || '/window.svg'}
                alt='Profile avatar'
                width={176}
                height={176}
                className='h-44 w-44 rounded-full object-cover'
              />
              <div className='text-center'>
                <h1 className='text-2xl font-semibold'>{fullName}</h1>
                <div className='bg-background text-foreground'>
                  <p>Joined us: {joinDate}</p>
                  <p>Total posts: {postsCount}</p>
                  <p>Total comments: {commentsCount}</p>
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
          <UserPosts initialPosts={posts} />
        </section>
      </main>
    </div>
  );
}
