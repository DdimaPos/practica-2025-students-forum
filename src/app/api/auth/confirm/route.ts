import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
// import { getUser } from '@/features/Authentication/getUser';

export async function GET(request: NextRequest) {
  console.log('Confirming email...');

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';
  if (!token_hash || !type) {
    redirect('/error');
  }

  try {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error || !data.user?.id) {
      throw error || new Error('Invalid token or user ID');
    }

    await db.update(users)
      .set({ isVerified: true })
      .where(eq(users.authId, data.user.id));

  } catch (error) {
    console.error('Error during email confirmation:', error);
    redirect('/error');
  }

  // const test = await getUser()
  // console.log('Confirmed user:', test);

  redirect(next);

}
