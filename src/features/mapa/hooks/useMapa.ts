import { useMemo } from 'react';
import { loadRegion, useScenario } from '../../../core/data';
import { buildView, toPath } from '../services/projectMap';
import { computeBeaconStates } from '../services/beaconStates';

// La región se valida una sola vez al cargar el módulo.
const region = loadRegion();
const view = buildView(region.bbox);

/** Lugar del rótulo de un municipio: a la altura del borde norte de su contorno, centrado, para no tapar las balizas. */
function rotulo(anillo: readonly (readonly [number, number])[]) {
  const puntos = anillo.map(([lon, lat]) => view.project(lon, lat));
  const x = puntos.reduce((a, p) => a + p.x, 0) / puntos.length;
  const y = Math.min(...puntos.map((p) => p.y)) + 40;
  return { x, y };
}

/** Todo lo que el mapa dibuja, ya proyectado, y el estado de cada baliza con el escenario activo. */
export function useMapa() {
  const { scenario } = useScenario();
  return useMemo(() => {
    if (scenario === null) return null;
    const dibujo = {
      width: view.width,
      height: view.height,
      municipalities: region.municipalities.map((m) => {
        const mayor = m.polygons.reduce((a, b) => ((b[0]?.length ?? 0) > (a[0]?.length ?? 0) ? b : a));
        return {
          name: m.name,
          paths: m.polygons.map((p) => p.map((anillo) => toPath(view, anillo, true)).join(' ')),
          label: rotulo(mayor[0] ?? []),
        };
      }),
      waterways: region.waterways.map((w) => ({
        name: w.name,
        main: w.main,
        paths: w.lines.map((l) => toPath(view, l)),
      })),
      reservoirs: region.reservoirs.map((r) => toPath(view, r.ring, true)),
      places: region.places.map((p) => ({ name: p.name, town: p.kind === 'town', ...view.project(p.lon, p.lat) })),
    };
    const estados = computeBeaconStates(region.beacons, scenario.readings, scenario.config, scenario.now).map((b) => ({
      ...b,
      ...view.project(b.beacon.lon, b.beacon.lat),
    }));
    return { region, dibujo, estados };
  }, [scenario]);
}
