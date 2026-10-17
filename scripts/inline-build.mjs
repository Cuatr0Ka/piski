// Deja la salida de Vite en UN solo index.html con el código y los estilos en línea.
// Motivo (R1 de research.md): Chrome no carga <script type="module" src> al abrir un archivo local
// (file://), pero un <script type="module"> en línea sí funciona. La tipografía ya va incrustada como data:
// en el CSS (assetsInlineLimit de vite.config.ts).
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const rutaHtml = `${dist}index.html`;
let html = readFileSync(rutaHtml, 'utf8');

const leer = (ruta) => readFileSync(`${dist}${ruta.replace(/^\.?\//, '')}`, 'utf8');
const atributo = (etiqueta, nombre) => new RegExp(`\\s${nombre}="([^"]*)"`).exec(etiqueta)?.[1];

// Hojas de estilo: <link rel="stylesheet" href="..."> -> <style>
html = html.replace(/<link\b[^>]*>/g, (etiqueta) => {
  const rel = atributo(etiqueta, 'rel');
  const href = atributo(etiqueta, 'href');
  if (rel === 'stylesheet' && href) return `<style>\n${leer(href)}\n</style>`;
  if (rel === 'modulepreload') return '';
  return etiqueta;
});

// Scripts: <script type="module" src="..."></script> -> <script type="module">...</script>
html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  // Se escapa lo que el analizador HTML podría confundir con el cierre del script o con un comentario.
  const codigo = leer(src).replaceAll('</script', '<\\/script').replaceAll('<!--', '<\\!--');
  return `<script type="module">\n${codigo}\n</script>`;
});

writeFileSync(rutaHtml, html);

// Solo queda index.html: se elimina todo lo demás (por ejemplo dist/assets).
for (const nombre of readdirSync(dist)) {
  if (nombre !== 'index.html') rmSync(`${dist}${nombre}`, { recursive: true, force: true });
}

console.log(`dist/index.html listo (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB, un solo archivo).`);
