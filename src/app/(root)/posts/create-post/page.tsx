import { redirect } from 'next/navigation';
import { getUser } from '@/utils/getUser';
import PostPollHandler from '@/features/PostPollHandler';

export default async function CreatePost() {
  let user;

  try {
    user = await getUser();
  } catch (err) {
    console.error('Failed to fetch user in CreatePost page:', err);
    redirect('/login');
  }

  if (!user) {
    redirect('/login');
  }

  return <PostPollHandler userId={user.id} />;
}
