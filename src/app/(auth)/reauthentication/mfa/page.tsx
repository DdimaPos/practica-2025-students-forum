import { MFAForm } from '@/features/Mfa/components/MFAForm';
import { setUpMfaChallenge } from '@/features/Mfa/actions/setUpMfaChallenge';

export default async function MFAReauthPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const params = await searchParams;
  const path = params?.path ?? '/';
  const { factorId, challengeId } = await setUpMfaChallenge();

  if (!factorId || !challengeId) {
    return null;
  }

  return (
    <MFAForm factorId={factorId} challengeId={challengeId} redirectTo={path} />
  );
}
