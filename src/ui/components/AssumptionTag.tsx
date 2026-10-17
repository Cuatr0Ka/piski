import { textos } from '../../core/i18n/textos';
import { Tag } from './Tag';

/** Etiqueta fija "Supuesto": marca el método y las cifras que no son mediciones. */
export function AssumptionTag() {
  return <Tag tone="accent">{textos.metodo.supuesto}</Tag>;
}
