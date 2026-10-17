import { useId } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface Props {
  label: string;
  value: string;
  groups: SelectGroup[];
  onChange: (valor: string) => void;
}

/** Selector con etiqueta visible y grupos; se usa completo con teclado. */
export function Select({ label, value, groups, onChange }: Props) {
  const id = useId();
  return (
    <span className={styles['field']}>
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      <select
        id={id}
        className={`${styles['select']} type-body-strong`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </span>
  );
}
