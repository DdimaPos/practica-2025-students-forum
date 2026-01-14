'use server';

import * as Sentry from '@sentry/nextjs';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export interface VerifyMFAParams {
  factorId: string;
  challengeId: string;
  code: string;
}

export async function verifyMFA({
  factorId,
  challengeId,
  code,
}: VerifyMFAParams) {
  const startTime = Date.now();
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.verifyMFA.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      action: 'verifyMFA',
      factor_id: factorId,
      challenge_id: challengeId,
      ip_address: ip,
      rate_limit_type: 'verifyMFA',
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Too many requests' };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (error) {
      throw new Error(error.message);
    }

    Sentry.logger.info('MFA verified', {
      action: 'verifyMFA',
      factor_id: factorId,
      challenge_id: challengeId,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    return { success: true, message: 'MFA enrollment successful!' };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('MFA verification failed', {
      action: 'verifyMFA',
      factor_id: factorId,
      challenge_id: challengeId,
      error_message: error.message,
      error_stack: error.stack,
      ip_address: ip,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { action: 'verifyMFA' },
      extra: { factor_id: factorId, challenge_id: challengeId, ip_address: ip },
    });

    return { success: false, message: 'MFA verification failed' };
  }
}
