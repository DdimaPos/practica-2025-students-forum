import PostsContainer from '@/features/postsContainer/PostsContainer';
import LeaderboardContainer from '@/features/HPLeadervoardContainer';

export default function HomePage() {
  return (
    <div className='flex max-h-[87vh] justify-between pt-2'>
      <div className='bg-background hide-scrollbar w-6/9 overflow-y-auto rounded-lg p-4 shadow-sm'>
        <PostsContainer />
      </div>

      <div className='hide-scrollbar overflow-y-auto'>
        <LeaderboardContainer />
      </div>
    </div>
  );
}
