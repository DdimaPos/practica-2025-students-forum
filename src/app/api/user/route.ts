import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getUser } from '@/utils/getUser';

export async function GET() {
  const startTime = Date.now();

  try {
    const user = await getUser();

    Sentry.logger.info('User data retrieved', {
      user_id: user?.id,
      duration: Date.now() - startTime,
      endpoint: '/api/user',
      method: 'GET',
      status_code: 200,
    });

    return NextResponse.json(user);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    let statusCode = 500;

    if (error.message.includes('No user data')) {
      statusCode = 401;
    } else if (error.message.includes('User not found')) {
      statusCode = 404;
    }

    Sentry.logger.error('User retrieval failed', {
      error_message: error.message,
      error_stack: error.stack,
      status_code: statusCode,
      duration: Date.now() - startTime,
      endpoint: '/api/user',
      method: 'GET',
    });

    Sentry.captureException(error, {
      tags: { endpoint: '/api/user' },
      extra: { status_code: statusCode },
    });

    if (statusCode === 401) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (statusCode === 404) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
