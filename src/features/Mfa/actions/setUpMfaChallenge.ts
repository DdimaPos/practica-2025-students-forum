import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface MFAChallengeResult {
  factorId: string | null;
  challengeId: string | null;
}

export async function setUpMfaChallenge(): Promise<MFAChallengeResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const factor = user.factors?.[0];

  if (!factor) {
    return {
      factorId: null,
      challengeId: null,
    };
  }

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId: factor.id });

  if (challengeError) {
    throw new Error(challengeError.message);
  }

  return {
    factorId: factor.id,
    challengeId: challenge.id,
  };
}
