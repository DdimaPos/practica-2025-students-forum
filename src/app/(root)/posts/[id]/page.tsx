import Post from '@/features/Post';
import { getPostById } from '@/features/Post/db_api/getPostById';
import { createClient } from '@/utils/supabase/server';
import CommentSection from '@/features/Post/components/Comments/CommentSection';

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className='mt-5 max-w-4xl'>
      <Post {...post} />

      <CommentSection postId={post.id} />

      <div className='bg-muted mt-6 rounded-lg border p-4'>
        {user ? (
          <p className='text-green-600'>
            ✅ Вы авторизованы как <b>{user.email}</b>
          </p>
        ) : (
          <p className='text-red-600'>
            ❌ Вы не вошли. Войдите или зарегистрируйтесь, чтобы отвечать на
            пост.
          </p>
        )}
      </div>
    </div>
  );
}
