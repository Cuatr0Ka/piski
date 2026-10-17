import { z } from 'zod';
import { schemaVersionSchema, timestampSchema } from './timestamp';

/**
 * Reportes (`reports.json`). Solo se define el tipo: el MVP no los usa.
 * Son estrictos a propósito: NO admiten datos personales (nombre, teléfono ni cuenta).
 */
export const reportsSchema = z.object({
  schema_version: schemaVersionSchema,
  reports: z.array(
    z
      .object({
        id: z.string(),
        timestamp: timestampSchema,
        type: z.string(),
        approximate_location: z.string(),
        note: z.string(),
      })
      .strict(),
  ),
});

export type Reports = z.infer<typeof reportsSchema>;
