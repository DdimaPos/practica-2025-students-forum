import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/';

  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/';
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.authId, user.id));

        let needsProfileCompletion = false;

        if (existingUser.length === 0) {
          // if email ends in *.utm.md, set userType to 'verified'
          let userType: 'student' | 'verified' = 'student';
          const emailDomain = user.email.split('@')[1];

          if (/\.utm\.md$/i.test(emailDomain)) {
            userType = 'verified';
          }

          const displayName =
            user.user_metadata?.name ||
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            '';
          const [firstName = '', ...lastParts] = displayName.split(' ');
          const lastName = lastParts.join(' ');

          const finalFirstName = user.user_metadata?.first_name || firstName;
          const finalLastName = user.user_metadata?.last_name || lastName;
          const profilePictureUrl =
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null;

          await db.insert(users).values({
            authId: user.id,
            email: user.email,
            firstName: finalFirstName || null,
            lastName: finalLastName || null,
            profilePictureUrl,
            userType,
            isVerified: false,
          });

          // Check if profile data is incomplete
          if (!finalFirstName || !finalLastName) {
            needsProfileCompletion = true;
          }
        } else {
          // User exists, check if profile is complete
          const dbUser = existingUser[0];

          if (!dbUser.firstName || !dbUser.lastName) {
            needsProfileCompletion = true;
          }
        }

        if (needsProfileCompletion) {
          next = '/complete-signup';
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
