import {TopBar} from '@/components/generic/TopBar';

export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <TopBar className='h-[5vh]' />
      <main className='flex h-[95vh] items-center justify-center'>
        {children}
      </main>
    </>
  );
}
