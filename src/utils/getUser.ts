'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';


export async function getUser() {
  
  // Acquire the request-scoped cookie store inside the function
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
            // ignore if called in a Server Component context where setting is not allowed
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  
  if (authError) throw new Error(authError.message);

  if (!user) throw new Error('No user data');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, avatar_url, created_at')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.message) {
    console.warn('Profile fetch warning:', profileError.message);
  }

  return { user, profile };
}
