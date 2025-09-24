import { createClient } from '@/utils/supabase/server'
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUser() {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.getUser();
  if (error || !data.user || data.user.deleted_at) {
    console.error('Error fetching user:', error);
    throw new Error(`Error fetching user: ${error?.message || error}`);
  }
  const uRes = await db.select().from(users).where(eq(users.authId, data.user.id)).limit(1)
  if (uRes.length === 0 || !uRes[0].isVerified) {
    throw new Error('User not found in database');
  }
  const user = uRes[0];
  return {
    ...data.user,
    ...user
  }
}
