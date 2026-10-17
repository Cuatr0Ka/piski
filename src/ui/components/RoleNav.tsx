import type { ReactNode } from 'react';
import styles from './RoleNav.module.css';

export interface RoleNavItem {
  id: string;
  /** Nombre de la pantalla ("Estado actual"). */
  name: string;
  /** Para quién es ("Para: encargado del comité"). */
  role: string;
  /** Dirección del enlace; conserva el escenario elegido. */
  href: string;
  /** Ícono decorativo a la izquierda del nombre. */
  icon?: ReactNode;
}

interface Props {
  items: RoleNavItem[];
  activeId: string;
  /** Nombre accesible de la navegación. */
  label: string;
}

/**
 * Navegación lateral entre pantallas: enlaces con ícono, nombre y el rol debajo. La pantalla activa se distingue por su relleno `accent` (no solo por un subrayado).
 */
export function RoleNav({ items, activeId, label }: Props) {
  return (
    <nav className={styles['nav']} aria-label={label}>
      {items.map((item) => {
        const activa = item.id === activeId;
        return (
          <a
            key={item.id}
            href={item.href}
            className={`${styles['item']} ${activa ? styles['activa'] : ''}`}
            {...(activa ? { 'aria-current': 'page' as const } : {})}
          >
            {item.icon}
            <span className={styles['texto']}>
              <span className="type-body-strong">{item.name}</span>
              <span className="type-caption">{item.role}</span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}
