import { z } from 'zod';
import { schemaVersionSchema, timestampSchema } from './timestamp';

/** Una lectura: nivel del agua en mm sobre una cota de referencia. Solo se agregan; el panel no las modifica. */
export const readingSchema = z.object({
  timestamp: timestampSchema,
  level_mm: z.number({ error: 'debe ser un número' }),
  /** Lluvia caída desde la lectura anterior, en mm. */
  rain_mm: z.number({ error: 'debe ser un número' }).min(0, { error: 'no puede ser negativa' }),
  simulated: z.boolean({ error: 'es obligatorio (true o false)' }),
});

export const readingsSchema = z.object({
  schema_version: schemaVersionSchema,
  readings: z.array(readingSchema),
});

export type Reading = z.infer<typeof readingSchema>;
export type Readings = z.infer<typeof readingsSchema>;
