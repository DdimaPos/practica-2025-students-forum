import Post from '@/features/PostContainer';
import { getPostById } from '@/features/PostContainer/actions/getPostById';
import CommentSection from '@/features/CommentsContainer';

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return (
      <div className='vertical-align:middle flex h-24 h-[80vh] items-center justify-center'>
        <p className='text-muted-foreground text-3xl'>Post not found</p>
      </div>
    );
  }

  return (
    <div className='mt-5 max-w-4xl'>
      <Post {...post} />

      <CommentSection postId={post.id} />
    </div>
  );
}
