import Post from '@/features/PostContainer';
import { getPostById } from '@/features/PostContainer/actions/getPostById';
import CommentSection from '@/features/CommentsContainer';
import { getUser } from '@/utils/getUser';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id).catch(() => undefined);

  return {
    title: post?.title || 'Post not found',
    description: `${post?.content}`,
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  const post = await getPostById(id).catch(() => undefined);

  const user = await getUser().catch(() => undefined);

  if (!post) {
    return (
      <div className='vertical-align:middle flex h-24 h-[80vh] items-center justify-center'>
        <p className='text-muted-foreground text-3xl'>Post not found</p>
      </div>
    );
  }

  return (
    <div className='mt-5 max-w-4xl'>
      <Post {...post} userId={user?.id} />

      <CommentSection postId={post.id} />
    </div>
  );
}
