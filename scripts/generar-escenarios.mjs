// Genera de forma determinista los escenarios de ejemplo en data/escenarios/<id>/.
// Sin azar: el "ruido" son funciones seno, así que cada ejecución produce los mismos archivos.
// Todo está en milímetros (mm): el nivel del agua, los umbrales, el ritmo (mm/h) y la lluvia.
// Uso: npm run generar:escenarios
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DESTINO = fileURLToPath(new URL('../data/escenarios/', import.meta.url));

// El "ahora" fijo de todos los escenarios: 15 oct 2026, 14:30 (hora de México, -06:00).
const AHORA_UTC = Date.UTC(2026, 9, 15, 20, 30, 0);
const DESFASE_MIN = -360;

const CONFIG_EJEMPLO = {
  schema_version: 1,
  assumed: true,
  thresholds: { review_mm: 600, stop_mm: 850 },
  crossing_mm: 1000,
  sustain: { readings_to_raise: 3, readings_to_lower: 5 },
  max_reading_age_min: 30,
  rain_windows_h: [1, 3, 6],
  plausible_level_mm: { min: 0, max: 3000 },
  forecast: { window_min: 120, min_readings: 6, horizon_h: 6, flat_rate_mm_h: 5 },
};

const dos = (n) => String(n).padStart(2, '0');

/** Marca ISO 8601 con zona horaria -06:00 a partir de milisegundos UTC. */
function iso(ms) {
  const d = new Date(ms + DESFASE_MIN * 60_000);
  return (
    `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}` +
    `T${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}:${dos(d.getUTCSeconds())}-06:00`
  );
}

const redondear = (n) => Math.round(n * 10) / 10;

/**
 * Serie de lecturas cada 15 min, ordenada de la más vieja a la más reciente.
 * `nivel(u, k)`: nivel en mm; u = horas antes de la última lectura, k = posición hacia atrás (0 = la última).
 * `lluvia(u, k)`: lluvia caída desde la lectura anterior, en mm (por omisión, 0).
 */
function serie({ cantidad, ultimaHaceMin = 3, nivel, lluvia = () => 0, extras = [] }) {
  const lecturas = [];
  for (let k = 0; k < cantidad; k++) {
    const haceMin = ultimaHaceMin + 15 * k;
    lecturas.push({ ms: AHORA_UTC - haceMin * 60_000, level: nivel(k * 0.25, k), rain: Math.max(0, lluvia(k * 0.25, k)) });
  }
  for (const e of extras) {
    lecturas.push({ ms: AHORA_UTC - (ultimaHaceMin + 15 * e.k) * 60_000 + 60_000, level: e.level, rain: 0 });
  }
  lecturas.sort((a, b) => a.ms - b.ms);
  return lecturas.map((l) => ({
    timestamp: iso(l.ms),
    level_mm: redondear(l.level),
    rain_mm: redondear(l.rain),
    simulated: true,
  }));
}

