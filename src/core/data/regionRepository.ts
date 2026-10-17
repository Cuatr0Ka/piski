import { regionSchema } from '../schemas';
import type { Region } from '../schemas';

const archivos = import.meta.glob('../../../data/mapa/region.json', { eager: true, import: 'default' });

/**
 * Región del mapa, validada una sola vez. Es el único lugar que toca `data/mapa/region.json`.
 * Lanza un error claro si el archivo falta o no cumple el esquema.
 */
export function loadRegion(origen: Record<string, unknown> = archivos): Region {
  const crudo = Object.values(origen)[0];
  if (crudo === undefined) throw new Error('Falta data/mapa/region.json (npm run generar:mapa).');
  const r = regionSchema.safeParse(crudo);
  if (!r.success) throw new Error(`data/mapa/region.json no es válido: ${r.error.issues[0]?.message ?? 'esquema'}`);
  return r.data;
}
