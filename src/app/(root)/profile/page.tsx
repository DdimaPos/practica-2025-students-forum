import { ChartLineMultiple } from '@/features/Profile/chart-line-multiple';
import PostsContainer from '@/features/postsContainer/PostsContainer';
import Image from 'next/image';
import { fetchAppUser } from '@/utils/fetchAppUser';

export default async function Profile() {
  // Determine base URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const appUser = await fetchAppUser(baseUrl);

  // Derive display values
  const displayFirstName = appUser?.first_name ?? 'null';
  const displayLastName = appUser?.last_name ?? 'null';
  const joinedText = 'Joined us: ' + 'unknown date';

  return (
    <div className='bg-background text-foreground'>
      <main className='flex-1 p-6'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <section className='col-span-2 rounded-xl border bg-white p-8 shadow-sm'>
            <div className='bg-background text-foreground'>
              <Image
                src='/window.svg'
                alt='Profile avatar'
                width={176}
                height={176}
                className='h-44 w-44 rounded-full object-cover'
              />
              <div className='text-center'>
                <h1 className='text-2xl font-semibold'>
                  {`${displayFirstName} ${displayLastName}`}
                </h1>
                <div className='bg-background text-foreground'>
                  <p>{joinedText}</p>
                  <p>Total posts: 2024</p>
                  <p>Total comments: 1024</p>
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
          <PostsContainer />
        </section>
      </main>
    </div>
  );
}
