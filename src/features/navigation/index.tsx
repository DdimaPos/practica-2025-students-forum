import NavLink from './components/NavLink';
import { navSections } from './constants/navSections';
import Logout from './components/Logout';
import { getUser } from '@/utils/getUser';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default async function Navbar() {
  let user;
  try {
    user = await getUser();
  } catch (err) {
    console.error('Failed to fetch user in Navbar:', err);
    user = null;
  }

  return (
    <nav className='fixed flex h-screen w-[25%] flex-col justify-center gap-15 border-r pl-[8%] text-[#818181]'>
      {navSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className='flex flex-col gap-5'>
          {section.map((item, index) => (
            <NavLink key={index} {...item} />
          ))}
        </div>
      ))}

      {user ? (
        <Logout />
      ) : (
        <Link
          href='/login'
          className='flex cursor-pointer items-center gap-2 transition-colors duration-300 hover:text-black'
        >
          <LogIn className='h-5 w-5' /> Login
        </Link>
      )}
    </nav>
  );
}
