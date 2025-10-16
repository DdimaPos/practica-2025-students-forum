// import { ChartLineMultiple } from "@/features/Profile/chart-line-multiple";
// import PostsContainer from "@/features/postsContainer/PostsContainer";
// import Image from "next/image";

// export default function Profile() {
//   return (
//     <div className="bg-background text-foreground" >

//       <main className='flex-1 p-6'>
//         <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
//           <section className='col-span-2 rounded-xl border bg-white p-8 shadow-sm'>
//             <div className="bg-background text-foreground" >
//               <Image
//                 src='/window.svg'
//                 alt='Profile avatar'
//                 width={176}
//                 height={176}
//                 className='h-44 w-44 rounded-full object-cover'
//               />
//               <div className='text-center'>
//                 <h1 className='text-2xl font-semibold'>Macho Man - you are alive!</h1>
//                 <div className="bg-background text-foreground" >
//                   <p>Joined us: 24 july 2021</p>
//                   <p>Total posts: 2024</p>
//                   <p>Total comments: 1024</p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           <section className='col-span-1'>
//             <ChartLineMultiple />
//           </section>
//         </div>

//         <h2 className='mt-8 text-center text-lg font-semibold'>Your Posts</h2>

//         <section className='scrollbar-hide mt-4 max-h-[80vh] overflow-y-auto rounded-lg bg-white p-4 shadow-sm'>
//           <PostsContainer />
//         </section>
//       </main>
//     </div >
//   );
// }

'use client'; // Ensure this is a Client Component

import { useEffect, useState } from 'react';
import { ChartLineMultiple } from '@/features/Profile/chart-line-multiple';
import PostsContainer from '@/features/postsContainer/PostsContainer';
import Image from 'next/image';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUser(data);
        console.log(data)
      } catch (err) {
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-background text-foreground">
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="col-span-2 rounded-xl border bg-white p-8 shadow-sm">
            <div className="bg-background text-foreground">
              <Image
                src={user?.profilePictureUrl || '/window.svg'} // Fallback to default image
                alt="Profile avatar"
                width={176}
                height={176}
                className="h-44 w-44 rounded-full object-cover"
              />
              <div className="text-center">
                <h1 className="text-2xl font-semibold">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Macho Man - you are alive!'}
                </h1>
                <div className="bg-background text-foreground">
                  <p>Joined us: {new Date(user?.created_at).toLocaleDateString() || '24 July 2021'}</p>
                  <p>Total posts: {user?.totalPosts || 2024}</p> {/* Adjust based on actual data */}
                  <p>Total comments: {user?.totalComments || 1024}</p> {/* Adjust based on actual data */}
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-1">
            <ChartLineMultiple />
          </section>
        </div>

        <h2 className="mt-8 text-center text-lg font-semibold">Your Posts</h2>

        <section className="scrollbar-hide mt-4 max-h-[80vh] overflow-y-auto rounded-lg bg-white p-4 shadow-sm">
          <PostsContainer />
        </section>
      </main>
    </div>
  );
}