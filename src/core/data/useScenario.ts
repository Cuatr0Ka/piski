import { useContext } from 'react';
import { DataContext } from './DataContext';
import type { DataContextValue } from './DataContext';

/** Datos del escenario activo. Debe usarse dentro de `DataProvider`. */
export function useScenario(): DataContextValue {
  const valor = useContext(DataContext);
  if (valor === null) throw new Error('useScenario debe usarse dentro de DataProvider.');
  return valor;
}
