import { reauthenticate } from '@/features/Authentication/actions/reauthenticate';
import { ReauthForm } from '@/features/Authentication/components/Reauthintecation';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ReauthenticationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <ReauthForm onSubmit={reauthenticate} userEmail={user.email} />
    </div>
  );
}
