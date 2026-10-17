import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface Props {
  /** Una frase que dice qué aparecerá aquí. */
  children: ReactNode;
  /** Acción opcional, por ejemplo un botón. */
  action?: ReactNode;
}

/** Estado vacío: dice qué aparecerá y, si aplica, ofrece una acción. */
export function EmptyState({ children, action }: Props) {
  return (
    <div className={`${styles['vacio']} type-body`}>
      <p>{children}</p>
      {action}
    </div>
  );
}
