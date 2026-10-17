import { createContext } from 'react';
import type { LoadedScenario, ScenarioEntry } from './scenarioRepository';

export interface DataContextValue {
  /** `loading` solo mientras no hay ningún escenario válido; `error` si el pedido falló. */
  status: 'loading' | 'ready' | 'error';
  /** El escenario que se pidió (el del `hash`). */
  scenarioId: string;
  /** El escenario activo: el pedido si es válido; si no, el último válido (o null si aún no hay). */
  scenario: LoadedScenario | null;
  /** Mensaje accionable, en español y sin trazas, si el escenario pedido no se pudo leer. */
  error: string | null;
  entries: { demo: ScenarioEntry[]; test: ScenarioEntry[] };
}

export const DataContext = createContext<DataContextValue | null>(null);
