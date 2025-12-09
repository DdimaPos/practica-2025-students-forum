'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { FormState } from '@/features/Authentication/types';

export async function reauthenticate(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  const redirectTo =
    (formData.get('redirectTo') as string) || '/settings/account';

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { success: false, message: 'Not authenticated' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  redirect(redirectTo);
}
