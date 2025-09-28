import PostCard from './components/PostCard';
import {PostProp} from './types/post';

type PostsProps = {
  posts: PostProp[];
  loading: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
};

export default function Posts({posts, loading, hasMore = true, loadingMore = false}: PostsProps) {
  if (loading && (!posts || posts.length === 0)) {
    return <p>Loading posts...</p>;
  }

  if (!posts || posts.length === 0) {
    return <p>Still no posts here.</p>;
  }

  return (
    <>
      {posts.map(post => (
        <PostCard key={post.id} {...post} />
      ))}

      {hasMore && (
        <div className='flex h-10 items-center justify-center text-gray-500'>
          {loadingMore ? 'Loading more...' : 'Scroll for more posts'}
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className='flex h-10 items-center justify-center text-gray-400 text-sm'>
          You&apos;ve reached the end! 🎉
        </div>
      )}
    </>
  );
}
