import { textos } from '../../core/i18n/textos';
import type { EstadoClave } from '../../core/i18n/textos';
import styles from './RegionMap.module.css';
import { StatusShape } from './StatusShape';

export interface MapMunicipality {
  name: string;
  paths: string[];
  label: { x: number; y: number };
}
export interface MapWaterway {
  name: string;
  main: boolean;
  paths: string[];
}
export interface MapPlace {
  name: string;
  town: boolean;
  x: number;
  y: number;
}
export interface MapBeacon {
  id: string;
  name: string;
  x: number;
  y: number;
  kind: EstadoClave;
  selected: boolean;
}

interface Props {
  width: number;
  height: number;
  ariaLabel: string;
  municipalities: MapMunicipality[];
  waterways: MapWaterway[];
  reservoirs: string[];
  places: MapPlace[];
  beacons: MapBeacon[];
  onSelect: (id: string) => void;
}

/**
 * Mapa vectorial de la región, dibujado en SVG (sin mapas en línea, funciona sin red). Las balizas son
 * botones sobre el mapa; su estado se ve por forma, color y palabra, nunca solo por color.
 */
export function RegionMap({
  width,
  height,
  ariaLabel,
  municipalities,
  waterways,
  reservoirs,
  places,
  beacons,
  onSelect,
}: Props) {
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  return (
    <div className={styles['lienzo']} style={{ aspectRatio: `${width} / ${height}`, width: `min(100%, calc(70vh * ${width / height}))` }}>
      <svg className={styles['svg']} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        {municipalities.map((m, i) => (
          <g key={m.name}>
            {m.paths.map((d, j) => (
              <path key={j} d={d} className={i % 2 === 0 ? styles['municipioA'] : styles['municipioB']} />
            ))}
          </g>
        ))}
        {waterways
          .filter((w) => !w.main)
          .flatMap((w) => w.paths.map((d, i) => <path key={`${w.name}-${i}`} d={d} className={styles['cauce']} />))}
        {reservoirs.map((d, i) => (
          <path key={i} d={d} className={styles['presa']} />
        ))}
        {waterways
          .filter((w) => w.main)
          .flatMap((w) => w.paths.map((d, i) => <path key={`${w.name}-${i}`} d={d} className={styles['arroyo']} />))}
        {places.map((p) => (
          <g key={p.name}>
            <circle cx={p.x} cy={p.y} r={p.town ? 5 : 3} className={styles['lugar']} />
            {p.town && (
              <text x={p.x + 9} y={p.y + 4} className={`${styles['lugarTexto']} type-label`}>
                {p.name}
              </text>
            )}
          </g>
        ))}
        {municipalities.map((m) => (
          <text
            key={m.name}
            x={m.label.x}
            y={m.label.y}
            textAnchor="middle"
            className={`${styles['municipioTexto']} type-title-md`}
          >
            {m.name}
          </text>
        ))}
      </svg>
      {beacons.map((b) => (
        <button
          key={b.id}
          type="button"
          className={`${styles['baliza']} ${b.selected ? styles['activa'] : ''}`}
          style={{ left: pct(b.x, width), top: pct(b.y, height) }}
          aria-label={textos.mapa.marcaBaliza(b.name, textos.estados[b.kind].palabra)}
          aria-pressed={b.selected}
          onClick={() => onSelect(b.id)}
        >
          <StatusShape kind={b.kind} size={34} />
        </button>
      ))}
    </div>
  );
}
