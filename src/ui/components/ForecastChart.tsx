import { useId } from 'react';
import { textos } from '../../core/i18n/textos';
import { strokes } from '../../core/tokens/tokens';
import { Card } from './Card';
import { Disclosure } from './Disclosure';
import styles from './ForecastChart.module.css';
import { SimulatedBadge } from './SimulatedBadge';

/** Una lectura medida: horas respecto al "ahora" (negativas) y nivel en mm. */
export interface ChartReading {
  hours: number;
  level: number;
}

export interface ChartThreshold {
  label: string;
  valueMm: number;
  tone: 'review' | 'stop' | 'crossing';
}

export interface ChartProjection {
  horizonH: number;
  band: Array<{ h: number; lowMm: number; midMm: number; highMm: number }>;
}

export interface ChartTableRow {
  hora: string;
  nivel: string;
  origen: string;
}

interface Props {
  title: string;
  subtitle: string;
  readings: ChartReading[];
  thresholds: ChartThreshold[];
  /** Nivel máximo del eje vertical (por ejemplo 125 mm). */
  maxMm: number;
  /** Sin proyección la gráfica usa todo el ancho para las últimas horas. */
  projection?: ChartProjection;
  /** Etiqueta fija "Datos simulados" en el título de la gráfica. */
  simulated: boolean;
  /** Alternativa en texto (tabla) para lectores de pantalla. */
  table: ChartTableRow[];
}

const COLOR_UMBRAL: Record<ChartThreshold['tone'], string> = {
  review: 'var(--warn-text)',
  stop: 'var(--stop-text)',
  crossing: 'var(--ink-muted)',
};

const ANCHO = 800;
const ALTO = 420;
const MARGEN = { izquierda: 56, derecha: 24, arriba: 30, abajo: 44 };
const HORAS_ATRAS = 6;

const horaDeEje = (t: number): string =>
  t === 0 ? textos.grafica.ahora : t > 0 ? `+${t} h` : `−${Math.abs(t)} h`;

/**
 * Gráfica en SVG propio: nivel real, proyección discontinua, banda de incertidumbre de relleno sólido
 * (sin degradado), líneas de umbral con el color de su estado y una tabla como alternativa en texto.
 * Sin proyección, ocupa todo el ancho con las últimas horas (no reserva espacio para lo que no existe).
 */
