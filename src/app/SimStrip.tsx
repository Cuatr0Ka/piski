import type { ScenarioEntry } from '../core/data';
import { textos } from '../core/i18n/textos';
import { ScenarioSelector } from './ScenarioSelector';
import styles from './SimStrip.module.css';

interface Props {
  /** `true` si la configuración del escenario marca sus valores como supuestos provisionales. */
  assumed: boolean;
  entries: { demo: ScenarioEntry[]; test: ScenarioEntry[] };
  value: string;
  onChange: (id: string) => void;
}

/**
 * Barra superior, siempre visible: "Datos simulados", la nota de umbrales provisionales y, al extremo
 * derecho, el selector de escenarios (el control de quien presenta).
 */
export function SimStrip({ assumed, entries, value, onChange }: Props) {
  return (
    <div className={styles['franja']}>
      <div className={styles['interior']}>
        <p className={`${styles['texto']} type-label`}>
          <strong>{textos.franja.etiqueta}</strong>
          {` · ${textos.franja.noSonReales}`}
          {assumed ? ` ${textos.franja.umbralesProvisionales}` : ''}
        </p>
        <ScenarioSelector entries={entries} value={value} onChange={onChange} />
      </div>
    </div>
  );
}
