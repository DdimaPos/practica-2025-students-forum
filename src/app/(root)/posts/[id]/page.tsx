import Post from '@/features/Post';
import {getPostById} from '@/features/Post/fetch/fetch';

export default async function PostPage({params}: {params: {id: string}}) {
  const parameters = await params;
  const id = await parameters.id;
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
