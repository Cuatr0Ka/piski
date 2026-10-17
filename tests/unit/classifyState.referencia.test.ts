import { describe, expect, it } from 'vitest';
import type { Reading } from '../../src/core/schemas';
import { parseTimestamp } from '../../src/core/time/clock';
import { classifyState } from '../../src/features/estado/services/classifyState';
import type { EstadoPaso } from '../../src/features/estado/types';
import casos from '../casos/clasificacion.json';
import { configEjemplo } from '../fixtures/ejemplos';
import { isoDe, lecturas, ultimaMs } from '../fixtures/lecturas';

interface Explicita {
  minutosAntesDeAhora?: number;
  segundosDespuesDeAhora?: number;
  level_mm: number;
}
interface Caso {
  id: string;
  descripcion: string;
  niveles: number[];
  huecos?: Record<string, number>;
  ahoraMin?: number;
  ahoraIso?: string;
  ordenArchivo?: number[];
  explicitas?: Explicita[];
  esperado: {
    kind: EstadoPaso['kind'];
    noDataReason?: EstadoPaso['noDataReason'];
    discardedCount?: number;
  };
}

function armar(caso: Caso): { serie: Reading[]; ahora: number } {
  const huecos = Object.fromEntries(Object.entries(caso.huecos ?? {}).map(([k, v]) => [Number(k), v]));
  let serie = lecturas(caso.niveles, { huecos });
  const ahora = caso.ahoraIso ? parseTimestamp(caso.ahoraIso) : ultimaMs(serie) + (caso.ahoraMin ?? 5) * 60_000;

  for (const e of caso.explicitas ?? []) {
    const ms = e.minutosAntesDeAhora !== undefined ? ahora - e.minutosAntesDeAhora * 60_000 : ahora + (e.segundosDespuesDeAhora ?? 0) * 1_000;
    serie = [...serie, { timestamp: isoDe(ms), level_mm: e.level_mm, rain_mm: 0, simulated: true }];
  }
  if (caso.ordenArchivo) serie = caso.ordenArchivo.map((i) => serie[i] as Reading);
  return { serie, ahora };
}

// US7: la regla de clasificación se comprueba contra la tabla de casos de referencia, la misma que debe
// reproducir la baliza. Si un caso falla, se revisa la regla en conjunto; NO se cambia el resultado esperado.
describe('Clasificación del estado: tabla de casos de referencia C01 a C20', () => {
  const lista = casos.casos as unknown as Caso[];

  it('la tabla tiene los 20 casos del contrato, sin identificadores repetidos', () => {
    expect(lista.map((c) => c.id)).toEqual(Array.from({ length: 20 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`));
  });

  for (const caso of lista) {
    it(`${caso.id}: ${caso.descripcion}`, () => {
      const { serie, ahora } = armar(caso);
      const estado = classifyState(serie, configEjemplo, ahora);
      expect(estado.kind, `${caso.id}: estado`).toBe(caso.esperado.kind);
      if (caso.esperado.noDataReason !== undefined) {
        expect(estado.noDataReason, `${caso.id}: razón de Sin datos`).toBe(caso.esperado.noDataReason);
      }
      expect(estado.discardedCount, `${caso.id}: lecturas descartadas`).toBe(caso.esperado.discardedCount ?? 0);
    });
  }

  it('con el mismo config.json y las mismas lecturas el estado es siempre el mismo (repetible)', () => {
    for (const caso of lista) {
      const { serie, ahora } = armar(caso);
      expect(classifyState(serie, configEjemplo, ahora)).toEqual(classifyState(serie, configEjemplo, ahora));
    }
  });

  it('cambiar los números de lecturas sostenidas en la configuración cambia el resultado (no hay valores en el código)', () => {
    const { serie, ahora } = armar(lista.find((c) => c.id === 'C09') as Caso);
    expect(classifyState(serie, configEjemplo, ahora).kind).toBe('normal'); // bajar con 5
    const mas = { ...configEjemplo, sustain: { readings_to_raise: 3, readings_to_lower: 6 } };
    expect(classifyState(serie, mas, ahora).kind).toBe('stop'); // con 6, 5 lecturas no alcanzan
  });
});
