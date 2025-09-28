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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // If no MFA, go home
  if (!data.session?.user.factors?.length) {
    redirect('/');
  }

  // Otherwise, go to MFA page
  redirect('/login/mfa');
}
