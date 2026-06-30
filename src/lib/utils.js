/**
 * Funciones puras de validación y normalización de datos.
 * Separadas de las rutas API para poder testearlas sin necesidad
 * de un request HTTP real ni conexión a Supabase.
 */

const GENEROS_VALIDOS = [
  'Acción', 'Animación', 'Aventura', 'Ciencia Ficción', 'Comedia',
  'Drama', 'Fantasy', 'Horror', 'Musical', 'Romance', 'Suspenso', 'Otro',
];

/**
 * Valida una contraseña de registro contra su confirmación.
 * @param {string} password
 * @param {string} confirm
 * @returns {{ valido: boolean, error: string|null }}
 */
export function validarPassword(password, confirm) {
  if (!password || !confirm) {
    return { valido: false, error: 'Completá todos los campos' };
  }
  if (password !== confirm) {
    return { valido: false, error: 'Las contraseñas no coinciden' };
  }
  if (password.length < 6) {
    return { valido: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  return { valido: true, error: null };
}

/**
 * Parsea y normaliza los datos crudos de un formulario de película.
 * No confía en el input: clampea puntuación, normaliza estado,
 * y descarta campos vacíos como null en vez de strings vacíos.
 * @param {Record<string, any>} input
 * @returns {{ error: string|null, data?: object }}
 */
export function parsearPelicula(input) {
  const titulo = (input.titulo ?? '').toString().trim();
  if (!titulo) {
    return { error: 'El título es obligatorio' };
  }

  const anioNum = input.anio ? parseInt(input.anio, 10) : NaN;
  const anio = Number.isInteger(anioNum) ? anioNum : null;

  const puntuacionNum = parseInt(input.puntuacion ?? '0', 10);
  const puntuacionSegura = Number.isNaN(puntuacionNum) ? 0 : puntuacionNum;
  const puntuacion = Math.min(5, Math.max(0, puntuacionSegura));

  const estado = input.estado === 'vista' ? 'vista' : 'pendiente';

  const generoCrudo = (input.genero ?? '').toString();
  const genero = GENEROS_VALIDOS.includes(generoCrudo) ? generoCrudo : null;

  const director = (input.director ?? '').toString().trim() || null;

  const es_favorita = input.es_favorita === 'true' || input.es_favorita === true;

  return {
    error: null,
    data: { titulo, anio, director, genero, estado, puntuacion, es_favorita },
  };
}

/**
 * Convierte una puntuación numérica (0-5) en su representación visual.
 * @param {number} puntuacion
 * @returns {string}
 */
export function formatearEstrellas(puntuacion) {
  const p = Math.min(5, Math.max(0, puntuacion ?? 0));
  return '★'.repeat(p) + '☆'.repeat(5 - p);
}
