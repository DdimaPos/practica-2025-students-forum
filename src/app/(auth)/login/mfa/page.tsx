import { MFAForm } from '@/features/Mfa/components/MFAForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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
    // no MFA factors, send home
    return null;
  }

  // Create challenge
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId: factor.id });

  if (challengeError) {
    throw new Error(challengeError.message);
  }

  return <MFAForm factorId={factor.id} challengeId={challenge.id} />;
}
