'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/features/Authentication/actions/logout';

export default function Logout() {
  return (
    <form action={logout}>
      <button
        type='submit'
        className='flex cursor-pointer items-center gap-2 transition-colors duration-300 hover:text-black'
      >
        <LogOut className='h-5 w-5' /> Log out
      </button>
    </form>
  );
}
