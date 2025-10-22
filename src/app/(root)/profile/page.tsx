import { ChartLineMultiple } from '@/features/Profile/chart-line-multiple';
import PostsContainer from '@/features/postsContainer/PostsContainer';
import Image from 'next/image';



async function fetchAppUser(baseUrl: string) {
  

  const res = await fetch(`${baseUrl}/api/user`, { cache: 'no-store' });

  if (!res.ok) {
    // If unauthorized or not found, return null so the UI can handle it
    return null;
  }

  // This endpoint returns just the application user row
  return (await res.json()) as {
    id: number;
    auth_id: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    user_type: string | null;
    profile_picture_url: string | null;
    bio: string | null;
    year_of_study: number | null;
    is_verified: boolean;
  } | null;
}


export default async function Profile() {
  

  // Determine base URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

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
