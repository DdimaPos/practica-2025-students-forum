'use server';

import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function enrollMFA() {
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.mfaSettings.limit(ip);

  if (!success) {
    throw new Error('Too many requests');
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be logged in to enroll MFA.');
  }

  const { data: factors, error: listError } =
    await supabase.auth.mfa.listFactors();

  if (listError) {
    throw new Error(listError.message);
  }

  const unverifiedTotpFactor = factors?.all.find(
    factor => factor.factor_type === 'totp' && factor.status === 'unverified'
  );

  if (unverifiedTotpFactor) {
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId: unverifiedTotpFactor.id,
    });

    if (unenrollError) {
      throw new Error(unenrollError.message);
    }
  }

  const { data, error: enrollError } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  if (enrollError) {
    throw new Error(enrollError.message);
  }

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}
