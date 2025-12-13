'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { FormState, signupFormSchema } from '../types';

export async function completeSignup(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const data = Object.fromEntries(formData.entries());
  const parsed = signupFormSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues.map(issue => issue.message).join(', '),
    };
  }

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authId, user.id));

  if (existingUser.length === 0) {
    return {
      success: false,
      message: 'User not found. Please try logging in again.',
    };
  }

  await db
    .update(users)
    .set({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      bio: parsed.data.bio,
      yearOfStudy: parsed.data.yearOfStudy,
    })
    .where(eq(users.authId, user.id));

  redirect('/');
}
