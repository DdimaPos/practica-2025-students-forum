'use server';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function logout() {
  const startTime = Date.now();

  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    Sentry.logger.error('Logout failed', {
      action: 'logout',
      error_message: error.message,
      error_status: error.status,
    });

    return redirect('/login');
  }

  Sentry.metrics.distribution('auth.logout', Date.now() - startTime, {
    unit: 'milliseconds',
  });

  redirect('/login');
}
