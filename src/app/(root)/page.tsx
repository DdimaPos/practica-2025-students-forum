import PostsContainer from '@/features/postsContainer/PostsContainer';

export default function HomePage() {
  return (
    <div className='flex justify-between py-2'>
      <div className='scrollbar-hide mb-4 max-h-[80vh] w-6/9 overflow-y-auto rounded-lg bg-white p-4 shadow-sm'>
        <PostsContainer />
      </div>

      <div className='w-1/5 bg-white'></div>
    </div>
  );
}
