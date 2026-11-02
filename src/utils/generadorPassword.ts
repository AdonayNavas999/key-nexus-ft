export interface OpcionesGenerador {
  longitud: number;
  incluirMayusculas: boolean;
  incluirMinusculas: boolean;
  incluirNumeros: boolean;
  incluirSimbolos: boolean;
}

const MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';
const NUMEROS = '0123456789';
const SIMBOLOS = '@$!%*?&#_-+';

export const generarPasswordAleatoria = (opciones: OpcionesGenerador = {
  longitud: 12,
  incluirMayusculas: true,
  incluirMinusculas: true,
  incluirNumeros: true,
  incluirSimbolos: true,
}): string => {
  let caracteres = '';
  const obligatorios: string[] = [];

  if (opciones.incluirMinusculas) {
    caracteres += MINUSCULAS;
    obligatorios.push(MINUSCULAS[Math.floor(Math.random() * MINUSCULAS.length)]);
  }
  if (opciones.incluirMayusculas) {
    caracteres += MAYUSCULAS;
    obligatorios.push(MAYUSCULAS[Math.floor(Math.random() * MAYUSCULAS.length)]);
  }
  if (opciones.incluirNumeros) {
    caracteres += NUMEROS;
    obligatorios.push(NUMEROS[Math.floor(Math.random() * NUMEROS.length)]);
  }
  if (opciones.incluirSimbolos) {
    caracteres += SIMBOLOS;
    obligatorios.push(SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)]);
  }

  if (!caracteres) {
    caracteres = MINUSCULAS + NUMEROS;
  }

  const longitudRestante = Math.max(0, opciones.longitud - obligatorios.length);
  const resultado: string[] = [...obligatorios];

  const randomValues = new Uint32Array(longitudRestante);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < longitudRestante; i++) {
    resultado.push(caracteres[randomValues[i] % caracteres.length]);
  }

  // Mezclar para que los obligatorios no queden siempre al inicio
  return resultado.sort(() => Math.random() - 0.5).join('');
};

/**
 * Fortalece una palabra o frase base ingresada por el usuario (Semilla),
 * intercalando símbolos, números y ajustando mayúsculas/minúsculas.
 * Si el campo viene vacío, retorna cadena vacía para obligar al usuario a ingresar una base.
 */
export const personalizarConSemilla = (semilla: string): string => {
  const base = semilla.trim();
  if (!base) {
    return '';
  }

  // Transformaciones comunes y seguras
  const transformaciones: Record<string, string> = {
    'a': '@', 'A': '4',
    'e': '3', 'E': '3',
    'i': '1', 'I': '!',
    'o': '0', 'O': '0',
    's': '$', 'S': '$',
    't': '7', 'T': '7',
  };

  const simbolosExtra = ['!', '#', '$', '%', '&', '*', '_', '+'];
  const caracteres = base.split('');

  const fortalecida = caracteres.map((char, idx) => {
    // Reemplazar selectivamente
    if (transformaciones[char] && idx % 2 === 0) {
      return transformaciones[char];
    }
    return char;
  });

  // Asegurar mínimo 12 caracteres intercalando símbolos y números
  while (fortalecida.length < 12) {
    const randomSym = simbolosExtra[Math.floor(Math.random() * simbolosExtra.length)];
    const randomNum = Math.floor(Math.random() * 90 + 10);
    fortalecida.push(randomSym, String(randomNum));
  }

  return fortalecida.join('');
};
