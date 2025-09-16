import {redirect} from 'next/navigation';
import {createClient} from '@/utils/supabase/server';

export default async function PrivatePage() {
  // example of how private page should redirect the user to login
  // use this logic in other private pages
  const supabase = await createClient();
  const {data, error} = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }
  return <p>Hello {data.user.email}</p>;
}
