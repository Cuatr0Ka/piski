import { useMemo } from 'react';
import { useScenario } from '../../../core/data';
import { cleanReadings } from '../../../core/readings/cleanReadings';
import { rainTotals } from '../../../core/readings/rainTotals';
import { classifyState } from '../services/classifyState';

/** Estado del paso y lluvia acumulada del escenario activo, calculados con su "ahora" fijo. */
export function useEstadoPaso() {
  const { scenario } = useScenario();
  return useMemo(() => {
    if (scenario === null) return null;
    const { readings } = cleanReadings(scenario.readings, scenario.config, scenario.now);
    return {
      estado: classifyState(scenario.readings, scenario.config, scenario.now),
      lluvia: rainTotals(readings, scenario.config.rain_windows_h, scenario.now),
      config: scenario.config,
      offsetMin: scenario.offsetMin,
    };
  }, [scenario]);
}
