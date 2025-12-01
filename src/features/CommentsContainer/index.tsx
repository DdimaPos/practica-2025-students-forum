import { unstable_cache } from 'next/cache';
import { getComments } from './actions/getComments';
import CommentSectionClient from './components/CommentSectionClient';
import { getUser } from '@/utils/getUser';

export default async function CommentSection({ postId }: { postId: string }) {
  const getCachedComments = unstable_cache(
    async (postId: string, limit: number, offset: number) => {
      return getComments(postId, limit, offset);
    },
    ['comments'],
    {
      tags: [`comments-${postId}`],
    }
  );

  const { comments, total } = await getCachedComments(postId, 5, 0);

  const user = await getUser().catch(() => undefined);

  return (
    <CommentSectionClient
      postId={postId}
      initialComments={comments}
      total={total}
      userId={user?.id ?? undefined}
    />
  );
}
