import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const RAIZ = join(import.meta.dirname, '..', '..');
const SRC = join(RAIZ, 'src');
const ARCHIVO_TOKENS = join('src', 'core', 'tokens', 'tokens.ts');

function listar(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    return statSync(ruta).isDirectory() ? listar(ruta) : [ruta];
  });
}

const archivos = listar(SRC).filter((f) => /\.(css|ts|tsx)$/.test(f));
const leer = (f: string) => readFileSync(f, 'utf8');
const rel = (f: string) => relative(RAIZ, f).split(sep).join('/');

describe('Guardias de los tokens de diseño', () => {
  it('define cada hex de estado una sola vez, y solo en tokens.ts', () => {
    for (const hex of ['#2fd1a5', '#f5b942', '#ef5b5b']) {
      const apariciones = archivos.filter((f) => leer(f).toLowerCase().includes(hex));
      expect(apariciones.map(rel), `El hex ${hex} debe aparecer solo en tokens.ts`).toEqual([
        ARCHIVO_TOKENS.split(sep).join('/'),
      ]);
      const veces = leer(join(RAIZ, ARCHIVO_TOKENS)).toLowerCase().split(hex).length - 1;
      expect(veces, `El hex ${hex} debe definirse una sola vez`).toBe(1);
    }
  });

  it('no usa text-shadow, drop-shadow ni degradados', () => {
    const prohibido = /text-shadow|drop-shadow|linear-gradient|radial-gradient|conic-gradient/;
    const infractores = archivos.filter((f) => prohibido.test(leer(f))).map(rel);
    expect(infractores, 'No debe haber sombras de texto ni degradados en el código').toEqual([]);
  });

  it('solo permite box-shadow con los tokens de sombra o con none', () => {
    const permitidos = new Set(['var(--shadow-sm)', 'var(--shadow-md)', 'none']);
    const infracciones: string[] = [];
    for (const f of archivos.filter((x) => !rel(x).startsWith('src/core/tokens/'))) {
      for (const m of leer(f).matchAll(/box-shadow\s*:\s*([^;}`]+)/g)) {
        const valor = (m[1] ?? '').trim();
        if (!permitidos.has(valor)) infracciones.push(`${rel(f)}: ${valor}`);
      }
    }
    expect(infracciones, 'Toda sombra debe ser shadow-sm, shadow-md o none').toEqual([]);
  });

  it('define exactamente dos sombras suaves de tarjeta, sin propagación', () => {
    const tokens = leer(join(RAIZ, ARCHIVO_TOKENS));
    const sombras = [...tokens.matchAll(/'shadow-(?:sm|md)': '0 (\d+)px (\d+)px (\d+) rgba\(/g)];
    expect(sombras.length, 'Deben existir las dos sombras de tarjeta').toBe(2);
    for (const m of sombras) expect(m[3], 'La propagación debe ser 0').toBe('0');
  });

  it('no hay colores sueltos fuera de tokens.ts', () => {
    const suelto = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
    const infractores = archivos
      .filter((f) => rel(f) !== ARCHIVO_TOKENS.split(sep).join('/'))
      .filter((f) => suelto.test(leer(f)))
      .map(rel);
    expect(infractores, 'Los colores deben venir de los tokens').toEqual([]);
  });

  it('no escribe tamaños de letra sueltos fuera de src/ui/theme', () => {
    const infractores = archivos
      .filter((f) => !rel(f).startsWith('src/ui/theme/'))
      .filter((f) => /font-size\s*:/.test(leer(f)))
      .map(rel);
    expect(infractores, 'Los tamaños de letra salen de las clases .type-*').toEqual([]);
  });
});
