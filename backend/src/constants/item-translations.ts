/**
 * French-to-English translation dictionary for common household/insurance item keywords.
 * Used to translate AI-detected French item names into English for Google Shopping search.
 */

const frenchToEnglish: Record<string, string> = {
  // --- Furniture ---
  canape: 'sofa',
  divan: 'sofa',
  fauteuil: 'armchair',
  chaise: 'chair',
  table: 'table',
  bureau: 'desk',
  bibliotheque: 'bookcase',
  etagere: 'shelf',
  armoire: 'wardrobe',
  commode: 'dresser',
  buffet: 'buffet',
  console: 'console',
  tabouret: 'stool',
  banc: 'bench',
  lit: 'bed',
  matelas: 'mattress',
  sommier: 'bed frame',
  meuble: 'furniture',
  placard: 'cabinet',
  tiroir: 'drawer',
  pouf: 'ottoman',
  berceau: 'crib',
  coiffeuse: 'vanity',
  secretaire: 'writing desk',

  // --- Electronics ---
  televiseur: 'television',
  television: 'television',
  tele: 'tv',
  ordinateur: 'computer',
  portable: 'laptop',
  tablette: 'tablet',
  clavier: 'keyboard',
  souris: 'mouse',
  ecran: 'monitor',
  imprimante: 'printer',
  enceinte: 'speaker',
  casque: 'headphones',
  webcam: 'webcam',
  routeur: 'router',
  disque: 'drive',
  manette: 'controller',

  // --- Appliances ---
  refrigerateur: 'refrigerator',
  frigo: 'refrigerator',
  congelateur: 'freezer',
  cuisiniere: 'stove',
  four: 'oven',
  microondes: 'microwave',
  lavevaisselle: 'dishwasher',
  lavelinge: 'washing machine',
  sechelinge: 'dryer',
  seche: 'dryer',
  aspirateur: 'vacuum',
  grille: 'toaster',
  grillepain: 'toaster',
  bouilloire: 'kettle',
  cafetiere: 'coffee maker',
  mixeur: 'blender',
  robot: 'food processor',
  hotte: 'range hood',
  ventilateur: 'fan',
  climatiseur: 'air conditioner',
  chauffage: 'heater',
  radiateur: 'heater',
  humidificateur: 'humidifier',
  deshumidificateur: 'dehumidifier',
  purificateur: 'purifier',
  fer: 'iron',
  repassage: 'ironing',

  // --- Lighting & Decor ---
  lampe: 'lamp',
  lustre: 'chandelier',
  plafonnier: 'ceiling light',
  applique: 'wall light',
  abatjour: 'lampshade',
  miroir: 'mirror',
  tableau: 'painting',
  cadre: 'frame',
  tapis: 'rug',
  rideau: 'curtain',
  store: 'blind',
  coussin: 'cushion',
  vase: 'vase',
  horloge: 'clock',
  pendule: 'clock',
  bougie: 'candle',
  sculpture: 'sculpture',

  // --- Textiles & Bedding ---
  couette: 'comforter',
  couverture: 'blanket',
  oreiller: 'pillow',
  drap: 'sheet',
  serviette: 'towel',
  nappe: 'tablecloth',
  plaid: 'throw',

  // --- Kitchen ---
  pain: 'bread',
  casserole: 'saucepan',
  poele: 'frying pan',
  marmite: 'pot',
  ustensile: 'utensil',
  couteau: 'knife',
  assiette: 'plate',
  verre: 'glass',
  tasse: 'cup',
  bol: 'bowl',

  // --- Materials / descriptors ---
  cuir: 'leather',
  bois: 'wood',
  metal: 'metal',
  tissu: 'fabric',
  marron: 'brown',
  noir: 'black',
  blanc: 'white',
  gris: 'gray',
  rouge: 'red',
  bleu: 'blue',
  vert: 'green',
  jaune: 'yellow',
  beige: 'beige',
  dore: 'gold',
  argente: 'silver',
  ancien: 'antique',
  moderne: 'modern',
  vintage: 'vintage',
  grand: 'large',
  petit: 'small',
  moyen: 'medium',
  double: 'double',
  simple: 'single',
  electrique: 'electric',
  encastrable: 'built-in',
  sans: 'cordless',
  fil: 'wire',

  // --- Outdoor / Garage ---
  tondeuse: 'lawn mower',
  barbecue: 'barbecue',
  parasol: 'patio umbrella',
  hamac: 'hammock',
  velo: 'bicycle',
  trottinette: 'scooter',

  // --- Musical ---
  piano: 'piano',
  guitare: 'guitar',
  violon: 'violin',

  // --- Connectors (ignored in output) ---
  en: '',
  de: '',
  du: '',
  le: '',
  la: '',
  les: '',
  un: '',
  une: '',
  des: '',
  avec: '',
  pour: '',
  sur: '',
  et: '',
  au: '',
  aux: '',
  a: '',
};

/**
 * Remove diacritical marks (accents) from a string for dictionary lookup.
 * e.g. "refrigerateur" stays the same, "refrigerateur" with accents becomes "refrigerateur"
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Translate a French item name into English keywords for Google Shopping search.
 *
 * - Normalizes accents for matching
 * - Splits into words and replaces known French words with English equivalents
 * - Drops common French articles/prepositions (en, de, le, la, etc.)
 * - Preserves unknown words (likely brand names or universal terms)
 */
export function translateToEnglish(frenchName: string): string {
  const normalized = removeAccents(frenchName.toLowerCase());

  // Split on whitespace and hyphens, filter empty tokens
  const words = normalized.split(/[\s-]+/).filter(Boolean);

  const translated = words.map((word) => {
    const match = frenchToEnglish[word];
    if (match === undefined) {
      // Unknown word — preserve as-is (likely a brand or universal term)
      return word;
    }
    // Empty string means it's an article/preposition to drop
    return match;
  });

  return translated.filter(Boolean).join(' ');
}
