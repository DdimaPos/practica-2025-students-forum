import { getComments } from './actions/getComments';
import CommentSectionClient from './components/CommentSectionClient';
import { getUser } from '@/utils/getUser';

export default async function CommentSection({ postId }: { postId: number }) {
  const { comments, total } = await getComments(postId, 5, 0);

  let user;
  try {
    user = await getUser();
  } catch (err) {
    console.error('Failed to fetch user in Navbar:', err);
    user = { id: null };
  }

  return (
    <CommentSectionClient
      postId={postId}
      initialComments={comments}
      total={total}
      userId={user.id}
    />
  );
}
