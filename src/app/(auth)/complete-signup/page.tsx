import { completeSignup } from '@/features/Authentication/actions/completeSignup';
import { CompleteSignupForm } from '@/features/Authentication/components/CompleteSignupForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function CompleteSignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.authId, user.id));

  if (existingUser.length === 0) {
    redirect('/login');
  }

  const dbUser = existingUser[0];

  // If user already has complete profile, redirect to home
  if (dbUser.firstName && dbUser.lastName) {
    redirect('/');
  }

  return (
    <CompleteSignupForm
      onSubmit={completeSignup}
      defaultValues={{
        firstName: dbUser.firstName || '',
        lastName: dbUser.lastName || '',
      }}
    />
  );
}
