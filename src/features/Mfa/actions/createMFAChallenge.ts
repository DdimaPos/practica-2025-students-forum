'use server';

import { createClient } from '@/utils/supabase/server';

export async function createMfaChallenge(factorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.mfa.challenge({ factorId });

  if (error) {
    console.error('Challenge MFA error:', error.message);
    throw new Error(error.message);
  }

  return {
    challengeId: data.id,
  };
}
