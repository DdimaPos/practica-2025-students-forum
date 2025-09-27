'use server';

import { createClient } from '@/utils/supabase/server';

export async function enrollMFA() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be logged in to enroll MFA.');
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  if (error) {
    console.error('Enroll MFA error:', error.message);
    throw new Error(error.message);
  }

  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}
