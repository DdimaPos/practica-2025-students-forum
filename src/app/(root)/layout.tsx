import Navbar from '@/features/navigation';
import SearchBar from '@/features/SearchBar';
import { SearchProvider } from '@/features/search/context/SearchContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex'>
      <SearchProvider>
        <Navbar />
        <main className='bg-secondary ml-[25%] min-h-screen basis-3/4 p-10'>
          <SearchBar />
          {children}
        </main>
      </SearchProvider>
    </div>
  );
}
