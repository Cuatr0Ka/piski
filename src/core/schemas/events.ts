import { z } from 'zod';
import { schemaVersionSchema, timestampSchema } from './timestamp';

/** Eventos (`events.json`). Solo se define el tipo: el MVP no los lee ni los muestra. */
export const eventsSchema = z.object({
  schema_version: schemaVersionSchema,
  events: z.array(
    z.object({
      timestamp: timestampSchema,
      type: z.string(),
      message: z.string(),
    }),
  ),
});

export type Events = z.infer<typeof eventsSchema>;
