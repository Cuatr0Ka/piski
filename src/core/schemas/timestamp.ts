import { z } from 'zod';

const ISO_CON_ZONA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/** Marca de tiempo ISO 8601 con zona horaria (`-06:00` o `Z`). Sin zona, el archivo se rechaza. */
export const timestampSchema = z
  .string({ error: 'debe ser texto con fecha y hora ISO 8601' })
  .refine((v) => ISO_CON_ZONA.test(v) && !Number.isNaN(Date.parse(v)), {
    error: 'es una marca de tiempo sin zona horaria o inválida (agrega la zona, por ejemplo -06:00 o Z)',
  });

/** Todos los archivos llevan la versión de esquema; el panel solo soporta la 1. */
export const SCHEMA_VERSION = 1 as const;
export const schemaVersionSchema = z.literal(SCHEMA_VERSION, {
  error: 'debe ser 1',
});
