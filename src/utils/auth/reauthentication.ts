import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

const REAUTHENTICATION_TIMEOUT_MS = 5 * 60 * 1000; // Change 5 to a smaller number to test (e.g. 0.5)

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

    const requiresReauth = sessionAge > REAUTHENTICATION_TIMEOUT_MS;

    if (requiresReauth) {
      redirect(
        `/reauthentication?redirectTo=${encodeURIComponent(redirectPath)}`
      );
    }
  }

  return;
}
