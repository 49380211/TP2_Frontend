import { supabase } from '../../../lib/supabase';

export const POST = async ({ request, cookies, redirect }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  if (!accessToken || !refreshToken) return redirect('/login');

  const { data: sessionData } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (!sessionData?.user) return redirect('/login');

  const formData = await request.formData();
  const id = formData.get('id')?.toString();
  if (!id) return redirect('/catalog');

  await supabase.from('peliculas').delete().eq('id', id).eq('user_id', sessionData.user.id);
  return redirect('/catalog');
};
