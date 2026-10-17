import {
  fontFamily,
  motion,
  radius,
  shadows,
  sizes,
  space,
  strokes,
  themes,
  typography,
} from '../../core/tokens/tokens';
import type { ThemeName } from '../../core/tokens/tokens';

const px = (n: number) => `${n}px`;

function colorVars(tema: ThemeName): string {
  return Object.entries(themes[tema])
    .map(([nombre, valor]) => `  --${nombre}: ${valor};`)
    .join('\n');
}

function escalaVars(): string {
  const lineas: string[] = [`  --font-family: ${fontFamily};`];
  for (const [k, v] of Object.entries(space)) lineas.push(`  --${k}: ${px(v)};`);
  for (const [k, v] of Object.entries(radius)) lineas.push(`  --${k}: ${px(v)};`);
  for (const [k, v] of Object.entries(strokes)) lineas.push(`  --${k}: ${px(v)};`);
  for (const [k, v] of Object.entries(sizes)) lineas.push(`  --${k}: ${px(v)};`);
  for (const [k, v] of Object.entries(motion)) lineas.push(`  --${k}: ${v};`);
  for (const [k, v] of Object.entries(shadows)) lineas.push(`  --${k}: ${v};`);
  return lineas.join('\n');
}

function clasesTipograficas(): string {
  return Object.entries(typography)
    .map(
      ([nombre, t]) =>
        `.type-${nombre} { font-size: ${px(t.size)}; line-height: ${px(t.line)}; font-weight: ${t.weight}; }`,
    )
    .join('\n');
}

/** CSS con las variables de ambos temas (el claro es el base) y las clases tipográficas `.type-<estilo>`. */
export function buildThemeCss(): string {
  return [
    `:root {\n${colorVars('light')}\n${escalaVars()}\n}`,
    `:root[data-theme="dark"] {\n${colorVars('dark')}\n}`,
    clasesTipograficas(),
  ].join('\n\n');
}

/** Instala las variables CSS en el documento. El tema claro es el predeterminado y no sigue el del sistema. */
export function installTheme(doc: Document = document): void {
  const style = doc.createElement('style');
  style.setAttribute('data-tokens', '');
  style.textContent = buildThemeCss();
  doc.head.appendChild(style);
}
