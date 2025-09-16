'use server';

import {createClient} from '@/utils/supabase/server';
import {FormState} from '../types';

export async function signup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      message: 'Email and password are required.',
    };
  }

  //At this state will have to perform many checks regarding the user input
  if (password.length < 6) {
    return {
      success: false,
      message: 'Password must be at least 6 characters long.',
    };
  }

  const {data} = await supabase
    .from('users')
    .select('*')
    .eq('email', email) // the email to check if it exists
    .single();

  console.log('data', data);
  if (data) {
    return {
      success: false,
      message:
        'This email is already registered. Please login or reset your password',
    };
  }

  const {error} = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Sign up error:', error.message);
    return {
      success: false,
      message:
        error.message || 'An unexpected error occurred. Please try again.',
    };
  }

  return {
    success: true,
    message:
      'Confirmation email sent! Please check your inbox to complete registration.',
  };

  // Note: If Supabase project has email confirmation disabled,
  // redirect the user
  // revalidatePath('/', 'layout');
  // redirect('/');
}
