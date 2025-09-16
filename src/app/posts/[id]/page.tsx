type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
};

async function fetchPost(id: string): Promise<Post> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/posts/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Post not found');
  return res.json();
}

export default async function PostPage(props: {params: Promise<{id: string}>}) {
  const {id} = await props.params;
  const post = await fetchPost(id);

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold'>{post.title}</h1>
      <p className='mt-2'>{post.content}</p>
      <p className='mt-4 text-sm text-gray-500'>
        Author ID: {post.authorId}, created:{' '}
        {new Date(post.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
