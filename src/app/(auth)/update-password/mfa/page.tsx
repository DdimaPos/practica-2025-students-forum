import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

import { MFAForm } from '@/features/Mfa/components/MFAForm';

export default async function MFAPage() {
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
    return null;
  }

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId: factor.id });

  if (challengeError) {
    throw new Error(challengeError.message);
  }

  return (
    <MFAForm
      redirectTo='/update-password'
      factorId={factor.id}
      challengeId={challenge.id}
    />
  );
}
