export type EstadoKind = 'normal' | 'review' | 'stop' | 'nodata';

/** Por qué no hay datos: sin lecturas, última lectura vieja o todas descartadas. */
export type NoDataReason = 'none' | 'stale' | 'insufficient';

/** Estado del paso, calculado a partir de la configuración y las lecturas (no se guarda). */
export interface EstadoPaso {
  kind: EstadoKind;
  /** Hora de la última lectura válida, en milisegundos. */
  lastReadingAt?: number;
  /** Minutos entre el "ahora" y la última lectura válida. */
  ageMin?: number;
  /** Nivel de la última lectura válida, en mm. */
  lastLevelMm?: number;
  /** Lecturas descartadas por imposibles o por venir del futuro. */
  discardedCount: number;
  /** Solo con `nodata`. */
  noDataReason?: NoDataReason;
}
