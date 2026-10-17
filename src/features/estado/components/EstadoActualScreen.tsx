import { textos } from '../../../core/i18n/textos';
import { formatAge, formatDateTime, formatHour } from '../../../core/time/clock';
import { formatMm } from '../../../core/utils/formatNumber';
import { BroadcastMessage, DataFreshness, LevelGauge, Notice, RainCard, StatusBanner, icons } from '../../../ui';
import { useEstadoPaso } from '../hooks/useEstadoPaso';
import { describeDistance } from '../services/distanceToNext';
import styles from './EstadoActualScreen.module.css';

/** Estado actual: bloque de estado, nivel contra el paso y antigüedad del dato (composición de la maqueta aprobada). */
export function EstadoActualScreen() {
  const datos = useEstadoPaso();
  if (datos === null) return null;
  const { estado, lluvia, config, offsetMin } = datos;

  const hora = estado.lastReadingAt !== undefined ? formatHour(estado.lastReadingAt, offsetMin) : undefined;
  const fecha = estado.lastReadingAt !== undefined ? formatDateTime(estado.lastReadingAt, offsetMin) : '';
  const edad = estado.ageMin !== undefined ? formatAge(estado.ageMin) : '';

  const sinDatos = estado.kind === 'nodata';
  const valorAntiguedad = sinDatos
    ? hora !== undefined
      ? textos.sinLecturasDesde(hora)
      : textos.sinLecturas
    : textos.antiguedad.ultimaLectura(edad);
  const detalleAntiguedad = sinDatos ? (hora !== undefined ? textos.antiguedad.hace(edad, fecha) : '') : fecha;

  return (
    <>
      {estado.discardedCount > 0 && (
        <div className={styles['aviso']}>
          <Notice icon={<icons.Info size={24} aria-hidden />}>{textos.descartadas(estado.discardedCount)}</Notice>
        </div>
      )}

      <div className={styles['cabecera']}>
        <h1 className="type-title-lg">{textos.pantallas.estado.titulo}</h1>
        <span className={`${styles['rol']} type-label`}>{textos.pantallas.estado.rol}</span>
      </div>

      <div className={styles['superior']}>
        <StatusBanner kind={estado.kind} {...(hora !== undefined ? { lastHour: hora } : {})} />
        <BroadcastMessage message={textos.avisar.mensajes[estado.kind]} />
      </div>

      <div className={styles['indicadores']}>
        <LevelGauge
          levelMm={sinDatos ? null : (estado.lastLevelMm ?? null)}
          thresholds={{
            reviewMm: config.thresholds.review_mm,
            stopMm: config.thresholds.stop_mm,
            crossingMm: config.crossing_mm,
          }}
          caption={describeDistance(estado, config, offsetMin)}
        />
        <RainCard
          main={
            lluvia[0] ? { value: `${formatMm(lluvia[0].mm)} mm`, caption: textos.lluvia.enVentana(lluvia[0].hours) } : null
          }
          rows={lluvia.slice(1).map((l) => ({ label: textos.lluvia.ventana(l.hours), value: `${formatMm(l.mm)} mm` }))}
          {...(sinDatos ? { message: textos.lluvia.sinDatos } : {})}
        />
        <DataFreshness value={valorAntiguedad} detail={detalleAntiguedad} />
      </div>
    </>
  );
}
