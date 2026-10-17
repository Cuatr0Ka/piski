import type { ScenarioEntry } from '../core/data';
import { textos } from '../core/i18n/textos';
import { Select } from '../ui';

interface Props {
  entries: { demo: ScenarioEntry[]; test: ScenarioEntry[] };
  value: string;
  onChange: (id: string) => void;
}

/** Selector "Escenario de ejemplo" con los grupos Demostración y Casos de prueba. */
export function ScenarioSelector({ entries, value, onChange }: Props) {
  const grupo = (etiqueta: string, lista: ScenarioEntry[]) => ({
    label: etiqueta,
    options: lista.map((e) => ({ value: e.id, label: e.name })),
  });
  return (
    <Select
      label={textos.franja.selector}
      value={value}
      onChange={onChange}
      groups={[grupo(textos.franja.grupoDemo, entries.demo), grupo(textos.franja.grupoPrueba, entries.test)]}
    />
  );
}
