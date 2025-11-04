import TabsNavigation from '@/features/Settings/components/TabsNavigation';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const categories = [
  { label: 'Account', value: 'account' },
  { label: 'MFA Enrollment', value: 'mfa-enroll' },
  { label: 'MFA Management', value: 'mfa-manage' },
];

export const metadata: Metadata = {
  title: 'Peerplex | Settings',
  description: 'settings page of the user',
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <div className='w-full'>
      <TabsNavigation categories={categories} />

      <div className='mt-6'>{children}</div>
    </div>
  );
}
