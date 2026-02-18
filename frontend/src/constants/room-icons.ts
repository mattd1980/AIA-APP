import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCouch,
  faUtensils,
  faBed,
  faBath,
  faDesktop,
  faCar,
  faWineBottle,
  faDoorOpen,
  faCloudSun,
  faBoxOpen,
  faTools,
  faTshirt,
  faTree,
} from '@fortawesome/free-solid-svg-icons';

const ROOM_ICON_MAP: Array<[RegExp, IconDefinition]> = [
  [/salon/i, faCouch],
  [/cuisine/i, faUtensils],
  [/salle\s*(a|à)\s*manger/i, faUtensils],
  [/chambre/i, faBed],
  [/salle\s*d[e']?\s*(bain|eau)/i, faBath],
  [/bureau/i, faDesktop],
  [/garage/i, faCar],
  [/cave/i, faWineBottle],
  [/cellier/i, faWineBottle],
  [/entree|entr[eé]e/i, faDoorOpen],
  [/balcon|terrasse/i, faCloudSun],
  [/grenier/i, faBoxOpen],
  [/atelier/i, faTools],
  [/buanderie/i, faTshirt],
  [/dressing/i, faTshirt],
  [/abri/i, faTree],
];

/** Strip accents so "Entrée" matches "entree" pattern */
function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getRoomIcon(name: string): IconDefinition {
  const normalized = stripAccents(name);
  for (const [pattern, icon] of ROOM_ICON_MAP) {
    if (pattern.test(normalized)) return icon;
  }
  return faDoorOpen;
}
