import {Filter} from 'lucide-react';
import {Button} from '@/components/ui/button';

export default function SearchBar() {
  return (
    <div className='flex w-full justify-between'>
      <div className='flex w-4/6 rounded-md border border-gray-300 bg-white px-3 py-2'>
        <input
          type='text'
          placeholder='Search...'
          className='flex-1 text-sm placeholder-gray-500 outline-none'
        />
        <Filter className='h-5 w-5 cursor-pointer text-gray-500 transition-colors hover:text-black' />
      </div>

      <Button>Write a new post</Button>
    </div>
  );
}
