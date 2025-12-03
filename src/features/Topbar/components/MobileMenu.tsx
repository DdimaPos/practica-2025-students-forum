'use client';

import { Menu, LogIn } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import NavLink from '@/features/navigation/components/NavLink';
import Logout from '@/features/navigation/components/Logout';
import Link from 'next/link';
import { navSections } from '@/features/navigation/constants/navSections';
import { useState } from 'react';

type MobileMenuProps = {
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export default function MobileMenu({ user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className='text-gray-600'>
          <Menu className='h-6 w-6' />
        </button>
      </SheetTrigger>

      <SheetContent side='right' className='w-full sm:w-[400px]'>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className='ml-15 flex h-full flex-col justify-center gap-8 py-8 text-[#818181]'>
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className='flex flex-col gap-5'>
              {section.map((item, index) => (
                <div key={index} onClick={() => setOpen(false)}>
                  <NavLink {...item} />
                </div>
              ))}
            </div>
          ))}

          <div onClick={() => setOpen(false)}>
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
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
