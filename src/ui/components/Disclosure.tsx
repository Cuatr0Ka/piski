import type { ReactNode } from 'react';
import styles from './Disclosure.module.css';

interface Props {
  /** Texto del botón que abre y cierra la sección. */
  summary: string;
  children: ReactNode;
}

/** Sección plegable. El resumen que la rodea siempre se ve: nunca hay una sección con solo un título. */
export function Disclosure({ summary, children }: Props) {
  return (
    <details className={styles['detalle']}>
      <summary className={`${styles['resumen']} type-body-strong`}>{summary}</summary>
      <div className={styles['contenido']}>{children}</div>
    </details>
  );
}
