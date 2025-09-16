import Post from '@/features/Post';
import fetchPost from '@/features/Post/fetch/fetch';

export default async function PostPage(props: {params: Promise<{id: string}>}) {
  const {id} = await props.params;
  const post = await fetchPost(id);

  return (
    <div className='mt-5 max-w-4/6'>
      <Post {...post} />
    </div>
  );
}
