import { useCallback, useMemo, useSyncExternalStore } from 'react';

export type Screen = 'estado' | 'pronostico' | 'mapa';

export interface RouteState {
  screen: Screen;
  scenarioId: string;
}

/** Escenario con el que abre el panel cuando la dirección no trae ninguno. */
export const DEFAULT_SCENARIO = 'tormenta-normal';

const PANTALLAS: readonly Screen[] = ['estado', 'pronostico', 'mapa'];

/** Lee la pantalla y el escenario de una dirección como `#/pronostico?e=ciclon-inicio`. */
export function parseHash(hash: string): RouteState {
  const texto = hash.startsWith('#') ? hash.slice(1) : hash;
  const [ruta = '', consulta = ''] = texto.split('?');
  const nombre = ruta.replace(/^\//, '');
  const screen = PANTALLAS.find((p) => p === nombre) ?? 'estado';
  const scenarioId = new URLSearchParams(consulta).get('e') || DEFAULT_SCENARIO;
  return { screen, scenarioId };
}

export function buildHash({ screen, scenarioId }: RouteState): string {
  return `#/${screen}?e=${encodeURIComponent(scenarioId)}`;
}

function suscribir(alCambiar: () => void) {
  window.addEventListener('hashchange', alCambiar);
  return () => window.removeEventListener('hashchange', alCambiar);
}

const leerHash = () => window.location.hash;

/**
 * Navegación por `hash` sin librería de rutas: funciona al abrir el archivo con doble clic,
 * conserva pantalla y escenario al recargar y nunca recarga la página.
 */
export function useRoute() {
  const hash = useSyncExternalStore(suscribir, leerHash, () => '');
  const ruta = useMemo(() => parseHash(hash), [hash]);

  const ir = useCallback((destino: RouteState) => {
    const nuevo = buildHash(destino);
    if (window.location.hash !== nuevo) window.location.hash = nuevo;
  }, []);

  const navigate = useCallback((screen: Screen) => ir({ ...ruta, screen }), [ir, ruta]);
  const setScenario = useCallback((scenarioId: string) => ir({ ...ruta, scenarioId }), [ir, ruta]);

  return { ...ruta, navigate, setScenario };
}
