'use server';

import {redirect} from 'next/navigation';
import {createClient} from '@/utils/supabase/server';

export type FormState = {
  success: boolean;
  message: string;
};

export async function login(
  prevState: FormState, // The previous state
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  if (!data.email || !data.password) {
    return {
      success: false,
      message: 'Email and password are required.',
    };
  }

  const {error} = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login error:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }

  redirect('/');
}
