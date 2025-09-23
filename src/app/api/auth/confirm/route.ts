import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') ?? '/';

    if (token_hash && type) {
      const supabase = await createClient();

      const { error, data } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      const authId = data.user?.id
      if (!error && authId) {
        await db.update(users)
          .set({ isVerified: true })
          .where(eq(users.authId, authId))
        redirect(next);
      }
    }
    redirect('/error');
  } catch (error: unknown) {
    console.error('Error confirming email', error instanceof Error && error.message || error)
    redirect('/error');
  }
}
