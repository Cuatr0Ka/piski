// Genera data/mapa/region.json: la región del mapa (Huauchinango, con Necaxa, y Xicotepec, Sierra Norte de Puebla).
// Fuentes (se descargan una sola vez; el panel no necesita red al abrirse):
//   - Límites municipales: INEGI, Marco Geoestadístico (servicio gaia.inegi.org.mx).
//   - Cauces, presas y localidades: © colaboradores de OpenStreetMap (ODbL), vía Overpass.
// Las balizas son de ejemplo: se colocan a lo largo del arroyo La Morena (cauce con nombre en OpenStreetMap
// que corre dentro de Huauchinango), que se usa como arroyo de ejemplo.
// Uso: npm run generar:mapa
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DESTINO = fileURLToPath(new URL('../data/mapa/', import.meta.url));
const MUNICIPIOS = { '21071': 'Huauchinango', '21197': 'Xicotepec de Juárez' };
const ARROYO = 'La Morena';
const AGENTE = 'piski-panel/0.1 (proyecto educativo; datos simulados)';

const redondea = (n) => Math.round(n * 1e4) / 1e4;

/** Douglas-Peucker sobre una línea de [lon, lat]. */
function simplifica(pts, tol) {
  if (pts.length < 3) return pts;
  const dist = (p, a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const t = dx === 0 && dy === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  };
  const mantener = new Array(pts.length).fill(false);
  mantener[0] = mantener[pts.length - 1] = true;
  const pila = [[0, pts.length - 1]];
  while (pila.length) {
    const [i, j] = pila.pop();
    let max = 0;
    let k = -1;
    for (let m = i + 1; m < j; m++) {
      const d = dist(pts[m], pts[i], pts[j]);
      if (d > max) {
        max = d;
        k = m;
      }
    }
    if (max > tol) {
      mantener[k] = true;
      pila.push([i, k], [k, j]);
    }
  }
  return pts.filter((_, i) => mantener[i]);
}

const adentro = (pt, anillo) => {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
};

async function overpass(consulta) {
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'User-Agent': AGENTE, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(consulta),
  });
  if (!r.ok) throw new Error(`Overpass respondió ${r.status}`);
  return (await r.json()).elements;
}

// 1. Municipios (INEGI)
const resp = await fetch('https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgem/21', { headers: { 'User-Agent': AGENTE } });
if (!resp.ok) throw new Error(`INEGI respondió ${resp.status}`);
const inegi = await resp.json();
const municipios = [];
for (const f of inegi.features) {
  const nombre = MUNICIPIOS[f.properties.cvegeo];
  if (!nombre) continue;
  const polis = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
  municipios.push({
    id: f.properties.cvegeo,
    name: nombre,
    polygons: polis.map((p) => p.map((anillo) => simplifica(anillo, 0.0006).map(([x, y]) => [redondea(x), redondea(y)]))),
  });
}
let [w, s, e, n] = [180, 90, -180, -90];
for (const m of municipios) for (const p of m.polygons) for (const [x, y] of p[0]) {
  w = Math.min(w, x); s = Math.min(s, y); e = Math.max(e, x); n = Math.max(n, y);
}
const bbox = [w, s, e, n].map(redondea);
const enMunicipio = (pt) => municipios.find((m) => m.polygons.some((p) => adentro(pt, p[0])));

// 2. Cauces, presas y localidades (OpenStreetMap)
const caja = `(${s},${w},${n},${e})`;
const elementos = await overpass(
  `[out:json][timeout:90];(way["waterway"~"^(river|stream)$"][name]${caja};way["natural"="water"][name]${caja};` +
    `node["place"~"city|town|village"]${caja};node["place"]["name"~"Necaxa"]${caja};);out geom;`,
);

