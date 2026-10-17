import { useId } from 'react';
import { textos } from '../../core/i18n/textos';
import { Card } from './Card';
import styles from './DataFreshness.module.css';

interface Props {
  /** "Última lectura hace 3 min" o "Sin lecturas desde las 11:30". */
  value: string;
  /** Fecha y hora ("15 oct, 14:27") o "hace 3 h · 15 oct, 11:30". */
  detail: string;
}

/** Antigüedad del dato: cada dato dice cuándo fue su última lectura. */
export function DataFreshness({ value, detail }: Props) {
  const titulo = useId();
  return (
    <Card labelledBy={titulo}>
      <h2 id={titulo} className="type-title-md">
        {textos.antiguedad.titulo}
      </h2>
      <p className={`${styles['valor']} type-value-lg`}>{value}</p>
      {detail !== '' && <p className={`${styles['detalle']} type-body`}>{detail}</p>}
    </Card>
  );
}
