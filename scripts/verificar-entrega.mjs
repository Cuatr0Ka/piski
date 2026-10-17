// Comprueba que la entrega (dist/index.html) se puede abrir con doble clic: un solo archivo,
// sin scripts ni hojas de estilo externos y sin direcciones web de recursos (FR-030).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const errores = [];

if (!existsSync(`${dist}index.html`)) {
  console.error('Falta dist/index.html. Ejecuta primero: npm run build');
  process.exit(1);
}

const otros = readdirSync(dist).filter((n) => n !== 'index.html');
if (otros.length > 0) errores.push(`dist/ debe tener solo index.html, pero también tiene: ${otros.join(', ')}`);

const html = readFileSync(`${dist}index.html`, 'utf8');

const scriptsExternos = html.match(/<script\b[^>]*\bsrc=/g) ?? [];
if (scriptsExternos.length > 0) errores.push(`Hay ${scriptsExternos.length} <script src> externo(s); deben ir en línea.`);

const enlaces = html.match(/<link\b[^>]*>/g) ?? [];
if (enlaces.length > 0) errores.push(`Hay ${enlaces.length} <link> externo(s): ${enlaces.slice(0, 3).join(' ')}`);

// Direcciones permitidas: son texto, no peticiones (espacios de nombres SVG/XML y enlaces de ayuda
// dentro de mensajes de error de las bibliotecas).
const PERMITIDAS = [
  /^http:\/\/www\.w3\.org\//,
  /^https:\/\/react\.dev\/errors/,
  /^https?:\/\/json-schema\.org\//, // identificadores de esquema dentro de Zod
  /^http:\/\/\[\$\{/, // plantilla de texto para armar direcciones IPv6 dentro de Zod
];
const direcciones = new Set(html.match(/https?:\/\/[^\s"'`)<>\\]+/g) ?? []);
const sospechosas = [...direcciones].filter((d) => !PERMITIDAS.some((p) => p.test(d)));
if (sospechosas.length > 0) errores.push(`Direcciones web no permitidas:\n  ${sospechosas.slice(0, 10).join('\n  ')}`);

if (!/font-family:\s*Inter|font-family:"Inter"/.test(html) || !html.includes('data:font/woff2')) {
  errores.push('La tipografía Inter debe ir incrustada como data:font/woff2.');
}

if (errores.length > 0) {
  console.error(`La entrega no cumple:\n- ${errores.join('\n- ')}`);
  process.exit(1);
}
console.log('Entrega verificada: un solo archivo, sin recursos externos.');
