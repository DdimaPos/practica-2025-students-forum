'use server';

import { createClient } from '@/utils/supabase/server';
import { FormState, SignupFormData, signupFormSchema } from '../types';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sanitize } from '@/lib/security';

async function checkUserExists(email: string) {
  const ures = await db.select().from(users).where(eq(users.email, email));

  return ures.length > 0 && ures[0].isVerified;
}

// id: serial('id').primaryKey(),
// authId: uuid('auth_id').references(() => authUsers.id, {
//   onDelete: 'cascade',
// }),
// firstName: varchar('first_name', { length: 100 }).notNull(),
// lastName: varchar('last_name', { length: 100 }).notNull(),
// email: varchar('email', { length: 200 }).unique().notNull(),
// userType: userTypeEnum('user_type').notNull(),
// profilePictureUrl: varchar('profile_picture_url', { length: 500 }),
// bio: text('bio'),
// yearOfStudy: integer('year_of_study'),
// isVerified: boolean('is_verified').default(false),

async function _signup(data: SignupFormData) {
  if (await checkUserExists(data.email)) {
    return {
      error:
        'This email is already registered. Please login or reset your password',
    };
  }

  const supabase = await createClient();
  const res = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (res.error) {
    return { error: res.error.message };
  }

  if (!res.data.user) {
    return { error: 'Sign up failed. Please try again.' };
  }

  if (!res.data.user.role || !res.data.user.confirmation_sent_at) {
    return {
      error:
        'Confirmation email not sent. Please verify if your email is correct or an account already exists.',
    };
  }

  console.log('user data: ', res.data.user);

  await db.insert(users).values({
    authId: res.data.user.id,
    email: data.email,
    firstName: sanitize(data.firstName || ''),
    lastName: sanitize(data.lastName || ''),
    userType: data.userType || 'student',
    bio: data.bio ? sanitize(data.bio) : undefined,
    yearOfStudy: data.yearOfStudy,
    isVerified: false,
    // profilePictureUrl: data.profilePictureUrl,
  });

  return { error: undefined };
}

export async function signup(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries());

  const parsed = signupFormSchema.safeParse(data);

  if (!parsed.success) {
    console.error('Validation error:', parsed.error);

    return {
      success: false,
      message: parsed.error.issues.map(issue => issue.message).join(', '),
    };
  }

  const { error } = await _signup(parsed.data);

  if (error) {
    console.error('Sign up error:', error);

    return {
      success: false,
      message: error,
    };
  }

  return {
    success: true,
    message:
      'Confirmation email sent! Please check your inbox to complete registration.',
  };

  // Note: If Supabase project has email confirmation disabled,
  // redirect the user
  // revalidatePath('/', 'layout');
  // redirect('/');
}
