'use server';

import { FormState } from '@/features/Authentication/types';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function resetPasswordRequest(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  const supabase = await createClient();
  const headerList = await headers();
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
