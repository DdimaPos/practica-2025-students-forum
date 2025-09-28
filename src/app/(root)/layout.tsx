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
        <div className='basis-1/4 shadow-[2px_0_5px_rgba(0,0,0,0.1)]'>
          <Navbar />
        </div>
        <main className='basis-3/4 bg-[#EDEDED] p-10'>
          <SearchBar />
          {children}
        </main>
      </SearchProvider>
    </div>
  );
}
