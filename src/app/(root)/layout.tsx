import Navbar from '@/features/navigation';
import SearchBar from '@/features/SearchBar';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <div className='flex'>
      <Navbar />
      <main className='ml-[25%] bg-secondary basis-3/4 p-10'>
        <SearchBar />
        {children}
      </main>
    </div>
  );
}
