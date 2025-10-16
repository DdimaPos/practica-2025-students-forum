import { getComments } from './actions/getComments';
import CommentSectionClient from './components/CommentSectionClient';

export default async function CommentSection({ postId }: { postId: string }) {
  const { comments, total } = await getComments(postId, 5, 0);

  return (
    <CommentSectionClient
      postId={postId}
      initialComments={comments}
      total={total}
    />
  );
}
