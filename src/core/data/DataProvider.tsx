import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DataContext } from './DataContext';
import type { DataContextValue } from './DataContext';
import { scenarioRepository } from './scenarioRepository';
import type { LoadedScenario, ScenarioRepository } from './scenarioRepository';

interface Props {
  /** El escenario que se quiere ver (viene de la dirección, `#/…?e=<id>`). */
  scenarioId: string;
  repository?: ScenarioRepository;
  children: ReactNode;
}

/**
 * Carga el escenario pedido a través del repositorio. Si un escenario es inválido, muestra el error
 * y sigue mostrando el último escenario válido (principio VII): nunca deja la pantalla en blanco.
 */
export function DataProvider({ scenarioId, repository = scenarioRepository, children }: Props) {
  const [scenario, setScenario] = useState<LoadedScenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pedido = useRef(0);

  useEffect(() => {
    const token = ++pedido.current;
    void repository.get(scenarioId).then((r) => {
      if (token !== pedido.current) return; // llegó una respuesta de un pedido anterior
      if (r.ok) {
        setScenario(r.value);
        setError(null);
      } else {
        setError(r.message);
      }
    });
  }, [scenarioId, repository]);

  const valor = useMemo<DataContextValue>(() => {
    const status = error !== null ? 'error' : scenario === null ? 'loading' : 'ready';
    return { status, scenarioId, scenario, error, entries: repository.list() };
  }, [scenarioId, scenario, error, repository]);

  return <DataContext.Provider value={valor}>{children}</DataContext.Provider>;
}
