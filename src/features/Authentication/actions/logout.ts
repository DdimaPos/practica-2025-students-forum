'use server';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';

export async function logout() {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  Sentry.logger.info('User logged out', {
    action: 'logout',
    user_id: user?.id,
    ip_address: ip,
    duration: Date.now() - startTime,
  });

  redirect('/login');
}
