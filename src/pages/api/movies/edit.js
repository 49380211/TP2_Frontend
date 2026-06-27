import { supabase } from '../../../lib/supabase';
import { parsearPelicula } from '../../../lib/utils';

export const POST = async ({ request, cookies, redirect }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  if (!accessToken || !refreshToken) return redirect('/login');

  const { data: sessionData } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (!sessionData?.user) return redirect('/login');

  const formData = await request.formData();
  const id = formData.get('id')?.toString();
  const input = Object.fromEntries(formData.entries());

  const { error: validationError, data } = parsearPelicula(input);
  if (!id || validationError) {
    return redirect(`/edit/${id}?error=` + encodeURIComponent(validationError || 'Datos inválidos'));
  }

  const { error } = await supabase
    .from('peliculas')
    .update(data)
    .eq('id', id)
    .eq('user_id', sessionData.user.id);

  if (error) {
    return redirect(`/edit/${id}?error=` + encodeURIComponent('Error: ' + error.message));
  }

  return redirect(`/movie/${id}`);
};
