import logo from '../assets/piski-logo.png';
import { DataProvider, useScenario } from '../core/data';
import { textos } from '../core/i18n/textos';
import { EstadoActualScreen } from '../features/estado';
import { MapaScreen } from '../features/mapa';
import { PronosticoScreen } from '../features/pronostico';
import { Notice, RoleNav, icons } from '../ui';
import styles from './App.module.css';
import { SimStrip } from './SimStrip';
import { buildHash, useRoute } from './useRoute';
import type { Screen } from './useRoute';

/** Franja de datos simulados con el selector de escenarios; siempre visible. */
function Franja({ onChange }: { onChange: (id: string) => void }) {
  const { scenario, scenarioId, entries } = useScenario();
  return (
    <SimStrip
      assumed={scenario?.config.assumed ?? false}
      entries={entries}
      value={scenarioId}
      onChange={onChange}
    />
  );
}

/** Contenido de la pantalla activa. Las pantallas se conectan aquí. */
function Pantalla({ screen }: { screen: Screen }) {
  const { status, scenario, error } = useScenario();

  if (status === 'loading') return <p className="type-body">{textos.carga.cargando}</p>;

  return (
    <>
      {error !== null && (
        <div className={styles['aviso']}>
          <Notice icon={<icons.Info size={24} aria-hidden />}>{error}</Notice>
        </div>
      )}
      {scenario !== null && screen === 'estado' && <EstadoActualScreen />}
      {scenario !== null && screen === 'pronostico' && <PronosticoScreen />}
      {scenario !== null && screen === 'mapa' && <MapaScreen />}
    </>
  );
}

export function App() {
  const ruta = useRoute();

  return (
    <DataProvider scenarioId={ruta.scenarioId}>
      <div className={styles['shell']}>
        <aside className={styles['lateral']}>
          <div className={styles['brand']}>
            <img className={styles['logo']} src={logo} alt={textos.marca.logoAlt} />
            <div className={styles['brandTexto']}>
              <span className="type-title-md">{textos.marca.nombre}</span>
              <span className={`${styles['brandSub']} type-caption`}>{textos.marca.subtitulo}</span>
            </div>
          </div>
          <RoleNav
            label={textos.navegacion.etiqueta}
            activeId={ruta.screen}
            items={[
              {
                id: 'estado',
                name: textos.navegacion.estado.nombre,
                role: textos.navegacion.estado.rol,
                href: buildHash({ screen: 'estado', scenarioId: ruta.scenarioId }),
                icon: <icons.Gauge size={22} aria-hidden />,
              },
              {
                id: 'pronostico',
                name: textos.navegacion.pronostico.nombre,
                role: textos.navegacion.pronostico.rol,
                href: buildHash({ screen: 'pronostico', scenarioId: ruta.scenarioId }),
                icon: <icons.ChartLine size={22} aria-hidden />,
              },
              {
                id: 'mapa',
                name: textos.navegacion.mapa.nombre,
                role: textos.navegacion.mapa.rol,
                href: buildHash({ screen: 'mapa', scenarioId: ruta.scenarioId }),
                icon: <icons.Map size={22} aria-hidden />,
              },
            ]}
          />
        </aside>
        <Franja onChange={ruta.setScenario} />
        <main className={styles['page']}>
          <Pantalla screen={ruta.screen} />
        </main>
      </div>
    </DataProvider>
  );
}
