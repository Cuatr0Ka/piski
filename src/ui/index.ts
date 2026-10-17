// API pública de src/ui: componentes visuales reutilizables, sin lógica de negocio.
export { AssumptionTag } from './components/AssumptionTag';
export { BroadcastMessage } from './components/BroadcastMessage';
export { ConclusionCard } from './components/ConclusionCard';
export type { ConclusionLine } from './components/ConclusionCard';
export { Disclosure } from './components/Disclosure';
export { ForecastChart } from './components/ForecastChart';
export type {
  ChartProjection,
  ChartReading,
  ChartTableRow,
  ChartThreshold,
} from './components/ForecastChart';
export { Button } from './components/Button';
export { Card } from './components/Card';
export { DataFreshness } from './components/DataFreshness';
export { HourlyStrip } from './components/HourlyStrip';
export type { HourlyItem } from './components/HourlyStrip';
export { LevelGauge } from './components/LevelGauge';
export type { GaugeThresholds } from './components/LevelGauge';
export { StatusBanner } from './components/StatusBanner';
export { StatusPill } from './components/StatusPill';
export { StatusShape } from './components/StatusShape';
export { EmptyState } from './components/EmptyState';
export { NoForecastCard } from './components/NoForecastCard';
export { Notice } from './components/Notice';
export { RainCard } from './components/RainCard';
export { RegionMap } from './components/RegionMap';
export type { MapBeacon, MapMunicipality, MapPlace, MapWaterway } from './components/RegionMap';
export { Splash } from './components/Splash';
export { RoleNav } from './components/RoleNav';
export type { RoleNavItem } from './components/RoleNav';
export { Select } from './components/Select';
export type { SelectGroup, SelectOption } from './components/Select';
export { SimulatedBadge } from './components/SimulatedBadge';
export { Tag } from './components/Tag';
export * as icons from './icons';
