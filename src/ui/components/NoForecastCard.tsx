import { useId } from 'react';
import { textos } from '../../core/i18n/textos';
import { Card } from './Card';
import { ConclusionLines } from './ConclusionLines';
import type { ConclusionLine } from './ConclusionLines';
import styles from './NoForecastCard.module.css';
import { Info } from '../icons';

interface Props {
  /** "Sin pronóstico: hacen falta más lecturas", "Sin pronóstico de creciente"… */
  title: string;
  /** Por qué no hay pronóstico. */
  reason: string;
  /** Qué hacer. */
  action: string;
  /** Nivel (o último nivel conocido), ritmo y antigüedad del dato. */
  lines: ConclusionLine[];
}

/**
 * Tarjeta de "sin pronóstico": tono neutro con ícono de información, la razón y qué hacer.
 * No se parece a un error ni a una tarjeta vacía, y nunca muestra un tiempo hasta un umbral.
 */
export function NoForecastCard({ title, reason, action, lines }: Props) {
  const etiqueta = useId();
  return (
    <Card main labelledBy={etiqueta} className={styles['neutra']}>
      <p id={etiqueta} className={`${styles['rotulo']} type-label`}>
        {textos.pronostico.conclusionEtiqueta}
      </p>
      <div className={styles['cabeza']}>
        <Info size={32} aria-hidden />
        <p className="type-value-xl">{title}</p>
      </div>
      <p className={`${styles['detalle']} type-body`}>
        <strong>{reason}</strong> <span>{action}</span>
      </p>
      <ConclusionLines lines={lines} />
    </Card>
  );
}
