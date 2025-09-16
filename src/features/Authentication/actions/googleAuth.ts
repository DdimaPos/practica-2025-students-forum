'use server';

import {createClient} from '@/utils/supabase/server';
import {redirect} from 'next/navigation';

export const googleLogin = async () => {
  const supabase = await createClient();
  const {data, error} = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/api/auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (data.url) {
    redirect(data.url);
  }

  if (error) {
    redirect('/error');
  }

  redirect('/');
};
