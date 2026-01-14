'use server';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/utils/supabase/server';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUser() {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.getUser();

  if (error || !data.user || data.user.deleted_at) {
    // This is a common case when users are not authenticated
    // Log at debug level to avoid noise, but still track patterns
    Sentry.logger.debug('Auth session missing or user deleted', {
      utility: 'getUser',
      has_error: !!error,
      error_message: error?.message,
      user_deleted: !!data.user?.deleted_at,
    });

    return undefined;
  }

  const uRes = await db
    .select()
    .from(users)
    .where(eq(users.authId, data.user.id))
    .limit(1);

  if (uRes.length === 0 || !uRes[0].isVerified) {
    Sentry.logger.debug('User not found in DB or not verified', {
      utility: 'getUser',
      auth_id: data.user.id,
      found_in_db: uRes.length > 0,
      is_verified: uRes[0]?.isVerified ?? false,
    });

    return undefined;
  }

  const user = uRes[0];

  return {
    ...data.user,
    ...user,
  };
}
