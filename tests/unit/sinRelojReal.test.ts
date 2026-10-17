import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const RAIZ = join(import.meta.dirname, '..', '..');

function listar(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    return statSync(ruta).isDirectory() ? listar(ruta) : [ruta];
  });
}

// FR-032: el "ahora" sale siempre del escenario; ninguna función lee el reloj real.
describe('Guardia: ninguna función lee el reloj real', () => {
  const patrones: Array<[string, RegExp]> = [
    ['Date.now(', /Date\.now\s*\(/],
    ['new Date() sin argumentos', /new Date\(\s*\)/],
    ['performance.now', /performance\.now\s*\(/],
  ];
  const archivos = listar(join(RAIZ, 'src')).filter((f) => /\.(ts|tsx)$/.test(f));

  for (const [nombre, patron] of patrones) {
    it(`no se usa ${nombre} en src/`, () => {
      const infractores = archivos
        .filter((f) => patron.test(readFileSync(f, 'utf8')))
        .map((f) => relative(RAIZ, f).split(sep).join('/'));
      expect(infractores, `El reloj real no se puede leer (${nombre})`).toEqual([]);
    });
  }
});
