import { useState } from 'react';
import { textos } from '../../../core/i18n/textos';
import { formatMm } from '../../../core/utils/formatNumber';
import { Card, RegionMap, SimulatedBadge, StatusPill } from '../../../ui';
import { useMapa } from '../hooks/useMapa';
import styles from './MapaScreen.module.css';

/**
 * Mapa de la región (Huauchinango, con Necaxa, y Xicotepec) con las balizas encima. Cada baliza muestra
 * su estado con forma, color y palabra; elegir una en el mapa o en la lista la resalta en ambos.
 */
export function MapaScreen() {
  const datos = useMapa();
  const [elegida, setElegida] = useState('baliza-2');
  if (datos === null) return null;
  const { region, dibujo, estados } = datos;
  const { municipalities, waterways, reservoirs, places, width, height } = dibujo;

  return (
    <>
      <div className={styles['cabecera']}>
        <h1 className="type-title-lg">{textos.pantallas.mapa.titulo}</h1>
        <span className={`${styles['rol']} type-label`}>{textos.pantallas.mapa.rol}</span>
      </div>

      <div className={styles['rejilla']}>
        <Card labelledBy="titulo-mapa">
          <div className={styles['tituloFila']}>
            <h2 id="titulo-mapa" className="type-title-md">
              {textos.mapa.tituloMapa}
            </h2>
            <SimulatedBadge />
          </div>
          <p className={`${styles['suave']} type-label`}>{region.name}</p>
          <RegionMap
            width={width}
            height={height}
            ariaLabel={textos.mapa.alternativa}
            municipalities={municipalities}
            waterways={waterways}
            reservoirs={reservoirs}
            places={places}
            beacons={estados.map((e) => ({
              id: e.beacon.id,
              name: e.beacon.name,
              x: e.x,
              y: e.y,
              kind: e.estado.kind,
              selected: e.beacon.id === elegida,
            }))}
            onSelect={setElegida}
          />
          <ul className={`${styles['leyenda']} type-caption`}>
            <li>
              <span className={styles['trazoArroyo']} aria-hidden />
              {textos.mapa.leyenda.arroyo}
            </li>
            <li>
              <span className={styles['trazoCauce']} aria-hidden />
              {textos.mapa.leyenda.cauces}
            </li>
            <li>
              <span className={styles['trazoPresa']} aria-hidden />
              {textos.mapa.leyenda.presas}
            </li>
          </ul>
          <p className={`${styles['suave']} type-caption`}>
            {textos.mapa.necaxaAprox} {region.attribution}
          </p>
        </Card>

        <Card labelledBy="titulo-balizas">
          <h2 id="titulo-balizas" className="type-title-md">
            {textos.mapa.tituloBalizas}
          </h2>
          <ul className={styles['lista']}>
            {estados.map((e) => {
              const activa = e.beacon.id === elegida;
              return (
                <li key={e.beacon.id}>
                  <button
                    type="button"
                    className={`${styles['baliza']} ${activa ? styles['balizaActiva'] : ''}`}
                    aria-pressed={activa}
                    onClick={() => setElegida(e.beacon.id)}
                  >
                    <span className={styles['balizaTexto']}>
                      <span className="type-body-strong">{e.beacon.name}</span>
                      <span className={`${styles['suave']} type-caption`}>{e.beacon.municipality}</span>
                    </span>
                    <span className={styles['balizaDatos']}>
                      <StatusPill kind={e.estado.kind} />
                      <span className="type-value-md">
                        {e.levelMm !== undefined ? textos.mapa.nivel(formatMm(e.levelMm)) : textos.mapa.sinLectura}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={`${styles['nota']} type-caption`}>{textos.mapa.nota}</p>
        </Card>
      </div>
    </>
  );
}
