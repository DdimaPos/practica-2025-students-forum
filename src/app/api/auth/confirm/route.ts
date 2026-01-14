import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (!token_hash || !type) {
    Sentry.logger.warn('Email confirmation missing parameters', {
      endpoint: '/api/auth/confirm',
      method: 'GET',
      has_token_hash: !!token_hash,
      has_type: !!type,
      duration: Date.now() - startTime,
    });
    redirect('/error');
  }

  try {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error || !data.user?.id) {
      throw error || new Error('Invalid token or user ID');
    }

    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.authId, data.user.id));

    Sentry.logger.info('Email confirmation completed', {
      endpoint: '/api/auth/confirm',
      method: 'GET',
      user_id: data.user.id,
      confirmation_type: type,
      redirect_path: next,
      duration: Date.now() - startTime,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('Email confirmation failed', {
      endpoint: '/api/auth/confirm',
      method: 'GET',
      error_message: error.message,
      error_stack: error.stack,
      confirmation_type: type,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { endpoint: '/api/auth/confirm' },
      extra: { confirmation_type: type },
    });

    redirect('/error');
  }

  redirect(next);
}
