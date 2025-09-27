import PostsContainer from '@/features/postsContainer/PostsContainer';
import LeaderboardContainer from '@/features/HPLeadervoardContainer';

export default function HomePage() {
  return (
    <div className='flex justify-between pt-2 max-h-[87vh]'>
      <div className='w-6/9 overflow-y-auto rounded-lg bg-background p-4 shadow-sm hide-scrollbar'>
        <PostsContainer />
      </div>

      <div className='hide-scrollbar overflow-y-auto '>
        <LeaderboardContainer />
      </div>
    </div>
  );
}
