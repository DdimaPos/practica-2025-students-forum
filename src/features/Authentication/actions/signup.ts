'use server';

import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/utils/supabase/server';
import { FormState, SignupFormData, signupFormSchema } from '../types';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sanitize } from '@/lib/security';
import { headers } from 'next/headers';
import { getFirstIP } from '@/utils/getFirstIp';
import { rateLimits } from '@/lib/ratelimits';

async function checkUserExists(email: string) {
  const ures = await db.select().from(users).where(eq(users.email, email));

  return {
    exists: ures.length > 0,
    verified: ures[0]?.isVerified || false,
  };
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
  const { exists, verified } = await checkUserExists(data.email);

  if (exists && verified) {
    return {
      error:
        'This email is already registered. Please login or reset your password',
    };
  }

  const supabase = await createClient();
  const displayName =
    data.firstName && data.lastName
      ? `${data.firstName} ${data.lastName}`
      : data.firstName || data.lastName || '';

  const res = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        display_name: displayName,
        first_name: data.firstName,
        last_name: data.lastName,
      },
    },
  });

  if (res.error || !res.data.user) {
    Sentry.logger.error('Supabase Auth signUp error', {
      action: 'signup',
      error_message: res.error?.message || 'No user returned',
      email_domain: data.email.split('@')[1],
    });

    if (res.error) {
      return { error: res.error.message };
    }

    return { error: 'Sign up failed. Please try again.' };
  }

  if (!res.data.user.role || !res.data.user.confirmation_sent_at) {
    Sentry.logger.error('Confirmation email not sent', {
      action: 'signup',
      error_message: 'No confirmation email sent',
      email_domain: data.email.split('@')[1],
    });

    return {
      error:
        'Confirmation email not sent. Please verify if your email is correct or an account already exists.',
    };
  }

  // if email ends in *.utm.md, set userType to 'verified'
  let userType: 'student' | 'verified' = 'student';
  const emailDomain = data.email.split('@')[1];

  if (/\.utm\.md$/i.test(emailDomain)) {
    userType = 'verified';
  }

  const sanitizedFirstName = sanitize(data.firstName);
  const sanitizedLastName = sanitize(data.lastName);

  if (exists && !verified) {
    await db
      .update(users)
      .set({
        authId: res.data.user.id,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        userType: userType,
        bio: sanitize(data.bio),
        yearOfStudy: data.yearOfStudy,
        isVerified: false,
      })
      .where(eq(users.email, data.email));

    return { error: undefined };
  }

  await db
    .insert(users)
    .values({
      authId: res.data.user.id,
      email: data.email,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      userType: userType,
      bio: sanitize(data.bio),
      yearOfStudy: data.yearOfStudy,
      isVerified: false,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        authId: res.data.user.id,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        userType: userType,
        bio: sanitize(data.bio),
        yearOfStudy: data.yearOfStudy,
        isVerified: false,
      },
    });

  return { error: undefined };
}

export async function signup(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  const startTime = Date.now();
  Sentry.setTag('action', 'signup');
  const headerList = await headers();
  const ip = getFirstIP(headerList.get('x-forwarded-for') ?? 'unknown');
  const { success } = await rateLimits.register.limit(ip);

  if (!success) {
    Sentry.logger.warn('Rate limit exceeded', {
      ip_address: ip,
      rate_limit_type: 'register',
      duration: Date.now() - startTime,
    });

    return { success: false, message: 'Too many signup requests' };
  }

  const data = Object.fromEntries(formData.entries());

  const parsed = signupFormSchema.safeParse(data);

  if (!parsed.success) {
    Sentry.logger.warn('Signup validation failed', {
      action: 'signup',
      validation_errors: parsed.error.issues.map(i => i.message).join(', '),
    });

    return {
      success: false,
      message: parsed.error.issues.map(issue => issue.message).join(', '),
    };
  }

  const { error } = await _signup(parsed.data);

  if (error) {
    return {
      success: false,
      message: error,
    };
  }

  Sentry.metrics.distribution('user.signup.duration', Date.now() - startTime, {
    unit: 'millisecond',
  });

  Sentry.logger.info('User signed up', {
    action: 'signup',
    email_domain: parsed.data.email.split('@')[1],
    user_type: /\.utm\.md$/i.test(parsed.data.email.split('@')[0])
      ? 'verified'
      : 'student',
    has_bio: !!parsed.data.bio,
    year_of_study: parsed.data.yearOfStudy,
  });

  return {
    success: true,
    message:
      'Confirmation email sent! Please check your inbox to complete registration.',
  };
}
