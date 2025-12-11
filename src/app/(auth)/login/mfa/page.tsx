import { MFAForm } from '@/features/Mfa/components/MFAForm';
import { setUpMfaChallenge } from '@/features/Mfa/actions/setUpMfaChallenge';

export default async function MFAPage() {
  const { factorId, challengeId } = await setUpMfaChallenge();

  if (!factorId || !challengeId) {
    return null;
  }

  return <MFAForm factorId={factorId} challengeId={challengeId} />;
}
