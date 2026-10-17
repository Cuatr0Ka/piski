import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** `primary`: acción principal de la pantalla (única con `shadow-sm`). `secondary`: el resto. */
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
  children: ReactNode;
}

/** Control con borde `ink` y alto mínimo de 40 px; se desplaza 2 px al presionarse. */
export function Button({ variant = 'secondary', icon, children, type = 'button', ...resto }: Props) {
  const clases = `${styles['btn']} ${styles[variant]} type-body-strong`;
  return (
    <button type={type} className={clases} {...resto}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
