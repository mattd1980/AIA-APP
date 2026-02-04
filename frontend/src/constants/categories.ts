// Single source of truth for insurer-oriented item categories (French labels)
export const CATEGORY_LABELS: Record<string, string> = {
  furniture: 'Meubles',
  electronics: 'Électronique',
  clothing: 'Vêtements',
  appliances: 'Électroménagers',
  decor: 'Décoration',
  jewelry: 'Bijoux',
  art: 'Art',
  collectibles: 'Collections',
  sports_equipment: 'Équipement sportif',
  other: 'Autre',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
