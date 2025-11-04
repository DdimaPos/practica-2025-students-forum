'use client';

import { useEffect, useState } from 'react';
import { ChartLineMultiple } from '@/features/Profile/chart-line-multiple';
import PostsContainer from '@/features/postsContainer/PostsContainer';
import Image from 'next/image';

interface User {
  firstName: string | null;
  lastName: string | null;
  email: string;
  created_at: string;
  profilePictureUrl?: string | null;
}

export default function ProfileClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('http://localhost:3000/api/user');

        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <div className='bg-background text-foreground'>
      <main className='flex-1 p-6'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <section className='col-span-2 rounded-xl border bg-white p-8 shadow-sm'>
            <div className='bg-background text-foreground text-center'>
              <Image
                src={user?.profilePictureUrl || '/globe.svg'}
                alt='Profile avatar'
                width={176}
                height={176}
                className='mx-auto h-44 w-44 rounded-full object-cover'
              />

              {loading ? (
                <h1 className='mt-4 text-xl font-semibold'>Loading...</h1>
              ) : (
                <h1 className='mt-4 text-2xl font-semibold'>
                  {user?.firstName || user?.lastName
                    ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
                    : 'NULL FETCHED USER From api '}
                </h1>
              )}

              <div className='mt-2 text-sm text-gray-600'>
                <p>
                  Joined us:{' '}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Unknown'}
                </p>
                <p>Total posts: 2024</p>
                <p>Total comments: 1024</p>
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
