import { useEffect, useState } from 'react';
import { textos } from '../../core/i18n/textos';
import logo from '../../assets/piski-logo.png';
import styles from './Splash.module.css';

interface Props {
  /** Milisegundos que la pantalla se queda visible antes de desvanecerse. */
  visibleMs?: number;
  /** Milisegundos que dura el desvanecimiento. */
  fadeMs?: number;
}

/**
 * Pantalla de bienvenida: el logo y el nombre al abrir o recargar la página. Se desvanece sola y deja ver
 * la app; también se puede cerrar con un clic o con cualquier tecla. Con "reducir movimiento" no se anima.
 */
export function Splash({ visibleMs = 1600, fadeMs = 400 }: Props) {
  const [fase, setFase] = useState<'visible' | 'saliendo' | 'fuera'>('visible');

  useEffect(() => {
    if (fase === 'fuera') return;
    const t = setTimeout(
      () => setFase(fase === 'visible' ? 'saliendo' : 'fuera'),
      fase === 'visible' ? visibleMs : fadeMs,
    );
    return () => clearTimeout(t);
  }, [fase, visibleMs, fadeMs]);

  useEffect(() => {
    const cerrar = () => setFase((f) => (f === 'visible' ? 'saliendo' : f));
    window.addEventListener('keydown', cerrar);
    return () => window.removeEventListener('keydown', cerrar);
  }, []);

  if (fase === 'fuera') return null;

  return (
    <div
      className={`${styles['splash']} ${fase === 'saliendo' ? styles['saliendo'] : ''}`}
      style={{ transitionDuration: `${fadeMs}ms` }}
      role="presentation"
      data-testid="splash"
      onClick={() => setFase((f) => (f === 'visible' ? 'saliendo' : f))}
    >
      <img className={styles['logo']} src={logo} alt={textos.marca.logoAlt} />
      <p className={`${styles['nombre']} type-value-xl`}>{textos.marca.nombre}</p>
      <p className={`${styles['subtitulo']} type-body`}>{textos.marca.subtitulo}</p>
    </div>
  );
}
