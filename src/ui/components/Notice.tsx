import type { ReactNode } from 'react';
import styles from './Notice.module.css';

interface Props {
  icon?: ReactNode;
  children: ReactNode;
}

/** Aviso neutro con ícono (por ejemplo, lecturas descartadas o un error de datos). Se anuncia a lectores de pantalla. */
export function Notice({ icon, children }: Props) {
  return (
    <div className={`${styles['notice']} type-body`} role="status">
      {icon}
      <span>{children}</span>
    </div>
  );
}
