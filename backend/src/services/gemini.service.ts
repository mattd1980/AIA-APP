import { GoogleGenAI } from '@google/genai';
import { VisionItem, BoundingBox, ItemCategory } from '../types';

/** Gemini models users can select (id = API model name) */
export const GEMINI_MODELS = [
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (meilleure qualite, bounding boxes)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (rapide, economique)' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (le plus economique)' },
] as const;

export type GeminiModelId = (typeof GEMINI_MODELS)[number]['id'];

const ALLOWED_IDS = new Set<string>(GEMINI_MODELS.map((m) => m.id));
const DEFAULT_GEMINI_MODEL: GeminiModelId = 'gemini-2.5-flash';

function resolveModel(userModel?: string | null): GeminiModelId {
  if (userModel && ALLOWED_IDS.has(userModel)) return userModel as GeminiModelId;
  return DEFAULT_GEMINI_MODEL;
}

function convertBox2d(box: [number, number, number, number]): BoundingBox {
  const [ymin, xmin, ymax, xmax] = box;
  return {
    x: Math.max(0, Math.min(1, xmin / 1000)),
    y: Math.max(0, Math.min(1, ymin / 1000)),
    width: Math.max(0, Math.min(1, (xmax - xmin) / 1000)),
    height: Math.max(0, Math.min(1, (ymax - ymin) / 1000)),
  };
}

const validCategories: ItemCategory[] = [
  'furniture', 'electronics', 'clothing', 'appliances', 'decor',
  'jewelry', 'art', 'collectibles', 'sports_equipment', 'other',
];

const personKeywords = /\b(personne|person|people|humain|human|child|children|kid|kids|baby|bébé|adult|adulte|homme|woman|femme|enfant|man|woman|visage|face)\b/i;

class GeminiService {
  async analyzeImage(imageBuffer: Buffer, imageType: string = 'image/jpeg', model?: string | null): Promise<VisionItem[]> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelId = resolveModel(model);

    let mimeType = imageType || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      mimeType = 'image/jpeg';
    }

    const base64Image = imageBuffer.toString('base64');
    if (!base64Image || base64Image.length === 0) {
      throw new Error('Invalid image buffer: empty or corrupted');
    }

    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Vous analysez une photo pour un inventaire d'assurance habitation. Listez UNIQUEMENT les OBJETS et BIENS susceptibles d'être assurés (meubles, électronique, électroménager, bijoux, oeuvres d'art, objets de valeur, etc.).

RÈGLES ABSOLUES — À RESPECTER STRICTEMENT:
- NE LISTEZ JAMAIS de personnes: ni adultes, ni enfants, ni bébés, ni silhouettes humaines. Les personnes ne sont PAS des objets et ne doivent jamais apparaître dans la liste.
- NE LISTEZ PAS les animaux (chiens, chats, etc.) comme objets d'inventaire.
- IGNOREZ les objets sans valeur significative pour l'assurance: gobelets jetables, crayons, papiers, déchets, nourriture périssable, produits de consommation courante sans valeur, etc.
- Concentrez-vous sur les biens que les assureurs prennent typiquement en compte: meubles, électronique, électroménager, bijoux, art, collections, équipement sportif, vêtements de valeur, décoration, etc.

Toutes vos réponses doivent être en FRANÇAIS.

Pour CHAQUE OBJET (jamais de personne) identifié, fournissez:
- name: Nom clair et spécifique en français (ex: "Téléviseur LED Samsung 55 pouces")
- category: UN SEUL parmi (en anglais): furniture, electronics, clothing, appliances, decor, jewelry, art, collectibles, sports_equipment, other
- brand: Marque si visible (null sinon)
- model: Modèle si visible (null sinon)
- condition: Un parmi: new, excellent, good, fair, poor
- estimatedAge: Âge approximatif en années (0 si neuf)
- description: Description en français (matériau, couleur, dimensions estimées, caractéristiques utiles pour une réclamation)
- box_2d: Bounding box normalisé [ymin, xmin, ymax, xmax] avec des valeurs entre 0 et 1000

Retournez UNIQUEMENT du JSON valide dans ce format exact:
{
  "items": [
    {
      "name": "Nom de l'objet en français",
      "category": "furniture|electronics|clothing|appliances|decor|jewelry|art|collectibles|sports_equipment|other",
      "brand": "Marque ou null",
      "model": "Modèle ou null",
      "condition": "new|excellent|good|fair|poor",
      "estimatedAge": 0,
      "description": "Description détaillée en français",
      "box_2d": [ymin, xmin, ymax, xmax]
    }
  ]
}`,
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const content = response.text;
      if (!content) {
        console.warn('Gemini returned empty content');
        return [];
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          console.error('Failed to parse Gemini response:', content);
          return [];
        }
      }

      const rawItems = parsed.items || [];
      const items = rawItems.filter((item: Record<string, unknown>) => {
        const name = (item.name || '').toString();
        const desc = (item.description || '').toString();
        if (personKeywords.test(name) || personKeywords.test(desc)) {
          console.warn(`Gemini: excluding person-like item from list: "${name}"`);
          return false;
        }
        return true;
      });
      console.log(`Gemini identified ${items.length} items in image (${rawItems.length - items.length} excluded as person/non-object)`);

      return items.map((item: Record<string, unknown>) => {
        const cat = validCategories.includes(item.category as ItemCategory)
          ? (item.category as ItemCategory)
          : 'other';
        const box2d = item.box_2d as [number, number, number, number] | undefined;
        return {
          name: (item.name as string) || 'Unknown Item',
          category: cat,
          brand: (item.brand as string) || undefined,
          model: (item.model as string) || undefined,
          condition: ((item.condition as string) || 'good') as VisionItem['condition'],
          estimatedAge: item.estimatedAge !== undefined ? (item.estimatedAge as number) : undefined,
          description: (item.description as string) || `${(item.name as string) || 'Item'} identified in image`,
          boundingBox: box2d && Array.isArray(box2d) && box2d.length === 4
            ? convertBox2d(box2d)
            : undefined,
        };
      });
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: unknown } };
      console.error('Gemini API error:', err);
      if (err.response) {
        console.error('Gemini API response error:', err.response.data);
      }
      throw new Error(`Gemini API error: ${err.message}`);
    }
  }
}

export const geminiService = new GeminiService();
