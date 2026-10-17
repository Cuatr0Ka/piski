import { textos } from '../../../core/i18n/textos';
import { formatHoras, formatMm } from '../../../core/utils/formatNumber';
import {
  AssumptionTag,
  Card,
  ConclusionCard,
  Disclosure,
  ForecastChart,
  HourlyStrip,
  NoForecastCard,
} from '../../../ui';
import type { HourlyItem } from '../../../ui';
import { usePronostico } from '../hooks/usePronostico';
import { describeForecast } from '../services/describeForecast';
import { describeNoForecast } from '../services/describeNoForecast';
import { ceilMm, floorMm } from '../services/robustTrend';
import styles from './PronosticoScreen.module.css';

/**
 * Pronóstico de creciente: la conclusión va primero y la gráfica es de apoyo; "Cómo se calcula" siempre
 * muestra su resumen. Sin pronóstico, la tarjeta dice por qué y qué hacer, y la gráfica ocupa todo el ancho.
 */
export function PronosticoScreen() {
  const datos = usePronostico();
  if (datos === null) return null;
  const { pronostico, config, ultima, lluvia, now, offsetMin, chart } = datos;
  const { window_min, min_readings, horizon_h } = config.forecast;
  const conProyeccion = pronostico.kind === 'forecast';

  // Un renglón por hora entera del horizonte: nivel central, rango y el estado que le correspondería.
  const porHora: HourlyItem[] =
    pronostico.kind === 'forecast'
      ? pronostico.band
          .filter((b) => Number.isInteger(b.h))
          .map((b) => ({
            label: b.h === 0 ? textos.porHora.ahora : `+${formatHoras(b.h)} h`,
            value: `${formatMm(Math.round(b.midMm))} mm`,
            range: textos.porHora.rango(formatMm(floorMm(b.lowMm)), formatMm(ceilMm(b.highMm))),
            kind:
              b.midMm >= config.thresholds.stop_mm ? 'stop' : b.midMm >= config.thresholds.review_mm ? 'review' : 'normal',
          }))
      : [];

  return (
    <>
      <div className={styles['cabecera']}>
        <h1 className="type-title-lg">{textos.pantallas.pronostico.titulo}</h1>
        <span className={`${styles['rol']} type-label`}>{textos.pantallas.pronostico.rol}</span>
      </div>

      <div className={styles['rejilla']}>
        <div className={styles['columna']}>
          {pronostico.kind === 'forecast' ? (
            <ConclusionCard {...describeForecast(pronostico, ultima, now, horizon_h, lluvia[0])} />
          ) : (
            <NoForecastCard {...describeNoForecast(pronostico, offsetMin)} />
          )}
        </div>

        <div className={styles['columna']}>
          <ForecastChart
            title={conProyeccion ? textos.grafica.tituloConProyeccion : textos.grafica.tituloSolo}
            subtitle={
              conProyeccion ? textos.grafica.subtituloConProyeccion(formatHoras(horizon_h)) : textos.grafica.subtituloSolo
            }
            readings={chart.readings}
            thresholds={chart.thresholds}
            maxMm={chart.maxMm}
            simulated
            table={chart.table}
            {...(chart.projection ? { projection: chart.projection } : {})}
          />
        </div>
      </div>

      {porHora.length > 0 && (
        <div className={styles['metodo']}>
          <HourlyStrip
            title={textos.porHora.titulo}
            subtitle={textos.porHora.subtitulo(formatHoras(horizon_h))}
            items={porHora}
          />
        </div>
      )}

      <div className={styles['metodo']}>
        <Card labelledBy="titulo-metodo">
          <div className={styles['metodoCabecera']}>
            <h2 id="titulo-metodo" className="type-title-md">
              {textos.metodo.titulo}
            </h2>
            <AssumptionTag />
          </div>
          <p className={`${styles['resumen']} type-body`}>
            {textos.metodo.resumen(formatHoras(window_min / 60))} <strong>{textos.pronostico.avisoLluvia}</strong>
          </p>
          <Disclosure summary={textos.metodo.verParametros}>
            <dl className={`${styles['parametros']} type-body`}>
              <div>
                <dt>{textos.metodo.ventana}</dt>
                <dd>{textos.metodo.horas(formatHoras(window_min / 60))}</dd>
              </div>
              <div>
                <dt>{textos.metodo.minimoLecturas}</dt>
                <dd>{min_readings}</dd>
              </div>
              <div>
                <dt>{textos.metodo.horizonte}</dt>
                <dd>{textos.metodo.horas(formatHoras(horizon_h))}</dd>
              </div>
            </dl>
          </Disclosure>
        </Card>
      </div>
    </>
  );
}
