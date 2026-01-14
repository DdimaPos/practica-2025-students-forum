'use server';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/utils/supabase/server';

export async function createMfaChallenge(factorId: string) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.mfa.challenge({ factorId });

    if (error) {
      throw new Error(error.message);
    }

    Sentry.logger.info('MFA challenge created', {
      action: 'createMfaChallenge',
      factor_id: factorId,
      challenge_id: data.id,
      duration: Date.now() - startTime,
    });

    return {
      challengeId: data.id,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    Sentry.logger.error('MFA challenge creation failed', {
      action: 'createMfaChallenge',
      factor_id: factorId,
      error_message: error.message,
      error_stack: error.stack,
      duration: Date.now() - startTime,
    });

    Sentry.captureException(error, {
      tags: { action: 'createMfaChallenge' },
      extra: { factor_id: factorId },
    });

    throw error;
  }
}
