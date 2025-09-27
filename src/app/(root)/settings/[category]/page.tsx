import { EnrollMFA } from '@/features/Mfa/components/EnrollMFA';
import { notFound } from 'next/navigation';
import { ManageMFAFactors } from '@/features/Mfa/components/ManageMFAFactors';
import { createClient } from '@/utils/supabase/server';

export default async function SettingsCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const supabase = await createClient();
  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  const { category } = await params;

  switch (category) {
    case 'account':
      return <></>;

    case 'mfa-manage':
      if (error) {
        return <>Sorry but you cannot manage mfa right now</>;
      }

      return <ManageMFAFactors factors={factors?.totp ?? []} />;

    case 'mfa-enroll':
      return <EnrollMFA />;

    default:
      notFound();
  }
}
