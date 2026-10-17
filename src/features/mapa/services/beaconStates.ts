import type { Beacon, Config, Reading } from '../../../core/schemas';
import { classifyState } from '../../estado';
import type { EstadoPaso } from '../../estado';

export interface BeaconState {
  beacon: Beacon;
  estado: EstadoPaso;
  /** Último nivel de esa baliza en mm (ya con su factor), o undefined si no hay lectura vigente. */
  levelMm: number | undefined;
}

/**
 * Estado de cada baliza. Mientras los datos sean simulados, todas siguen el escenario activo y cada una
 * mide un nivel distinto: el nivel del escenario multiplicado por su `level_factor`. Se clasifica con la
 * misma regla y la misma configuración que Estado actual.
 */
export function computeBeaconStates(
  balizas: readonly Beacon[],
  lecturas: readonly Reading[],
  config: Config,
  now: number,
): BeaconState[] {
  return balizas.map((beacon) => {
    const propias = lecturas.map((l) => ({ ...l, level_mm: l.level_mm * beacon.level_factor }));
    const estado = classifyState(propias, config, now);
    return { beacon, estado, levelMm: estado.kind === 'nodata' ? undefined : estado.lastLevelMm };
  });
}
