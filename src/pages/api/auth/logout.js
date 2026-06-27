import { supabase } from '../../../lib/supabase';

export const POST = async ({ cookies, redirect }) => {
  await supabase.auth.signOut();
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  return redirect('/');
};
