import { z } from 'zod';
import { textos } from '../i18n/textos';

// Que ningún mensaje de Zod llegue al usuario en inglés.
z.config(z.locales.es());

export type Result<T> = { ok: true; value: T } | { ok: false; archivo: string; message: string };

const campo = (ruta: ReadonlyArray<PropertyKey>) => ruta.map(String).join('.');

/** Convierte los errores de Zod en un mensaje accionable en español, sin trazas. */
function mensajeDeErrores(archivo: string, error: z.ZodError, datos: unknown): string {
  const raiz = typeof datos === 'object' && datos !== null ? (datos as Record<string, unknown>) : {};

  if (error.issues.some((i) => i.path.length === 1 && i.path[0] === 'schema_version')) {
    return textos.errores.versionEsquema(archivo, raiz['schema_version']);
  }
  if (error.issues.some((i) => i.message.includes('zona horaria'))) {
    return textos.errores.zonaHoraria(archivo);
  }
  const detalle = error.issues
    .slice(0, 3)
    .map((i) => (i.path.length > 0 ? `${campo(i.path)}: ${i.message}` : i.message))
    .join('; ');
  return `${textos.errores.archivo(archivo, `${detalle}.`)} ${textos.errores.arreglo}`;
}

/** Valida datos ya leídos con un esquema; devuelve un `Result` y nunca lanza. */
export function parseFile<T>(schema: z.ZodType<T>, datos: unknown, archivo: string): Result<T> {
  const r = schema.safeParse(datos);
  if (r.success) return { ok: true, value: r.data };
  return { ok: false, archivo, message: mensajeDeErrores(archivo, r.error, datos) };
}

/** Lee el texto de un archivo JSON y lo valida; un JSON roto produce un mensaje claro. */
export function parseJsonText<T>(schema: z.ZodType<T>, texto: string, archivo: string): Result<T> {
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return { ok: false, archivo, message: textos.errores.jsonRoto(archivo) };
  }
  return parseFile(schema, datos, archivo);
}
