'use server';

import { createClient } from '@/utils/supabase/server';

export async function unenrollMFA(factorId: string) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, message: 'Not authenticated.' };
  }

  const { error } = await supabase.auth.mfa.unenroll({ factorId });

  if (error) {
    console.error('Unenroll MFA error:', error.message);

    return { success: false, message: error.message };
  }

  // Force user to sign out after unenrollment
  await supabase.auth.signOut();

  return {
    success: true,
    message: 'MFA factor removed. Please log in again.',
  };
}
