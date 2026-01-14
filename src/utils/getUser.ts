'use server';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/utils/supabase/server';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUser() {
  try {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.getUser();

    if (error || !data.user || data.user.deleted_at) {
      if (data.user?.deleted_at) {
        Sentry.logger.warn('Deleted user attempted access', {
          auth_id: data.user.id,
          deleted_at: data.user.deleted_at,
        });
      }

      if (error) {
        Sentry.logger.error('Error fetching user from Supabase Auth', {
          utility: 'getUser',
          message: error.message,
          status: error.status,
          cause: error.cause,
        });
      }

      return undefined;
    }

    const uRes = await db
      .select()
      .from(users)
      .where(eq(users.authId, data.user.id))
      .limit(1);

    if (uRes.length === 0 || !uRes[0].isVerified) {
      return undefined;
    }

    const user = uRes[0];

    return {
      ...data.user,
      ...user,
    };
  } catch (error) {
    Sentry.logger.error('Database exception occurred', {
      utility: 'getUser',
      message: (error as Error).message,
    })
    Sentry.captureException(error, {
      tags: { utility: 'getUser' },
    });
  }

  return undefined;
}


