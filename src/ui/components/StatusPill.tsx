import { textos } from '../../core/i18n/textos';
import type { EstadoClave } from '../../core/i18n/textos';
import styles from './StatusPill.module.css';
import { StatusShape } from './StatusShape';

interface Props {
  kind: EstadoClave;
}

/** Forma pequeña y palabra del estado, en línea (por ejemplo en un renglón de una tarjeta). */
export function StatusPill({ kind }: Props) {
  return (
    <span className={`${styles['pill']} type-label`}>
      <StatusShape kind={kind} size={24} />
      {textos.estados[kind].palabra}
    </span>
  );
}
