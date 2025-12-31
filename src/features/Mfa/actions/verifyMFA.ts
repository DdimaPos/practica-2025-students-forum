'use server';

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
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.verifyMFA.limit(ip);

  if (!success) {
    return { success: false, message: 'Too many requests' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error) {
    console.error('Verify MFA error:', error.message);

    return { success: false, message: error.message };
  }

  return { success: true, message: 'MFA enrollment successful!' };
}