export function ForecastChart({ title, subtitle, readings, thresholds, maxMm, projection, simulated, table }: Props) {
  const tituloId = useId();
  const xMin = -HORAS_ATRAS;
  const xMax = projection ? projection.horizonH : 0;
  const ancho = ANCHO - MARGEN.izquierda - MARGEN.derecha;
  const alto = ALTO - MARGEN.arriba - MARGEN.abajo;
  const x = (t: number) => MARGEN.izquierda + ((t - xMin) / (xMax - xMin)) * ancho;
  const y = (v: number) => MARGEN.arriba + (1 - v / maxMm) * alto;
  const punto = (t: number, v: number) => `${x(t).toFixed(1)},${y(v).toFixed(1)}`;
  const trazo = strokes['stroke-chart'];

  const visibles = readings.filter((r) => r.hours >= xMin);
  const paso = projection ? 2 : 1;
  const ticksX: number[] = [];
  for (let t = xMin; t <= xMax + 1e-9; t += paso) ticksX.push(t);
  const ticksY: number[] = [];
  for (let v = 0; v <= maxMm + 1e-9; v += maxMm / 5) ticksY.push(v);

  const descripcion = projection
    ? `${textos.grafica.alternativa}: últimas ${HORAS_ATRAS} horas y proyección de las próximas ${projection.horizonH} horas`
    : `${textos.grafica.alternativa}: últimas ${HORAS_ATRAS} horas`;

  return (
    <Card labelledBy={tituloId}>
      <div className={styles['cabecera']}>
        <h2 id={tituloId} className="type-title-md">
          {title}
        </h2>
        {simulated && <SimulatedBadge />}
      </div>
      <p className={`${styles['subtitulo']} type-caption`}>{subtitle}</p>

      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className={styles['grafica']} role="img" aria-label={descripcion}>
        {/* Rejilla y eje vertical (mm) */}
        {ticksY.map((v) => (
          <g key={`y${v}`}>
            <line
              x1={MARGEN.izquierda}
              x2={ANCHO - MARGEN.derecha}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--border)"
              strokeWidth={strokes['stroke-divider']}
            />
            <text x={MARGEN.izquierda - 10} y={y(v) + 4} textAnchor="end" fontSize={13} fill="var(--ink-muted)">
              {Math.round(v)}
            </text>
          </g>
        ))}
        <text x={MARGEN.izquierda - 10} y={MARGEN.arriba - 18} textAnchor="end" fontSize={13} fill="var(--ink-muted)">
          mm
        </text>

        {/* Eje horizontal (horas respecto al "ahora") */}
        {ticksX.map((t) => (
          <text key={`x${t}`} x={x(t)} y={ALTO - 16} textAnchor="middle" fontSize={13} fill="var(--ink-muted)">
            {horaDeEje(t)}
          </text>
        ))}
        <line
          x1={MARGEN.izquierda}
          x2={ANCHO - MARGEN.derecha}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--ink)"
          strokeWidth={trazo}
        />
        <line x1={MARGEN.izquierda} x2={MARGEN.izquierda} y1={MARGEN.arriba} y2={y(0)} stroke="var(--ink)" strokeWidth={trazo} />

        {/* Banda de incertidumbre: relleno sólido, sin degradado */}
        {projection && (
          <>
            <polygon
              data-serie="banda"
              fill="var(--accent-soft)"
              points={[
                ...projection.band.map((b) => punto(b.h, b.highMm)),
                ...[...projection.band].reverse().map((b) => punto(b.h, b.lowMm)),
              ].join(' ')}
            />
            <polyline
              data-serie="banda-borde-alto"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={strokes['stroke-divider']}
              strokeDasharray="3 4"
              points={projection.band.map((b) => punto(b.h, b.highMm)).join(' ')}
            />
            <polyline
              data-serie="banda-borde-bajo"
              fill="none"
              stroke="var(--accent)"
              strokeWidth={strokes['stroke-divider']}
              strokeDasharray="3 4"
              points={projection.band.map((b) => punto(b.h, b.lowMm)).join(' ')}
            />
          </>
        )}

        {/* Umbrales: color del estado que activan y etiqueta de texto */}
        {thresholds.map((u) => {
          const yy = y(u.valueMm);
          const ancho_ = u.label.length * 7.4 + 14;
          return (
            <g key={u.tone}>
              <line
                data-umbral={u.tone}
                x1={MARGEN.izquierda}
                x2={ANCHO - MARGEN.derecha}
                y1={yy}
                y2={yy}
                stroke={COLOR_UMBRAL[u.tone]}
                strokeWidth={trazo}
                {...(u.tone === 'crossing' ? { strokeDasharray: '2 4' } : {})}
              />
              <rect x={MARGEN.izquierda + 8} y={yy - 25} width={ancho_} height={21} fill="var(--surface-raised)" />
              <text x={MARGEN.izquierda + 14} y={yy - 9} fontSize={13} fontWeight={600} fill={COLOR_UMBRAL[u.tone]}>
                {u.label}
              </text>
            </g>
          );
        })}

        {/* Línea de "ahora" */}
        <line
          x1={x(0)}
          x2={x(0)}
          y1={MARGEN.arriba}
          y2={y(0)}
          stroke="var(--ink)"
          strokeWidth={strokes['stroke-divider'] + 1}
          strokeDasharray="2 5"
        />

        {/* Proyección central (discontinua) y nivel real */}
        {projection && (
          <polyline
            data-serie="proyeccion"
            fill="none"
            stroke="var(--accent)"
            strokeWidth={trazo}
            strokeDasharray="8 6"
            points={projection.band.map((b) => punto(b.h, b.midMm)).join(' ')}
          />
        )}
        <polyline
          data-serie="real"
          fill="none"
          stroke="var(--accent)"
          strokeWidth={trazo}
          strokeLinejoin="round"
          points={visibles.map((r) => punto(r.hours, r.level)).join(' ')}
        />
        {visibles.length < 6 &&
          visibles.map((r) => (
            <circle key={r.hours} cx={x(r.hours)} cy={y(r.level)} r={4} fill="var(--accent)" />
          ))}
      </svg>

      <div className={`${styles['leyenda']} type-label`}>
        <span className={styles['item']}>
          <i className={styles['trazoReal']} />
          {textos.grafica.leyendaReal}
        </span>
        {projection && (
          <>
            <span className={styles['item']}>
              <i className={styles['trazoProyeccion']} />
              {textos.grafica.leyendaProyeccion}
            </span>
            <span className={styles['item']}>
              <i className={styles['muestraBanda']} />
              {textos.grafica.leyendaBanda}
            </span>
          </>
        )}
      </div>

      <div className={styles['tabla']}>
        <Disclosure summary={textos.grafica.verTabla}>
          <table className={`${styles['datos']} type-body`}>
            <thead>
              <tr>
                <th scope="col">{textos.grafica.tabla.hora}</th>
                <th scope="col">{textos.grafica.tabla.nivel}</th>
                <th scope="col">{textos.grafica.tabla.origen}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((f) => (
                <tr key={`${f.hora}-${f.origen}`}>
                  <td>{f.hora}</td>
                  <td>{f.nivel}</td>
                  <td>{f.origen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Disclosure>
      </div>
    </Card>
  );
}
