import OpenAI from 'openai';
import { OpenAIItem, ItemCategory } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default: gpt-5.2 (OpenAI flagship, image input, Responses API). Crème de la crème: gpt-5.2-pro. Cheaper: gpt-5-mini
const DEFAULT_VISION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-5.2';

/** Vision models users can select (id = API model name) */
export const VISION_MODELS = [
  { id: 'gpt-5.2-pro', label: 'GPT-5.2 Pro (meilleure qualité, plus lent)' },
  { id: 'gpt-5.2', label: 'GPT-5.2 (recommandé)' },
  { id: 'gpt-5-mini', label: 'GPT-5 Mini (rapide, économique)' },
  { id: 'gpt-4o', label: 'GPT-4o (alternatif)' },
] as const;

export type VisionModelId = (typeof VISION_MODELS)[number]['id'];

const ALLOWED_IDS = new Set<string>(VISION_MODELS.map((m) => m.id));

function resolveModel(userModel?: string | null): VisionModelId {
  if (userModel && ALLOWED_IDS.has(userModel)) return userModel as VisionModelId;
  return DEFAULT_VISION_MODEL as VisionModelId;
}

class OpenAIService {
  async analyzeImage(imageBuffer: Buffer, imageType: string = 'image/jpeg', model?: string | null): Promise<OpenAIItem[]> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Extract and validate MIME type for data URI (default to jpeg if not provided)
    // Supported formats: image/jpeg, image/png, image/webp, image/gif
    let mimeType = imageType || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      mimeType = 'image/jpeg'; // Fallback to JPEG if invalid format
    }

    // Validate base64 encoding
    if (!base64Image || base64Image.length === 0) {
      throw new Error('Invalid image buffer: empty or corrupted');
    }

    try {
      // Format base64 image as data URL
      const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

      const modelId = resolveModel(model);
      const response = await openai.responses.create({
        model: modelId,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Vous analysez une photo pour un inventaire d'assurance habitation. Listez UNIQUEMENT les OBJETS et BIENS susceptibles d'être assurés (meubles, électronique, électroménager, bijoux, œuvres d'art, objets de valeur, etc.).

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
- boundingBox: Coordonnées normalisées (0-1): x (gauche), y (haut), width, height

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
      "boundingBox": { "x": 0.25, "y": 0.30, "width": 0.20, "height": 0.15 }
    }
  ]
}`,
              },
              {
                type: 'input_image',
                image_url: imageDataUrl,
                detail: 'high',
              },
            ],
          },
        ],
      });

      const content = response.output_text;
      if (!content) {
        console.warn('OpenAI returned empty content');
        return [];
      }

      // Parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks or text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          console.error('Failed to parse OpenAI response:', content);
          return [];
        }
      }

      const rawItems = parsed.items || [];
      const validCategories: ItemCategory[] = ['furniture', 'electronics', 'clothing', 'appliances', 'decor', 'jewelry', 'art', 'collectibles', 'sports_equipment', 'other'];
      const personKeywords = /\b(personne|person|people|humain|human|child|children|kid|kids|baby|bébé|adult|adulte|homme|woman|femme|enfant|man|woman|visage|face)\b/i;
      const items = rawItems.filter((item: any) => {
        const name = (item.name || '').toString();
        const desc = (item.description || '').toString();
        if (personKeywords.test(name) || personKeywords.test(desc)) {
          console.warn(`OpenAI: excluding person-like item from list: "${name}"`);
          return false;
        }
        return true;
      });
      console.log(`OpenAI identified ${items.length} items in image (${rawItems.length - items.length} excluded as person/non-object)`);

      return items.map((item: any) => {
        const cat = validCategories.includes(item.category) ? item.category : 'other';
        return {
        name: item.name || 'Unknown Item',
        category: cat as ItemCategory,
        brand: item.brand || undefined,
        model: item.model || undefined,
        condition: (item.condition || 'good') as any,
        estimatedAge: item.estimatedAge !== undefined ? item.estimatedAge : undefined,
        description: item.description || `${item.name || 'Item'} identified in image`,
        boundingBox: item.boundingBox ? {
          x: Math.max(0, Math.min(1, item.boundingBox.x || 0)),
          y: Math.max(0, Math.min(1, item.boundingBox.y || 0)),
          width: Math.max(0, Math.min(1, item.boundingBox.width || 0)),
          height: Math.max(0, Math.min(1, item.boundingBox.height || 0)),
        } : undefined,
      };
      });
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      if (error.response) {
        console.error('OpenAI API response error:', error.response.data);
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}

export const openaiService = new OpenAIService();
