import { NextResponse } from 'next/server';
import { getUser } from '@/utils/getUser';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get authenticated user and optional profile
    const { user } = await getUser();

    // Query the application's users table by auth user id
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, {
                  ...options,
                  secure: process.env.NODE_ENV === 'production',
                  httpOnly: true,
                })
              );
            } catch {
              // Ignore setAll errors in contexts where header mutation is not allowed
            }
          },
        },
      }
    );

    const { data: appUser, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (usersError) {
      throw new Error(usersError.message);
    }

    if (!appUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(appUser);
  } catch (err: unknown) {
    let message = 'Unexpected error';

    if (err instanceof Error) {
      message = err.message;
      console.error('Error in /api/user:', message);
    } else {
      console.error('Unknown error in /api/user:', err);
    }

    if (message.includes('No user data') || message.includes('Auth session missing')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (message.includes('User not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
