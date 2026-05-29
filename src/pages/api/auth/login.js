import { supabase } from '../../../lib/supabase';

export const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return redirect('/login?error=' + encodeURIComponent('Completá todos los campos'));
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect('/login?error=' + encodeURIComponent('Email o contraseña incorrectos'));
  }

  const { access_token, refresh_token } = data.session;

  cookies.set('sb-access-token', access_token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  cookies.set('sb-refresh-token', refresh_token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });

  return redirect('/catalog');
};
