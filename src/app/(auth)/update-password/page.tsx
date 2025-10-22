import { resetPassword } from '@/features/Authentication/actions/resetPassword';
import { UpdatePasswordForm } from '@/features/Authentication/components/UpdatePasswordForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <>
      <UpdatePasswordForm onSubmit={resetPassword} />
    </>
  );
}
