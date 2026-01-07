'use server';

import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function unenrollMFA(factorId: string) {
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.mfaSettings.limit(ip);

  if (!success) {
    throw new Error('Too many requests');
  }

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, message: 'Not authenticated.' };
  }

  const { error } = await supabase.auth.mfa.unenroll({ factorId });

  if (error) {
    console.error('Unenroll MFA error:', error.message);

    return { success: false, message: error.message };
  }

  // Force user to sign out after unenrollment
  await supabase.auth.signOut();

  return {
    success: true,
    message: 'MFA factor removed. Please log in again.',
  };
}
