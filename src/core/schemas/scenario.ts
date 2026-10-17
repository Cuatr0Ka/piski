import { z } from 'zod';
import { schemaVersionSchema, timestampSchema } from './timestamp';

/** Un escenario de ejemplo simulado: su "ahora" es fijo y el panel calcula todas las antigüedades contra él. */
export const scenarioSchema = z.object({
  schema_version: schemaVersionSchema,
  id: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: 'debe estar en minúsculas, con guiones y sin tildes' }),
  group: z.enum(['demo', 'test'], { error: 'debe ser "demo" o "test"' }),
  name: z.string().min(1),
  description: z.string().min(1),
  now: timestampSchema,
});

export type ScenarioMeta = z.infer<typeof scenarioSchema>;
export type ScenarioGroup = ScenarioMeta['group'];
