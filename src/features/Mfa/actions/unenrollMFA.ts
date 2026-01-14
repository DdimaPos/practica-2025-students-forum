'use server';

import * as Sentry from '@sentry/nextjs';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function unenrollMFA(factorId: string) {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.mfaSettings.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'unenrollMFA',
      factor_id: factorId,
      ip_address: ip,
      rate_limit_type: 'mfaSettings',
      duration: Date.now() - startTime,
    });

    throw new Error('Too many requests');
  }

  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: 'Not authenticated.' };
    }

    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      throw new Error(error.message);
    }

    // Force user to sign out after unenrollment
    await supabase.auth.signOut();

    Sentry.logger.info('MFA unenrolled', {
      action: 'unenrollMFA',
      factor_id: factorId,
      user_id: session.user.id,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return {
      success: true,
      message: 'MFA factor removed. Please log in again.',
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('MFA unenrollment failed', {
      action: 'unenrollMFA',
      factor_id: factorId,
      error_message: error.message,
      error_stack: error.stack,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { action: 'unenrollMFA' },
      extra: { factor_id: factorId, ip_address: ip },
    });

    return { success: false, message: 'Failed to remove MFA factor' };
  }
}
