// Pièces souvent à déclarer pour l'assurance habitation
export const SUGGESTED_ROOMS = [
  'Chambre de maître',
  'Chambre d\'amis',
  'Chambre d\'enfants',
  'Salon',
  'Cuisine',
  'Salle de bain',
  'Salle d\'eau',
  'Bureau',
  'Dressing',
  'Garage',
  'Cave',
  'Entrée',
  'Balcon',
  'Salle à manger',
  'Buanderie',
  'Cellier',
  'Atelier',
  'Grenier',
  'Abri de jardin',
] as const;

// Coffres souvent à déclarer
export const SUGGESTED_SAFES = [
  'Coffre-fort principal',
  'Coffre salon',
  'Coffre chambre',
  'Coffre bureau',
  'Coffre cave',
] as const;

// Lieux typiques à assurer
export const SUGGESTED_LOCATIONS = [
  'Maison',
  'Appartement',
  'Condo',
  'Chalet',
  'Bureau',
  'Garage',
  'Entrepot',
  'Commerce',
] as const;

// Objets typiques à déclarer pour l'assurance (nom + catégorie)
export const SUGGESTED_OBJECTS: Array<{ name: string; category: string }> = [
  { name: 'Bijoux', category: 'jewelry' },
  { name: 'Montres', category: 'jewelry' },
  { name: 'Téléviseur', category: 'electronics' },
  { name: 'Ordinateur portable', category: 'electronics' },
  { name: 'Tablette', category: 'electronics' },
  { name: 'Téléphone', category: 'electronics' },
  { name: 'Canapé', category: 'furniture' },
  { name: 'Lit', category: 'furniture' },
  { name: 'Table à manger', category: 'furniture' },
  { name: 'Armoire', category: 'furniture' },
  { name: 'Réfrigérateur', category: 'appliances' },
  { name: 'Lave-linge', category: 'appliances' },
  { name: 'Lave-vaisselle', category: 'appliances' },
  { name: 'Four', category: 'appliances' },
  { name: 'Micro-ondes', category: 'appliances' },
  { name: 'Vélo', category: 'sports_equipment' },
  { name: 'Œuvres d\'art', category: 'art' },
  { name: 'Instruments de musique', category: 'other' },
  { name: 'Appareil photo', category: 'electronics' },
  { name: 'Console de jeux', category: 'electronics' },
  { name: 'Aspirateur robot', category: 'appliances' },
  { name: 'Climatiseur', category: 'appliances' },
  { name: 'Machine à café', category: 'appliances' },
  { name: 'Bureau (meuble)', category: 'furniture' },
  { name: 'Étagères', category: 'furniture' },
  { name: 'Lustre', category: 'decor' },
  { name: 'Tapis', category: 'decor' },
  { name: 'Vêtements de valeur', category: 'clothing' },
  { name: 'Collection (timbre, etc.)', category: 'collectibles' },
  { name: 'Documents importants', category: 'other' },
];
