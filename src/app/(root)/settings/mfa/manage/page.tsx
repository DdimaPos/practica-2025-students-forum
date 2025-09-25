// app/(root)/settings/mfa/manage/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ManageMFAFactors } from '@/features/Authentication/components/ManageMFAFactors';

export default async function ManageMFA() {
  const supabase = await createClient();

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // User is not logged in → redirect to login
    redirect('/login');
  }

  // Fetch enrolled factors securely on the server
  const { data: factors, error } = await supabase.auth.mfa.listFactors();

  if (error) {
    console.error('Error fetching MFA factors:', error.message);
    return <p className='text-red-600'>Failed to load MFA factors.</p>;
  }

  return (
    <div className='mx-auto max-w-2xl p-6'>
      <h1 className='mb-4 text-2xl font-semibold'>Manage MFA Factors</h1>
      <ManageMFAFactors factors={factors.totp ?? []} />
    </div>
  );
}
