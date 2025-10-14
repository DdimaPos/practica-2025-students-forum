'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { FormState } from '../types';

export async function login(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  const { data: aalLevel, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError) {
    return { success: false, message: aalError.message };
  }

  if (aalLevel.nextLevel === 'aal2') {
    redirect('/login/mfa');
  }

  redirect('/');
}
