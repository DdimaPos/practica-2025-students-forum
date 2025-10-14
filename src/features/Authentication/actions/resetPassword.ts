'use server';

import { FormState } from '@/features/Authentication/types';
import { createClient } from '@/utils/supabase/server';

export async function resetPassword(prevState: FormState, formData: FormData) {
  const newPassword = formData.get('password') as string;
  const passwordConfirmation = formData.get('passwordConfirmation') as string;

  if (newPassword !== passwordConfirmation) {
    return { success: false, message: 'Passwords do not match' };
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
