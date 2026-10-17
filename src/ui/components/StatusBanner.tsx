import { textos } from '../../core/i18n/textos';
import type { EstadoClave } from '../../core/i18n/textos';
import styles from './StatusBanner.module.css';
import { StatusShape } from './StatusShape';

interface Props {
  kind: EstadoClave;
  /** Hora de la última lectura ("11:30"); solo se usa con Sin datos. */
  lastHour?: string;
}

/**
 * Bloque de estado: relleno del color del estado, borde `ink`, forma, palabra y mensaje corto.
 * Es el bloque principal de Estado actual (lleva `shadow-md`; "Sin datos" no lleva sombra).
 */
export function StatusBanner({ kind, lastHour }: Props) {
  const estado = textos.estados[kind];
  const mensaje =
    kind === 'nodata' ? (lastHour ? textos.sinLecturasDesde(lastHour) : textos.sinLecturas) : estado.corto;

  return (
    <div className={`${styles['banner']} ${styles[kind]}`} role="status" aria-live="polite">
      <StatusShape kind={kind} />
      <div>
        <div className="type-state-xl">{estado.palabra}</div>
        <div className={`${styles['mensaje']} type-title-md`}>{mensaje}</div>
      </div>
    </div>
  );
}
