import { z } from 'zod';
import { schemaVersionSchema } from './timestamp';

const lonLat = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);
const linea = z.array(lonLat).min(2, { error: 'una línea necesita al menos 2 puntos' });
const anillo = z.array(lonLat).min(4, { error: 'un contorno necesita al menos 4 puntos' });

/** Región del mapa: contornos municipales, cauces, presas, localidades y balizas de ejemplo. */
export const regionSchema = z.object({
  schema_version: schemaVersionSchema,
  name: z.string().min(1),
  attribution: z.string().min(1),
  /** [oeste, sur, este, norte] en grados. */
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  municipalities: z
    .array(z.object({ id: z.string(), name: z.string().min(1), polygons: z.array(z.array(anillo)) }))
    .min(1),
  waterways: z.array(z.object({ name: z.string(), main: z.boolean(), lines: z.array(linea) })),
  reservoirs: z.array(z.object({ name: z.string(), ring: anillo })),
  places: z.array(z.object({ name: z.string(), kind: z.enum(['town', 'village']), lon: z.number(), lat: z.number() })),
  beacons: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      lon: z.number(),
      lat: z.number(),
      municipality: z.string(),
      /** Factor sobre el nivel del escenario: simula que cada baliza mide un nivel distinto. */
      level_factor: z.number().positive(),
    }),
  ),
});

export type Region = z.infer<typeof regionSchema>;
export type Beacon = Region['beacons'][number];
