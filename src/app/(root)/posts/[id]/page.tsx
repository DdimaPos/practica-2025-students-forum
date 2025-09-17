import Post from '@/features/Post';
import { getPostById } from '@/features/Post/fetch/fetch';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className='mt-5 max-w-4xl'>
      <Post {...post} />
    </div>
  );
}
