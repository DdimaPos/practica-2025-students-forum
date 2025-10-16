import { getComments } from './actions/getComments';
import CommentSectionClient from './components/CommentSectionClient';
import { getUser } from '@/utils/getUser';

export default async function CommentSection({ postId }: { postId: number }) {
  const { comments, total } = await getComments(postId, 5, 0);

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
