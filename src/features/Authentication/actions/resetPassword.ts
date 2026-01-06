'use server';

import { FormState } from '@/features/Authentication/types';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function resetPassword(prevState: FormState, formData: FormData) {
  const newPassword = formData.get('password') as string;
  const passwordConfirmation = formData.get('passwordConfirmation') as string;

  if (newPassword !== passwordConfirmation) {
    return { success: false, message: 'Passwords do not match' };
  }

  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.resetPassword.limit(ip);

  if (!success) {
    return { success: false, message: 'Too many password reset attempts' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message:
      'Password successfully updated. You will be redirected to login now',
  };
}
