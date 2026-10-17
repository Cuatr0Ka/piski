import { useMemo } from 'react';
import { useScenario } from '../../../core/data';
import { cleanReadings } from '../../../core/readings/cleanReadings';
import { rainTotals } from '../../../core/readings/rainTotals';
import { buildChartData } from '../services/chartData';
import { forecast } from '../services/forecast';

/** Pronóstico del escenario activo, con los datos de su gráfica, calculado con su "ahora" fijo. */
export function usePronostico() {
  const { scenario } = useScenario();
  return useMemo(() => {
    if (scenario === null) return null;
    const { readings } = cleanReadings(scenario.readings, scenario.config, scenario.now);
    const pronostico = forecast(scenario.readings, scenario.config, scenario.now);
    return {
      pronostico,
      config: scenario.config,
      now: scenario.now,
      offsetMin: scenario.offsetMin,
      ultima: readings[readings.length - 1],
      lluvia: rainTotals(readings, scenario.config.rain_windows_h, scenario.now),
      chart: buildChartData(readings, pronostico, scenario.config, scenario.now),
    };
  }, [scenario]);
}
