import { textos } from '../../core/i18n/textos';
import type { EstadoClave } from '../../core/i18n/textos';
import { sizes } from '../../core/tokens/tokens';

interface Props {
  kind: EstadoClave;
  /** Lado en px; por omisión `shape-lg` (64). */
  size?: number;
}

/**
 * Forma del estado: círculo (Normal), triángulo (Revisar), octágono (No cruzar) y rombo vacío
 * (Sin datos). Cada forma lleva su signo y su `aria-label`: el estado nunca depende solo del color.
 */
export function StatusShape({ kind, size = sizes['shape-lg'] }: Props) {
  const etiqueta = textos.estados[kind].forma;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={etiqueta}
      style={{ flex: 'none' }}
    >
      {kind === 'normal' && (
        <>
          <circle cx="32" cy="32" r="30" fill="var(--state-ink)" />
          <path
            d="M19 33l9 9 17-19"
            fill="none"
            stroke="var(--ok-fill)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {kind === 'review' && (
        <>
          <polygon
            points="32,4 61,57 3,57"
            fill="var(--state-ink)"
            stroke="var(--state-ink)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M32 24v16" stroke="var(--warn-fill)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="32" cy="48" r="3" fill="var(--warn-fill)" />
        </>
      )}
      {kind === 'stop' && (
        <>
          <polygon points="20,2 44,2 62,20 62,44 44,62 20,62 2,44 2,20" fill="var(--state-ink)" />
          <path d="M22 22l20 20M42 22L22 42" stroke="var(--stop-fill)" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      {kind === 'nodata' && (
        <>
          <polygon
            points="32,3 61,32 32,61 3,32"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <text
            x="32"
            y="42"
            textAnchor="middle"
            fontSize="28"
            fontWeight="700"
            fill="var(--ink)"
            fontFamily="inherit"
          >
            ?
          </text>
        </>
      )}
    </svg>
  );
}
