import type { ReactNode } from 'react';
import styles from './Tag.module.css';

interface Props {
  /** `accent`: fondo azul suave (por ejemplo "Supuesto"). `neutral`: fondo hundido. */
  tone?: 'neutral' | 'accent';
  children: ReactNode;
}

/** Etiqueta pequeña de fondo suave y sin borde. */
export function Tag({ tone = 'neutral', children }: Props) {
  return <span className={`${styles['tag']} ${styles[tone]} type-caption`}>{children}</span>;
}
