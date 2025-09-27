import Navbar from '@/features/navigation';
import SearchBar from '@/features/SearchBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex'>
      <Navbar />
      <main className='bg-secondary ml-[25%] min-h-screen basis-3/4 px-10 pt-5'>
        <SearchBar />
        {children}
      </main>
    </div>
  );
}
