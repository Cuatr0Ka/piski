import type { EstadoClave } from '../../core/i18n/textos';
import styles from './ConclusionLines.module.css';
import { StatusShape } from './StatusShape';

export interface ConclusionLine {
  label: string;
  value: string;
  /** Forma de estado a la izquierda del renglón (para los umbrales). */
  shape?: EstadoClave;
  /** Línea pequeña bajo el valor (por ejemplo, el rango del ritmo). */
  sub?: string;
}

/** Lista de renglones "etiqueta · valor" separados por divisores finos (un solo nivel de contenedor). */
export function ConclusionLines({ lines }: { lines: ConclusionLine[] }) {
  return (
    <dl className={styles['lista']}>
      {lines.map((linea) => {
        const largo = linea.value.length > 16;
        return (
          <div key={linea.label} className={styles['renglon']}>
            <dt className={`${styles['etiqueta']} type-label`}>
              {linea.shape !== undefined && <StatusShape kind={linea.shape} size={24} />}
              <span>{linea.label}</span>
            </dt>
            <dd className={styles['valor']}>
              <span className={largo ? 'type-body-strong' : 'type-title-md'}>{linea.value}</span>
              {linea.sub !== undefined && <span className={`${styles['sub']} type-caption`}>{linea.sub}</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
