import { useId } from 'react';
import { textos } from '../../core/i18n/textos';
import { Card } from './Card';
import styles from './ConclusionCard.module.css';
import { ConclusionLines } from './ConclusionLines';
import type { ConclusionLine } from './ConclusionLines';
import { Tag } from './Tag';

export type { ConclusionLine } from './ConclusionLines';

interface Props {
  /** La frase de conclusión: lo más grande de la pantalla. */
  sentence: string;
  /** Un renglón por umbral. */
  thresholds: ConclusionLine[];
  /** Nivel actual, ritmo, nivel proyectado y antigüedad. */
  facts: ConclusionLine[];
  /** "Proyección, no medición". */
  note: string;
  /** Aviso de que una lluvia intensa puede acelerar la subida. */
  warning: string;
}

/**
 * Conclusión del pronóstico: la frase va primero y es lo más grande; debajo, un renglón por umbral y
 * las cifras que la respaldan. Es el bloque principal de la pantalla (lleva `shadow-md`).
 */
export function ConclusionCard({ sentence, thresholds, facts, note, warning }: Props) {
  const etiqueta = useId();
  return (
    <Card main labelledBy={etiqueta}>
      <p id={etiqueta} className={`${styles['rotulo']} type-label`}>
        {textos.pronostico.conclusionEtiqueta}
      </p>
      <p className={`${styles['frase']} type-value-xl`}>{sentence}</p>
      <ConclusionLines lines={[...thresholds, ...facts]} />
      <div className={styles['pie']}>
        <Tag>{note}</Tag>
        <p className={`${styles['aviso']} type-caption`}>{warning}</p>
      </div>
    </Card>
  );
}
