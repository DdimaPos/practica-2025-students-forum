import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import PostCard from './components/PostCard';
import { PostProp } from './types/post';

type PostsProps = {
  posts: PostProp[];
  loading: boolean;
  loadMore: () => void;
};

export default function Posts({ posts, loading, loadMore }: PostsProps) {
  const loaderRef = useInfiniteScroll(loadMore);

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

      <div
        ref={loaderRef}
        className='flex h-10 items-center justify-center text-gray-500'
      >
        Loading more...
      </div>
    </>
  );
}
