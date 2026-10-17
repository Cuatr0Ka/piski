import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface Props {
  /** Bloque principal de la pantalla: lleva la única sombra sólida mediana (`shadow-md`). */
  main?: boolean;
  /** Id del título que nombra la tarjeta (para lectores de pantalla). */
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}

/** Plano `surface-raised` con borde `ink`. Sin sombra salvo que sea el bloque principal. */
export function Card({ main = false, labelledBy, className, children }: Props) {
  const clases = [styles['card'], main ? styles['main'] : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <section className={clases} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}
