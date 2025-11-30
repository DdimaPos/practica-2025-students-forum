// MobileTopBar.tsx
import Link from 'next/link';
import { getUser } from '@/utils/getUser';
import MobileMenu from './components/MobileMenu';

export default async function MobileTopBar() {
  const user = await getUser().catch(() => undefined);

  return (
    <header className='sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-3'>
      <Link href='/' className='text-lg font-bold'>
        Peerplex
      </Link>

      <div className='flex items-center gap-3'>
        {user ? (
          <span className='text-sm text-gray-600'>{user.firstName}</span>
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
