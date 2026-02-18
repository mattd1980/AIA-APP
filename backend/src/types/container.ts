export type ContainerType = 'room' | 'safe';

export interface ContainerConfig {
  type: ContainerType;
  label: string;
  labelFr: string;
  notFoundEntity: string;
  noPhotosMessage: string;
  nameRequiredMessage: string;
  deletedMessage: string;
  imageDeletedMessage: string;
  itemDeletedMessage: string;
  analyzeStartedMessage: string;
  idField: 'roomId' | 'safeId';
  imageIdField: 'roomImageId' | 'safeImageId';
  runIdField: 'roomAnalysisRunId' | 'safeAnalysisRunId';
  paramName: 'roomId' | 'safeId';
}

export const ROOM_CONFIG: ContainerConfig = {
  type: 'room',
  label: 'Room',
  labelFr: 'Piece',
  notFoundEntity: 'Room',
  noPhotosMessage: 'Aucune photo dans cette piece',
  nameRequiredMessage: 'Le nom de la piece est requis',
  deletedMessage: 'Piece supprimee',
  imageDeletedMessage: 'Image supprimee',
  itemDeletedMessage: 'Objet supprime',
  analyzeStartedMessage: 'Analyse lancee',
  idField: 'roomId',
  imageIdField: 'roomImageId',
  runIdField: 'roomAnalysisRunId',
  paramName: 'roomId',
};

export const SAFE_CONFIG: ContainerConfig = {
  type: 'safe',
  label: 'Safe',
  labelFr: 'Coffre',
  notFoundEntity: 'Safe',
  noPhotosMessage: 'Aucune photo dans ce coffre',
  nameRequiredMessage: 'Le nom du coffre est requis',
  deletedMessage: 'Coffre supprime',
  imageDeletedMessage: 'Image supprimee',
  itemDeletedMessage: 'Objet supprime',
  analyzeStartedMessage: 'Analyse lancee',
  idField: 'safeId',
  imageIdField: 'safeImageId',
  runIdField: 'safeAnalysisRunId',
  paramName: 'safeId',
};

export function getContainerConfig(type: ContainerType): ContainerConfig {
  return type === 'room' ? ROOM_CONFIG : SAFE_CONFIG;
}
