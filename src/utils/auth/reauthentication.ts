import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function requireReauth(redirectPath: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.last_sign_in_at) {
    const sessionAge =
      Date.now() - new Date(session.user.last_sign_in_at).getTime();

    // Change 5 to a smaller number to test (e.g. 0.5)
    const requiresReauth = sessionAge > 5 * 60 * 1000;

    if (requiresReauth) {
      redirect(
        `/reauthentication?redirectTo=${encodeURIComponent(redirectPath)}`
      );
    }
  }

  return;
}
