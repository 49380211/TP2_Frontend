import { supabase } from '../../../lib/supabase';

export const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const confirm = formData.get('confirm')?.toString();

  if (!email || !password || !confirm) {
    return redirect('/register?error=' + encodeURIComponent('Completá todos los campos'));
  }

  if (password !== confirm) {
    return redirect('/register?error=' + encodeURIComponent('Las contraseñas no coinciden'));
  }

  if (password.length < 6) {
    return redirect('/register?error=' + encodeURIComponent('La contraseña debe tener al menos 6 caracteres'));
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return redirect('/register?error=' + encodeURIComponent(error.message));
  }

  if (data.session) {
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
  }

  // Email confirmation required
  return redirect('/login?error=' + encodeURIComponent('Revisá tu email para confirmar la cuenta'));
};
