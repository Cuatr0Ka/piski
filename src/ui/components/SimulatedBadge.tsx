import { textos } from '../../core/i18n/textos';
import styles from './SimulatedBadge.module.css';

/** Etiqueta fija "Datos simulados" (borde discontinuo, tratamiento neutro: no es un color de estado). */
export function SimulatedBadge() {
  return <span className={`${styles['badge']} type-caption`}>{textos.franja.etiqueta}</span>;
}
