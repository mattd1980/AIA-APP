import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faVault } from '@fortawesome/free-solid-svg-icons';
import { getRoomIcon } from './room-icons';

export type ContainerType = 'room' | 'safe';

export interface ContainerUIConfig {
  type: ContainerType;
  routePrefix: string;
  notFoundLabel: string;
  editNameTitle: string;
  deleteConfirmContainer: string;
  accentColor: string;
  borderDashed: string;
  borderDashedHover: string;
  buttonVariant: 'default' | 'secondary';
  galleryButtonVariant: 'secondary' | 'outline';
  cardDeleteTitle: string;
  getIcon: (name: string) => IconDefinition;
}

export const ROOM_UI_CONFIG: ContainerUIConfig = {
  type: 'room',
  routePrefix: '/room',
  notFoundLabel: 'Piece introuvable',
  editNameTitle: 'Modifier le nom de la piece',
  deleteConfirmContainer: 'Supprimer cette piece et toutes ses photos ?',
  accentColor: 'text-primary',
  borderDashed: 'border-primary/30',
  borderDashedHover: 'hover:border-primary/50',
  buttonVariant: 'default',
  galleryButtonVariant: 'secondary',
  cardDeleteTitle: 'Supprimer la piece',
  getIcon: getRoomIcon,
};

export const SAFE_UI_CONFIG: ContainerUIConfig = {
  type: 'safe',
  routePrefix: '/safe',
  notFoundLabel: 'Coffre introuvable',
  editNameTitle: 'Modifier le nom du coffre',
  deleteConfirmContainer: 'Supprimer ce coffre et toutes ses photos ?',
  accentColor: 'text-secondary',
  borderDashed: 'border-secondary/30',
  borderDashedHover: 'hover:border-secondary/50',
  buttonVariant: 'secondary',
  galleryButtonVariant: 'outline',
  cardDeleteTitle: 'Supprimer le coffre',
  getIcon: () => faVault,
};

export function getContainerUIConfig(type: ContainerType): ContainerUIConfig {
  return type === 'room' ? ROOM_UI_CONFIG : SAFE_UI_CONFIG;
}
