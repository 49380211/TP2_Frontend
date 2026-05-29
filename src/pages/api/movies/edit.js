import { supabase } from '../../../lib/supabase';

export const POST = async ({ request, cookies, redirect }) => {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;
  if (!accessToken || !refreshToken) return redirect('/login');

  const { data: sessionData } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (!sessionData?.user) return redirect('/login');

  const formData    = await request.formData();
  const id          = formData.get('id')?.toString();
  const titulo      = formData.get('titulo')?.toString().trim();
  const anio        = formData.get('anio')?.toString();
  const director    = formData.get('director')?.toString().trim();
  const genero      = formData.get('genero')?.toString();
  const estado      = formData.get('estado')?.toString() || 'pendiente';
  const puntuacion  = parseInt(formData.get('puntuacion')?.toString() || '0');
  const es_favorita = formData.get('es_favorita') === 'true';

  if (!id || !titulo) return redirect('/catalog?error=' + encodeURIComponent('Datos inválidos'));

  const { error } = await supabase
    .from('peliculas')
    .update({ titulo, anio: anio ? parseInt(anio) : null, director: director || null, genero: genero || null, estado, puntuacion: puntuacion || 0, es_favorita })
    .eq('id', id)
    .eq('user_id', sessionData.user.id);

  if (error) return redirect(`/edit/${id}?error=` + encodeURIComponent('Error: ' + error.message));
  return redirect(`/movie/${id}`);
};
