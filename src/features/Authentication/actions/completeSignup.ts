'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { FormState } from '../types';

const completeSignupSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  bio: z.string().optional(),
  yearOfStudy: z
    .string()
    .transform(val => (val ? parseInt(val, 10) : undefined))
    .refine(val => val === undefined || (val >= 1 && val <= 5), {
      message: 'Year of study must be between 1 and 5',
    })
    .optional(),
});

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
  const parsed = completeSignupSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues.map(issue => issue.message).join(', '),
    };
  }

  const existingUser = await db
    .select()
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