const cauces = new Map();
for (const el of elementos) {
  const t = el.tags ?? {};
  if (el.type !== 'way' || !t.waterway) continue;
  // Se recorta al interior de los dos municipios: cada tramo continuo dentro de ellos es una línea.
  const tramos = [];
  let actual = [];
  for (const g of el.geometry) {
    if (enMunicipio([g.lon, g.lat])) actual.push([g.lon, g.lat]);
    else {
      if (actual.length > 1) tramos.push(actual);
      actual = [];
    }
  }
  if (actual.length > 1) tramos.push(actual);
  for (const tramo of tramos) {
    const pts = simplifica(tramo, 0.0004).map(([x, y]) => [redondea(x), redondea(y)]);
    if (pts.length < 2) continue;
    if (!cauces.has(t.name)) cauces.set(t.name, { name: t.name, kind: t.waterway, lines: [] });
    cauces.get(t.name).lines.push(pts);
  }
}
// Solo los cauces con tramo largo, para que el mapa se lea: La Morena es el arroyo de ejemplo.
const longitud = (lineas) => lineas.reduce((a, l) => a + l.reduce((b, p, i) => (i ? b + Math.hypot(p[0] - l[i - 1][0], p[1] - l[i - 1][1]) : b), 0), 0);
const waterways = [...cauces.values()]
  .filter((c) => c.name === ARROYO || longitud(c.lines) > 0.04)
  .map((c) => ({ name: c.name, main: c.name === ARROYO, lines: c.lines }));

const reservoirs = elementos
  .filter((el) => el.type === 'way' && el.tags?.natural === 'water' && el.tags.name && /presa|tejocotal|necaxa|omiltemetl/i.test(el.tags.name))
  // Solo las presas que están dentro de los municipios del mapa.
  .filter((el) => enMunicipio([el.geometry[0].lon, el.geometry[0].lat]))
  .map((el) => ({ name: el.tags.name, ring: simplifica(el.geometry.map((g) => [g.lon, g.lat]), 0.0003).map(([x, y]) => [redondea(x), redondea(y)]) }));

const lugares = elementos
  .filter((el) => el.type === 'node' && el.tags?.name)
  .map((el) => ({ name: el.tags.name, kind: el.tags.place === 'town' || el.tags.place === 'city' ? 'town' : 'village', lon: redondea(el.lon), lat: redondea(el.lat) }));
// Necaxa (localidad de Huauchinango) no tiene nodo propio en OpenStreetMap: se coloca de forma aproximada
// junto a Necaxaltépetl, dentro de Huauchinango. Nuevo Necaxa queda fuera (es de otro municipio).
const places = lugares.filter((l) => enMunicipio([l.lon, l.lat]) && l.name !== 'Necaxaltépetl');
places.push({ name: 'Necaxa', kind: 'town', lon: -97.9958, lat: 20.2328 });

// 3. Balizas de ejemplo a lo largo del Río Necaxa, dentro de Huauchinango
const huauchinango = municipios.find((m) => m.id === '21071');
const principal = cauces.get(ARROYO);
const tramo = principal.lines
  .flat()
  .filter((p) => huauchinango.polygons.some((poly) => adentro(p, poly[0])))
  .sort((a, b) => a[1] - b[1]);
const elegir = (f) => tramo[Math.min(tramo.length - 1, Math.floor(tramo.length * f))];
const nombresBalizas = ['Baliza La Morena (aguas arriba)', 'Baliza Paso La Morena', 'Baliza La Morena (aguas abajo)'];
const factores = [0.88, 1, 1.12];
const beacons = [0.1, 0.5, 0.9].map((f, i) => {
  const [lon, lat] = elegir(f);
  return { id: `baliza-${i + 1}`, name: nombresBalizas[i], lon, lat, municipality: 'Huauchinango', level_factor: factores[i] };
});

const salida = {
  schema_version: 1,
  name: 'Huauchinango, Necaxa y Xicotepec (Sierra Norte de Puebla)',
  attribution: 'Límites: INEGI, Marco Geoestadístico. Cauces y localidades: © colaboradores de OpenStreetMap (ODbL).',
  bbox,
  municipalities: municipios,
  waterways,
  reservoirs,
  places,
  beacons,
};

mkdirSync(DESTINO, { recursive: true });
const ruta = DESTINO + 'region.json';
writeFileSync(ruta, JSON.stringify(salida) + '\n', 'utf8');
console.log(`Mapa generado: ${ruta} (${Math.round(JSON.stringify(salida).length / 1024)} KB)`);
console.log(`Cauces: ${waterways.length}, presas: ${reservoirs.length}, localidades: ${places.length}, balizas: ${beacons.length}`);
