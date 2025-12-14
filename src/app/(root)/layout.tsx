import Navbar from '@/features/navigation';
import MobileTopBar from '@/features/Topbar/MobileTopBar';
import DesktopTopBar from '@/features/Topbar/DesktopTopBar';
import { SearchProvider } from '@/features/search/context/SearchContext';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SearchProvider>

      <Toaster />

      <div className='hidden md:block'>
        <DesktopTopBar />
        <div className='flex'>
          <Navbar />
          <main className='bg-secondary ml-[25%] min-h-screen basis-3/4 rounded-tl-xl border-t border-l border-gray-200/50 px-10 pt-4'>
            {children}
          </main>
        </div>
      </div>

      <div className='md:hidden'>
        <MobileTopBar />
        <main className='bg-secondary min-h-screen px-4 pt-2 pb-4 w-full'>
          {children}
        </main>
      </div>

    </SearchProvider>
  );
}
