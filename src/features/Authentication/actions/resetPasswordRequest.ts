'use server';

import { FormState } from '@/features/Authentication/types';
import { rateLimits } from '@/lib/ratelimits';
import { getFirstIP } from '@/utils/getFirstIp';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function resetPasswordRequest(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.resetPassword.limit(ip);

  if (!success) {
    return { success: false, message: 'Too many requests' };
  }

  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  const supabase = await createClient();
  const origin = headerList.get('origin');

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/update-password`,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: 'Password reset link has been sent. Please check your email.',
  };
}
