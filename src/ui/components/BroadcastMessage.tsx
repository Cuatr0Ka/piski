import { useEffect, useId, useState } from 'react';
import { textos } from '../../core/i18n/textos';
import { copyText } from '../../core/utils/copyText';
import styles from './BroadcastMessage.module.css';
import { Button } from './Button';
import { Card } from './Card';
import { Tag } from './Tag';
import { Copy } from '../icons';

interface Props {
  /** Mensaje de ejemplo del estado vigente. */
  message: string;
}

/**
 * "Qué avisar": mensaje de ejemplo listo para leer por radio o teléfono y para copiar.
 * El panel NO envía nada: una persona lo confirma y lo difunde.
 */
export function BroadcastMessage({ message }: Props) {
  const titulo = useId();
  const [resultado, setResultado] = useState<'ninguno' | 'copiado' | 'fallo'>('ninguno');

  // Si cambia el estado (y con él el mensaje), la confirmación anterior ya no aplica.
  useEffect(() => setResultado('ninguno'), [message]);

  async function copiar() {
    setResultado((await copyText(message)) ? 'copiado' : 'fallo');
  }

  return (
    <Card labelledBy={titulo}>
      <div className={styles['cabecera']}>
        <h2 id={titulo} className="type-title-md">
          {textos.avisar.titulo}
        </h2>
        <Tag>{textos.avisar.etiqueta}</Tag>
      </div>
      <p className={`${styles['cita']} type-title-md`}>{message}</p>
      <div className={styles['accion']}>
        <Button variant="primary" icon={<Copy size={20} aria-hidden />} onClick={copiar}>
          {textos.avisar.copiar}
        </Button>
        <span role="status" className="type-label">
          {resultado === 'copiado' ? textos.avisar.copiado : resultado === 'fallo' ? textos.avisar.noCopiado : ''}
        </span>
      </div>
      <p className={`${styles['nota']} type-caption`}>{textos.avisar.nota}</p>
    </Card>
  );
}
