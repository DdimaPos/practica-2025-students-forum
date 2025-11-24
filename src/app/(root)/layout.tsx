import Navbar from '@/features/navigation';
import ConditionalSearchBar from '@/components/ConditionalSearchBar';
import { SearchProvider } from '@/features/search/context/SearchContext';
import { SearchBarProvider } from '@/contexts/SearchBarVisibilityContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex'>
      <SearchProvider>
        <SearchBarProvider>
          <Navbar />
          <main className='bg-secondary ml-[25%] flex min-h-screen basis-3/4 flex-col gap-2 px-10 pt-5'>
            <ConditionalSearchBar />
            {children}
          </main>
        </SearchBarProvider>
      </SearchProvider>
    </div>
  );
}