const escenarios = [
  // ---------- Demostración ----------
  {
    id: 'tormenta-normal',
    group: 'demo',
    name: 'Tormenta normal',
    description: 'Nivel estable alrededor de 400 mm con ruido leve y lluvia ligera.',
    lecturas: serie({
      cantidad: 24,
      nivel: (u, k) => 400 + 15 * Math.sin(k * 1.3),
      lluvia: (u, k) => 0.3 + 0.3 * Math.sin(k * 1.7),
    }),
  },
  {
    id: 'ciclon-inicio',
    group: 'demo',
    name: 'Ciclón: inicio de la creciente',
    description: 'El nivel sube de forma sostenida bajo lluvia intensa; el pronóstico estima cuándo llegaría a Revisar.',
    // Sube exactamente 60 mm/h durante las últimas 2 h (la ventana del pronóstico); antes sube más despacio.
    lecturas: serie({
      cantidad: 25,
      nivel: (u, k) => {
        if (u <= 2.1) return 420 - 60 * u;
        return 420 - 60 * 2.1 - 40 * (u - 2.1) + 8 * Math.sin(k * 2.1);
      },
      lluvia: (u) => 2 + 6 * (1 - u / 6),
    }),
  },
  {
    id: 'ciclon-revisar',
    group: 'demo',
    name: 'Ciclón: nivel en Revisar',
    description: 'El nivel superó Revisar y sigue subiendo unos 70 mm/h con lluvia intensa.',
    lecturas: serie({
      cantidad: 25,
      nivel: (u, k) => {
        if (u <= 2.1) return 660 - 70 * u;
        return 660 - 70 * 2.1 - 55 * (u - 2.1) + 8 * Math.sin(k * 2.1);
      },
      lluvia: (u) => 3 + 8 * (1 - u / 6),
    }),
  },
  {
    id: 'ciclon-no-cruzar',
    group: 'demo',
    name: 'Ciclón: nivel en No cruzar',
    description: 'El nivel superó No cruzar y se mantiene por encima durante varias lecturas; la lluvia ya cede.',
    lecturas: serie({
      cantidad: 24,
      nivel: (u, k) => {
        if (u <= 3) return 910 - 50 * u;
        return 910 - 50 * 3 - 30 * (u - 3) + 6 * Math.sin(k * 1.9);
      },
      lluvia: (u) => 4 + 6 * (u / 6),
    }),
  },
  {
    id: 'estiaje',
    group: 'demo',
    name: 'Estiaje',
    description: 'Nivel bajo que baja despacio (de 200 a 150 mm) y sin lluvia.',
    lecturas: serie({ cantidad: 24, nivel: (u, k) => 150 + 8 * u + 1 * Math.sin(k * 2.3) }),
  },
  {
    id: 'pocas-lecturas',
    group: 'demo',
    name: 'Pocas lecturas',
    description: 'Solo hay 3 lecturas: no alcanzan para calcular un pronóstico.',
    lecturas: serie({ cantidad: 3, nivel: (u) => 420 - 80 * u, lluvia: () => 0.4 }),
  },
  {
    id: 'lecturas-viejas',
    group: 'demo',
    name: 'Lecturas viejas',
    description: 'La última lectura es de hace 3 h: el panel dice "Sin datos" y nunca muestra un verde falso.',
    lecturas: serie({
      cantidad: 20,
      ultimaHaceMin: 180,
      nivel: (u, k) => 480 - 8 * u + 2 * Math.sin(k * 1.7),
      lluvia: () => 0.5,
    }),
  },

  // ---------- Casos de prueba ----------
  {
    id: 'nivel-baja',
    group: 'test',
    name: 'Prueba: nivel que baja',
    description: 'Pico de unos 500 mm y bajada de unos 20 mm/h hasta 450 mm.',
    lecturas: serie({
      cantidad: 24,
      nivel: (u) => {
        if (u <= 2.45) return 450 + 20 * u;
        return 450 + 20 * 2.45 - 80 * (u - 2.45);
      },
      lluvia: (u) => (u > 2.5 ? 3 : 0.2),
    }),
  },
  {
    id: 'nivel-plano',
    group: 'test',
    name: 'Prueba: nivel plano',
    description: '420 mm constantes.',
    lecturas: serie({ cantidad: 24, nivel: () => 420 }),
  },
  {
    id: 'subida-acelerada',
    group: 'test',
    name: 'Prueba: subida acelerada',
    description: 'El ritmo crece de unos 40 a unos 100 mm/h; el nivel final es 520 mm.',
    lecturas: serie({
      cantidad: 24,
      nivel: (u) => 520 - 100 * u + 7.5 * u * u,
      lluvia: (u) => 1 + 5 * (1 - u / 6),
    }),
  },
  {
    id: 'ruido',
    group: 'test',
    name: 'Prueba: subida con ruido',
    description: 'Subida lenta de unos 20 mm/h con ruido de ±20 mm.',
    lecturas: serie({
      cantidad: 24,
      nivel: (u, k) => 400 - 20 * u + 16 * Math.sin(k * 2.7) + 4 * Math.cos(k * 1.1) - 4,
      lluvia: (u, k) => 0.5 + 0.4 * Math.sin(k * 2.1),
    }),
  },
  {
    id: 'lectura-espuria',
    group: 'test',
    name: 'Prueba: lectura espuria',
    description: 'Nivel normal con una sola lectura de 950 mm entre lecturas de unos 400 mm.',
    lecturas: serie({
      cantidad: 24,
      nivel: (u, k) => (k === 5 ? 950 : 400 + 4 * Math.sin(k * 1.1)),
      lluvia: () => 0.3,
    }),
  },
  {
    id: 'lectura-imposible',
    group: 'test',
    name: 'Prueba: lecturas imposibles',
    description: 'Lecturas válidas más una de -50 mm y otra de 9990 mm, que el panel descarta y avisa.',
    lecturas: serie({
      cantidad: 22,
      nivel: (u, k) => 400 + 5 * Math.sin(k * 1.3),
      lluvia: () => 0.2,
      extras: [
        { k: 3, level: -50 },
        { k: 9, level: 9990 },
      ],
    }),
  },
];

/** JSON legible: cada lectura en su propia línea. */
function textoLecturas(lecturas) {
  const filas = lecturas.map(
    (l) =>
      `    { "timestamp": "${l.timestamp}", "level_mm": ${l.level_mm.toFixed(1)}, "rain_mm": ${l.rain_mm.toFixed(1)}, "simulated": true }`,
  );
  return `{\n  "schema_version": 1,\n  "readings": [\n${filas.join(',\n')}\n  ]\n}\n`;
}

for (const e of escenarios) {
  const dir = `${DESTINO}${e.id}/`;
  mkdirSync(dir, { recursive: true });
  const meta = {
    schema_version: 1,
    id: e.id,
    group: e.group,
    name: e.name,
    description: e.description,
    now: iso(AHORA_UTC),
  };
  writeFileSync(`${dir}escenario.json`, `${JSON.stringify(meta, null, 2)}\n`);
  writeFileSync(`${dir}config.json`, `${JSON.stringify(CONFIG_EJEMPLO, null, 2)}\n`);
  writeFileSync(`${dir}readings.json`, textoLecturas(e.lecturas));
}

console.log(`Se generaron ${escenarios.length} escenarios en data/escenarios/`);
