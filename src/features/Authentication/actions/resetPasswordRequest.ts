'use server';

import * as Sentry from '@sentry/nextjs';
import { FormState } from '@/features/Authentication/types';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function resetPasswordRequest(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.resetPassword.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'reset_password_request',
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Too many requests' };
  }

  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  const emailDomain = email.split('@')[1];
  const supabase = await createClient();
  const origin = headerList.get('origin');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/update-password`,
  });

  if (error) {
    Sentry.logger.error('Password reset request failed', {
      action: 'reset_password_request',
      email_domain: emailDomain,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return {
      success: false,
      message: 'Failed to send reset link',
    };
  }

  Sentry.logger.info('Password reset requested', {
    action: 'reset_password_request',
    email_domain: emailDomain,
    ip_address: ip,
    duration: Date.now() - startTime,
  });

  return {
    success: true,
    message: 'Password reset link has been sent. Please check your email.',
  };
}
