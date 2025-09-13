import {redirect} from 'next/navigation';
import {createClient} from '@/utils/supabase/server';

// example of how private page should redirect the user to login
export default async function PrivatePage() {
  const supabase = await createClient();
  const {data, error} = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }
  return <p>Hello {data.user.email}</p>;
}
