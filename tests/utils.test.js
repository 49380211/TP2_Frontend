import { describe, it, expect } from 'vitest';
import { validarPassword, parsearPelicula, formatearEstrellas } from '../src/lib/utils.js';

describe('validarPassword', () => {
  it('rechaza si las contraseñas no coinciden', () => {
    const resultado = validarPassword('abcdef', 'ghijkl');
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toMatch(/no coinciden/i);
  });

  it('rechaza contraseñas de menos de 6 caracteres', () => {
    const resultado = validarPassword('123', '123');
    expect(resultado.valido).toBe(false);
  });

  it('acepta una contraseña válida y coincidente', () => {
    const resultado = validarPassword('contrasenaSegura', 'contrasenaSegura');
    expect(resultado.valido).toBe(true);
    expect(resultado.error).toBeNull();
  });
});

describe('parsearPelicula', () => {
  it('rechaza una película sin título', () => {
    const resultado = parsearPelicula({ titulo: '   ' });
    expect(resultado.error).toBeTruthy();
  });

  it('clampea la puntuación a un máximo de 5', () => {
    const resultado = parsearPelicula({ titulo: 'Matrix', puntuacion: '9' });
    expect(resultado.data.puntuacion).toBe(5);
  });

  it('normaliza un estado inválido a "pendiente"', () => {
    const resultado = parsearPelicula({ titulo: 'Matrix', estado: 'cualquier-cosa' });
    expect(resultado.data.estado).toBe('pendiente');
  });

  it('descarta un género que no está en la lista permitida', () => {
    const resultado = parsearPelicula({ titulo: 'Matrix', genero: 'Western' });
    expect(resultado.data.genero).toBeNull();
  });
});

describe('formatearEstrellas', () => {
  it('genera 5 estrellas llenas para puntuación 5', () => {
    expect(formatearEstrellas(5)).toBe('★★★★★');
  });

  it('genera estrellas vacías para puntuación 0', () => {
    expect(formatearEstrellas(0)).toBe('☆☆☆☆☆');
  });
});
