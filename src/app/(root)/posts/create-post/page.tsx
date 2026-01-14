import * as Sentry from '@sentry/nextjs';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/getUser';
import PostPollHandler from '@/features/PostPollHandler';

export default async function CreatePost() {
  let user;

  try {
    user = await getUser();
  } catch (err) {
    const isErrorObject = err instanceof Error;
    const error = isErrorObject ? err : new Error(String(err));

    Sentry.logger.error('Failed to fetch user in CreatePost page', {
      page: 'CreatePost',
      error_message: error.message,
      error_stack: error.stack,
    });

    Sentry.captureException(error, {
      tags: { page: 'CreatePost' },
    });

    redirect('/login');
  }

  if (!user) {
    redirect('/login');
  }

  return <PostPollHandler />;
}
