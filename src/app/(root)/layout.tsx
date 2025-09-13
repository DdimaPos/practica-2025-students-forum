import Navbar from '@/features/navigation';
import SearchBar from '@/features/SearchBar';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <div className='flex'>
        <div className='basis-1/4 shadow-[2px_0_5px_rgba(0,0,0,0.1)]'>
          <Navbar />
        </div>
        <main className='bg-secondary basis-3/4 p-10'>
          <SearchBar />
          {children}
        </main>
      </div>
    </>
  );
}
