import { useId } from 'react';
import { textos } from '../../core/i18n/textos';
import { Card } from './Card';
import { ConclusionLines } from './ConclusionLines';
import type { ConclusionLine } from './ConclusionLines';
import styles from './RainCard.module.css';

interface Props {
  /** Cifra principal (por ejemplo "18 mm") y su ventana ("en la última hora"). */
  main: { value: string; caption: string } | null;
  /** Las demás ventanas ("Últimas 3 h", "Últimas 6 h"). */
  rows: ConclusionLine[];
  /** Si hay mensaje, se muestra en lugar de las cifras (por ejemplo, con Sin datos). */
  message?: string;
}

/**
 * Lluvia acumulada, como en una app del clima: una cifra grande en mm para la última hora y las demás
 * ventanas debajo. Con Sin datos no inventa cifras: dice que no se puede calcular.
 */
export function RainCard({ main, rows, message }: Props) {
  const titulo = useId();
  return (
    <Card labelledBy={titulo}>
      <h2 id={titulo} className="type-title-md">
        {textos.lluvia.titulo}
      </h2>
      {message !== undefined || main === null ? (
        <p className={`${styles['mensaje']} type-body`}>{message ?? textos.lluvia.sinDatos}</p>
      ) : (
        <>
          <div className={styles['principal']}>
            <span className="type-value-xl">{main.value}</span>
            <span className={`${styles['suave']} type-body`}>{main.caption}</span>
          </div>
          <ConclusionLines lines={rows} />
        </>
      )}
    </Card>
  );
}
