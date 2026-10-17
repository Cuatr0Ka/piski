import { useId } from 'react';
import { textos } from '../../core/i18n/textos';
import { formatMm } from '../../core/utils/formatNumber';
import { Card } from './Card';
import styles from './LevelGauge.module.css';

export interface GaugeThresholds {
  reviewMm: number;
  stopMm: number;
  crossingMm: number;
}

interface Props {
  /** Nivel actual en mm, o null cuando no hay una lectura vigente ("Sin datos"). */
  levelMm: number | null;
  thresholds: GaugeThresholds;
  /** Frase bajo la barra ("Faltan 19 mm para No cruzar"). */
  caption: string;
}

// La escala llega un 20 % más allá del nivel del paso, para que el paso no quede pegado al borde.
const ESCALA = 1.2;

// Geometría del medidor de arco (semicírculo): centro (150, 150), radio 120.
const CX = 150;
const CY = 150;
const R = 120;
const punto = (fraccion: number, radio = R) => {
  const ang = Math.PI * (1 - fraccion);
  return { x: CX + radio * Math.cos(ang), y: CY - radio * Math.sin(ang) };
};

/**
 * Nivel actual contra el nivel del paso: medidor de arco con el valor en mm al centro, marcas de umbral
 * sobre el arco y una leyenda con sus valores. Una frase debajo dice cuánto falta.
 */
export function LevelGauge({ levelMm, thresholds, caption }: Props) {
  const titulo = useId();
  const max = thresholds.crossingMm * ESCALA;
  const fraccion = (v: number) => Math.min(0.999, Math.max(0, v / max));
  const marcas = [
    { nombre: textos.nivel.marcaRevisar, valor: thresholds.reviewMm, color: 'var(--warn-text)' },
    { nombre: textos.nivel.marcaNoCruzar, valor: thresholds.stopMm, color: 'var(--stop-text)' },
    { nombre: textos.nivel.marcaPaso, valor: thresholds.crossingMm, color: 'var(--ink)' },
  ];
  const conLectura = levelMm !== null;
  const inicio = punto(0);
  const fin = punto(1);
  const nivel = conLectura ? punto(fraccion(levelMm)) : inicio;

  return (
    <Card labelledBy={titulo}>
      <h2 id={titulo} className="type-title-md">
        {textos.nivel.titulo}
      </h2>

      <div className={styles['centro']}>
        <div
          className={styles['arco']}
          {...(conLectura
            ? {
                role: 'meter',
                'aria-label': textos.nivel.titulo,
                'aria-valuemin': 0,
                'aria-valuemax': max,
                'aria-valuenow': levelMm,
              }
            : {})}
        >
          <svg className={styles['svg']} viewBox="0 0 300 170" aria-hidden>
            <path
              d={`M ${inicio.x} ${inicio.y} A ${R} ${R} 0 0 1 ${fin.x} ${fin.y}`}
              fill="none"
              stroke="var(--surface-sunken)"
              strokeWidth={22}
              strokeLinecap="round"
            />
            {conLectura && levelMm > 0 && (
              <path
                d={`M ${inicio.x} ${inicio.y} A ${R} ${R} 0 0 1 ${nivel.x} ${nivel.y}`}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={22}
                strokeLinecap="round"
              />
            )}
            {marcas.map((m) => {
              const a = punto(fraccion(m.valor), R - 20);
              const b = punto(fraccion(m.valor), R + 20);
              return <line key={m.nombre} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={m.color} strokeWidth={3} />;
            })}
          </svg>
          <div className={styles['lectura']}>
            <span className="type-value-xl">{conLectura ? `${formatMm(levelMm)} mm` : textos.nivel.sinDato}</span>
            <span className={`${styles['suave']} type-label`}>
              {conLectura ? textos.nivel.delPaso(formatMm(thresholds.crossingMm)) : textos.nivel.sinLectura}
            </span>
          </div>
        </div>
      </div>

      <ul className={styles['leyenda']}>
        {marcas.map((m) => (
          <li key={m.nombre}>
            <span className={styles['punto']} style={{ background: m.color }} aria-hidden />
            <span className={`${styles['nombre']} type-label`}>{m.nombre}</span>
            <span className="type-body-strong">{`${formatMm(m.valor)} mm`}</span>
          </li>
        ))}
      </ul>

      <p className="type-label">{caption}</p>
    </Card>
  );
}
