'use server';

import * as Sentry from '@sentry/nextjs';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { FormState } from '../types';
import { headers } from 'next/headers';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';

export async function login(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.login.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'login',
      ip_address: ip,
      rate_limit_type: 'login',
    });

    return { success: false, message: 'Too many login requests' };
  }

  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const emailDomain = email.split('@')[1];

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    Sentry.logger.error('Login failed', {
      action: 'login',
      error_message: error.message,
      error_status: error.status,
      error_cause: error.cause,
      email_domain: emailDomain,
    });

    return { success: false, message: 'Invalid credentials' };
  }

  const { data: aalLevel, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError) {
    Sentry.logger.error('MFA check failed', {
      action: 'login',
      email_domain: emailDomain,
    });

    return { success: false, message: 'could not get aal level' };
  }

  if (aalLevel.nextLevel === 'aal2') {
    Sentry.logger.info('Login successful - MFA required', {
      action: 'login',
      email_domain: emailDomain,
      requires_mfa: true,
    });
    Sentry.metrics.distribution('auth.login', Date.now() - startTime, {
      unit: 'milliseconds',
    });
    redirect('/login/mfa');
  }

  Sentry.metrics.distribution('auth.login', Date.now() - startTime, {
    unit: 'milliseconds',
  });
  Sentry.logger.info('Login successful', {
    action: 'login',
    email_domain: emailDomain,
    requires_mfa: false,
  });

  redirect('/');
}
