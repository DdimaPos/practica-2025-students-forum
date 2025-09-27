'use server';

import { createClient } from '@/utils/supabase/server';

export async function verifyMFA({
  factorId,
  challengeId,
  code,
}: {
  factorId: string;
  challengeId: string;
  code: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error) {
    console.error('Verify MFA error:', error.message);

    return { success: false, message: error.message };
  }

  return { success: true, message: 'MFA enrollment successful!' };
}
