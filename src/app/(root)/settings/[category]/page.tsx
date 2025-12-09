import { EnrollMFA } from '@/features/Mfa/components/EnrollMFA';
import { notFound } from 'next/navigation';
import { ManageMFAFactors } from '@/features/Mfa/components/ManageMFAFactors';
import { createClient } from '@/utils/supabase/server';
import { requireReauth } from '@/utils/auth/reauthentication';
import AccountSettings from '@/features/AccountSettings';

export default async function SettingsCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (category === 'mfa-manage' || category === 'mfa-enroll') {
    await requireReauth(`/settings/${category}`);
  }

  const supabase = await createClient();
  const { data: factors, error } = await supabase.auth.mfa.listFactors();

  switch (category) {
    case 'account':
      return <AccountSettings />;

    case 'mfa-enroll':
      return <EnrollMFA />;

    case 'mfa-manage':
      if (error) {
        return <>Sorry but you cannot manage MFA right now</>;
      }

      return <ManageMFAFactors factors={factors?.totp ?? []} />;

    default:
      notFound();
  }
}
