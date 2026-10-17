import { textos } from '../i18n/textos';
import {
  configSchema,
  parseFile,
  readingsSchema,
  scenarioSchema,
} from '../schemas';
import type { Config, Reading, Result, ScenarioGroup, ScenarioMeta } from '../schemas';
import { FUTURE_TOLERANCE_MS, offsetMinutes, parseTimestamp } from '../time/clock';

/** Un escenario cargado y validado, listo para calcular. */
export interface LoadedScenario {
  meta: ScenarioMeta;
  config: Config;
  readings: Reading[];
  /** El "ahora" fijo del escenario, en milisegundos. */
  now: number;
  /** Desfase de su zona horaria en minutos (por ejemplo -360); se usa para mostrar horas. */
  offsetMin: number;
}

export interface ScenarioEntry {
  id: string;
  name: string;
  description: string;
  group: ScenarioGroup;
}

/**
 * Único lugar que toca los JSON de los escenarios (principio V). La interfaz solo ve esta API,
 * así que el origen de los datos se puede cambiar sin tocar la lógica ni las pantallas.
 */
export interface ScenarioRepository {
  list(): { demo: ScenarioEntry[]; test: ScenarioEntry[] };
  get(id: string): Promise<Result<LoadedScenario>>;
}

type ArchivoEscenario = 'escenario' | 'config' | 'readings';
type Carpetas = Map<string, Partial<Record<ArchivoEscenario, unknown>>>;

/** Agrupa los archivos `.../escenarios/<id>/<archivo>.json` por carpeta. */
function agrupar(archivos: Record<string, unknown>): Carpetas {
  const carpetas: Carpetas = new Map();
  for (const [ruta, contenido] of Object.entries(archivos)) {
    const m = /escenarios\/([^/]+)\/(escenario|config|readings)\.json$/.exec(ruta.replaceAll('\\', '/'));
    if (!m) continue;
    const id = m[1] as string;
    const archivo = m[2] as ArchivoEscenario;
    carpetas.set(id, { ...carpetas.get(id), [archivo]: contenido });
  }
  return carpetas;
}

/** Crea un repositorio a partir de los archivos ya leídos (los del paquete o los de una prueba). */
export function createScenarioRepository(archivos: Record<string, unknown>): ScenarioRepository {
  const carpetas = agrupar(archivos);

  return {
    list() {
      const demo: ScenarioEntry[] = [];
      const test: ScenarioEntry[] = [];
      for (const [id, f] of [...carpetas].sort(([a], [b]) => a.localeCompare(b))) {
        const meta = parseFile(scenarioSchema, f.escenario, `${id}/escenario.json`);
        const entrada: ScenarioEntry = meta.ok
          ? { id, name: meta.value.name, description: meta.value.description, group: meta.value.group }
          : { id, name: `${id} (con errores)`, description: meta.message, group: 'test' };
        (entrada.group === 'demo' ? demo : test).push(entrada);
      }
      return { demo, test };
    },

    async get(id) {
      const f = carpetas.get(id);
      if (!f) return { ok: false, archivo: id, message: textos.errores.noExiste(id) };

      for (const archivo of ['escenario', 'config', 'readings'] as const) {
        if (f[archivo] === undefined) {
          return { ok: false, archivo: `${id}/${archivo}.json`, message: textos.errores.faltaArchivo(id, `${archivo}.json`) };
        }
      }

      const meta = parseFile(scenarioSchema, f.escenario, `${id}/escenario.json`);
      if (!meta.ok) return meta;
      const config = parseFile(configSchema, f.config, `${id}/config.json`);
      if (!config.ok) return config;
      const readings = parseFile(readingsSchema, f.readings, `${id}/readings.json`);
      if (!readings.ok) return readings;

      if (meta.value.id !== id) {
        return { ok: false, archivo: `${id}/escenario.json`, message: textos.errores.idDistinto(id, meta.value.id) };
      }

      const now = parseTimestamp(meta.value.now);
      const ultima = readings.value.readings.reduce((max, l) => Math.max(max, parseTimestamp(l.timestamp)), -Infinity);
      if (now < ultima - FUTURE_TOLERANCE_MS) {
        return { ok: false, archivo: `${id}/escenario.json`, message: textos.errores.ahoraAnterior(id) };
      }

      return {
        ok: true,
        value: {
          meta: meta.value,
          config: config.value,
          readings: readings.value.readings,
          now,
          offsetMin: offsetMinutes(meta.value.now),
        },
      };
    },
  };
}

// Los escenarios de ejemplo se incluyen dentro de la aplicación (sin `fetch`, que falla al abrir
// el archivo con doble clic); el repositorio los valida al pedirlos.
const archivosIncluidos = import.meta.glob('../../../data/escenarios/*/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

export const scenarioRepository: ScenarioRepository = createScenarioRepository(archivosIncluidos);
