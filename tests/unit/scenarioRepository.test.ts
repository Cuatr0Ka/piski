import { describe, expect, it } from 'vitest';
import { createScenarioRepository, scenarioRepository } from '../../src/core/data/scenarioRepository';
import { configEjemplo, escenarioEjemplo, lecturasEjemplo } from '../fixtures/ejemplos';

const base = '/proyecto/data/escenarios';

function archivosDe(id: string, extra: { meta?: object; config?: object; readings?: object } = {}) {
  return {
    [`${base}/${id}/escenario.json`]: { ...escenarioEjemplo, id, ...extra.meta },
    [`${base}/${id}/config.json`]: { ...configEjemplo, ...extra.config },
    [`${base}/${id}/readings.json`]: extra.readings ?? lecturasEjemplo,
  };
}

describe('Repositorio de escenarios (datos de prueba)', () => {
  const repo = createScenarioRepository({
    ...archivosDe('ciclon-inicio'),
    ...archivosDe('prueba-uno', { meta: { group: 'test', name: 'Prueba uno' } }),
    ...archivosDe('roto', { config: { schema_version: 2 } }),
    ...archivosDe('carpeta-uno', { meta: { id: 'otro-id' } }),
    ...archivosDe('ahora-viejo', { meta: { now: '2026-10-15T10:00:00-06:00' } }),
  });

  it('lista los escenarios agrupados en demo y test', () => {
    const { demo, test } = repo.list();
    expect(demo.map((e) => e.id)).toContain('ciclon-inicio');
    expect(test.map((e) => e.id)).toContain('prueba-uno');
    expect(demo.every((e) => e.group === 'demo')).toBe(true);
    expect(test.every((e) => e.group === 'test')).toBe(true);
  });

  it('carga un escenario válido con su "ahora" y su zona horaria', async () => {
    const r = await repo.get('ciclon-inicio');
    if (!r.ok) throw new Error(r.message);
    expect(r.value.meta.id).toBe('ciclon-inicio');
    expect(r.value.readings).toHaveLength(2);
    expect(r.value.now).toBe(Date.parse('2026-10-15T14:30:00-06:00'));
    expect(r.value.offsetMin).toBe(-360);
  });

  it('devuelve un error accionable si un archivo del escenario es inválido', async () => {
    const r = await repo.get('roto');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.message).toContain('config.json');
    expect(r.message).toContain('versión de esquema 2');
  });

  it('rechaza un escenario cuyo id no coincide con el nombre de la carpeta', async () => {
    const r = await repo.get('carpeta-uno');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('carpeta');
  });

  it('rechaza un escenario cuyo "ahora" es anterior a su última lectura', async () => {
    const r = await repo.get('ahora-viejo');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('ahora');
  });

  it('avisa con claridad si el escenario no existe', async () => {
    const r = await repo.get('no-existe');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('No existe el escenario');
  });

  it('informa los escenarios inválidos sin romper el listado', () => {
    const { test } = createScenarioRepository({
      ...archivosDe('mal-meta', { meta: { group: 'raro' } }),
    }).list();
    expect(test.map((e) => e.id)).toContain('mal-meta');
  });
});

describe('Repositorio de escenarios (datos incluidos en la entrega)', () => {
  const esperados = {
    demo: [
      'ciclon-inicio',
      'ciclon-no-cruzar',
      'ciclon-revisar',
      'estiaje',
      'lecturas-viejas',
      'pocas-lecturas',
      'tormenta-normal',
    ],
    test: [
      'lectura-espuria',
      'lectura-imposible',
      'nivel-baja',
      'nivel-plano',
      'ruido',
      'subida-acelerada',
    ],
  };

  it('incluye los 13 escenarios de ejemplo en sus dos grupos', () => {
    const { demo, test } = scenarioRepository.list();
    expect(demo.map((e) => e.id).sort()).toEqual(esperados.demo);
    expect(test.map((e) => e.id).sort()).toEqual(esperados.test);
  });

  it('todos los escenarios son válidos, simulados y con valores supuestos', async () => {
    for (const id of [...esperados.demo, ...esperados.test]) {
      const r = await scenarioRepository.get(id);
      if (!r.ok) throw new Error(`${id}: ${r.message}`);
      expect(r.value.config.assumed, `${id} debe marcar sus valores como supuestos`).toBe(true);
      expect(r.value.readings.every((l) => l.simulated), `${id} debe tener simulated: true`).toBe(true);
    }
  });
});
