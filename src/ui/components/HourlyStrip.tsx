import { useId } from 'react';
import type { EstadoClave } from '../../core/i18n/textos';
import { Card } from './Card';
import styles from './HourlyStrip.module.css';
import { StatusPill } from './StatusPill';

export interface HourlyItem {
  /** Hora relativa ("Ahora", "+1 h"). */
  label: string;
  /** Nivel central proyectado, con unidad ("660 mm"). */
  value: string;
  /** Rango proyectado ("590 a 730 mm"). */
  range: string;
  /** Estado que correspondería a ese nivel central. */
  kind: EstadoClave;
}

interface Props {
  title: string;
  subtitle: string;
  items: HourlyItem[];
}

/** Tira de tarjetas por hora (como "Pronóstico por hora" de una app del clima): nivel esperado y su estado. */
export function HourlyStrip({ title, subtitle, items }: Props) {
  const id = useId();
  return (
    <Card labelledBy={id}>
      <h2 id={id} className="type-title-md">
        {title}
      </h2>
      <p className={`${styles['subtitulo']} type-label`}>{subtitle}</p>
      <ul className={styles['tira']}>
        {items.map((it, i) => (
          <li key={it.label} className={`${styles['hora']} ${i === 0 ? styles['ahora'] : ''}`}>
            <span className="type-label">{it.label}</span>
            <StatusPill kind={it.kind} />
            <span className="type-value-md">{it.value}</span>
            <span className={`${styles['rango']} type-caption`}>{it.range}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
