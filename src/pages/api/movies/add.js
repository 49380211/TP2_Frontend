import { supabase } from '../../../lib/supabase';
import { parsearPelicula } from '../../../lib/utils';

export const POST = async ({ request, cookies, redirect }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  if (!accessToken || !refreshToken) return redirect('/login');

  const { data: sessionData } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (!sessionData?.user) return redirect('/login');

  const formData = await request.formData();
  const input = Object.fromEntries(formData.entries());

  const { error: validationError, data } = parsearPelicula(input);
  if (validationError) {
    return redirect('/add?error=' + encodeURIComponent(validationError));
  }

  const { error } = await supabase.from('peliculas').insert({
    user_id: sessionData.user.id,
    ...data,
  });

  if (error) {
    return redirect('/add?error=' + encodeURIComponent('Error al guardar: ' + error.message));
  }

  return redirect('/catalog');
};
