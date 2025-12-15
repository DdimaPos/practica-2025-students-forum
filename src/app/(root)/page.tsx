import PostsContainer from '@/features/postsContainer/PostsContainer';
import LeaderboardContainer from '@/features/HPLeaderboardContainer';

export default function HomePage() {
  return (
    <div className='flex flex-col gap-4 pt-2 md:flex-row md:gap-10'>
      <div className='w-full md:w-2/3'>
        <PostsContainer />
      </div>

      <div className='hidden md:block md:w-1/3'>
        <div className='sticky top-[89px]'>
          <LeaderboardContainer />
        </div>
      </div>
    </div>
  );
}
