import Navbar from '@/features/navigation';
import MobileTopBar from '@/features/Topbar/MobileTopBar';
import SearchBar from '@/features/SearchBar';
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
      <div className='hidden md:flex'>
        <Navbar />
        <main className='bg-secondary ml-[25%] flex min-h-screen basis-3/4 flex-col gap-2 px-10 pt-5'>
          <SearchBar />
          {children}
        </main>
      </div>

      <div className='flex flex-col md:hidden'>
        <MobileTopBar />
        <main className='bg-secondary flex min-h-screen flex-col gap-2 px-4 pt-5'>
          <SearchBar />
          {children}
        </main>
      </div>
    </SearchProvider>
  );
}
