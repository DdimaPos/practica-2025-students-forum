'use server';

import * as Sentry from '@sentry/nextjs';
import { FormState } from '@/features/Authentication/types';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function resetPassword(prevState: FormState, formData: FormData) {
  const startTime = Date.now();
  const newPassword = formData.get('password') as string;
  const passwordConfirmation = formData.get('passwordConfirmation') as string;

  if (newPassword !== passwordConfirmation) {
    return { success: false, message: 'Passwords do not match' };
  }

  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.resetPassword.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'reset_password',
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Too many password reset attempts' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    Sentry.logger.error('Password update failed', {
      action: 'reset_password',
      user_id: user?.id,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Failed to update password' };
  }

  Sentry.logger.info('Password updated', {
    action: 'reset_password',
    user_id: user?.id,
    ip_address: ip,
    duration: Date.now() - startTime,
  });

  return {
    success: true,
    message:
      'Password successfully updated. You will be redirected to login now',
  };
}
