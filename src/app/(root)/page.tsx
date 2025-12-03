import PostsContainer from '@/features/postsContainer/PostsContainer';
import LeaderboardContainer from '@/features/HPLeaderboardContainer';

export default function HomePage() {
  return (
    <div className='flex flex-col gap-4 pt-2 md:max-h-[87vh] md:flex-row md:justify-between md:gap-0'>
      <div className='bg-background hide-scrollbar h-[50vh] w-full overflow-y-auto rounded-lg p-4 shadow-sm md:h-full md:w-6/9'>
        <PostsContainer />
      </div>

      <div className='bg-background hide-scrollbar w-full overflow-y-auto rounded-lg p-4 shadow-sm md:w-auto md:bg-transparent md:p-0 md:shadow-none'>
        <LeaderboardContainer />
      </div>
    </div>
  );
}
