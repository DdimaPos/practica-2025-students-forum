import { unstable_cache } from 'next/cache';
import { getComments } from './actions/getComments';
import CommentSectionClient from './components/CommentSectionClient';
import { getUser } from '@/utils/getUser';

export default async function CommentSection({ postId }: { postId: number }) {
  console.log(`🗂️ CommentSection rendering for post ${postId}`);

  const getCachedComments = unstable_cache(
    async (postId: number, limit: number, offset: number) => {
      console.log(
        `💾 Cache miss - fetching comments from DB with tag comments-${postId}`
      );

      return getComments(postId, limit, offset);
    },
    ['comments'],
    {
      tags: [`comments-${postId}`],
    }
  );

  console.log(`🔍 Attempting to get cached comments for post ${postId}`);
  const { comments, total } = await getCachedComments(postId, 5, 0);
  console.log(
    `✅ Got ${comments.length} comments from cache/DB for post ${postId}`
  );

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
