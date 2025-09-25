import { MFAForm } from '@/features/Authentication/components/MFAForm';
import { createClient } from '@/utils/supabase/server';

export default async function MFAPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
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

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-sm rounded-lg border p-6 shadow'>
        <h1 className='mb-4 text-xl font-semibold'>
          Multi-Factor Authentication
        </h1>
        <p className='mb-6 text-sm text-gray-600'>
          Please enter the 6-digit verification code from your authenticator
          app.
        </p>
        <MFAForm factorId={factor.id} challengeId={challenge.id} />
      </div>
    </div>
  );
}
