import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faHouse,
  faBuilding,
  faCity,
  faMountain,
  faBriefcase,
  faCar,
  faWarehouse,
  faStore,
} from '@fortawesome/free-solid-svg-icons';

const LOCATION_ICON_MAP: Array<[RegExp, IconDefinition]> = [
  [/maison/i, faHouse],
  [/appartement/i, faBuilding],
  [/condo/i, faCity],
  [/chalet/i, faMountain],
  [/bureau/i, faBriefcase],
  [/garage/i, faCar],
  [/entrepot|entrep[oô]t/i, faWarehouse],
  [/commerce|boutique|magasin/i, faStore],
];

/** Strip accents so "Entrepôt" matches "entrepot" pattern */
function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getLocationIcon(name: string): IconDefinition {
  const normalized = stripAccents(name);
  for (const [pattern, icon] of LOCATION_ICON_MAP) {
    if (pattern.test(normalized)) return icon;
  }
  return faHouse;
}
