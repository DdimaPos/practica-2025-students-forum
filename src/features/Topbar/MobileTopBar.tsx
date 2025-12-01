import Link from 'next/link';
import { getUser } from '@/utils/getUser';
import MobileMenu from './components/MobileMenu';
import MobileSearchBar from './components/MobileSearchBar';

export default async function MobileTopBar() {
  const user = await getUser();

  return (
    <header className='sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-gray-200/50 bg-white/70 px-4 py-3 backdrop-blur-sm'>
      <Link href='/' className='text-lg font-bold'>
        Peerplex
      </Link>

      <MobileSearchBar />

      <div className='flex items-center gap-3'>
        {user ? (
          <Link
            href='/posts/create-post'
            className='text-sm font-medium text-blue-600'
          >
            New Post
          </Link>
        ) : (
          <Link href='/login' className='text-sm font-medium text-blue-600'>
            Login
          </Link>
        )}

        <MobileMenu user={user} />
      </div>
    </header>
  );
}
