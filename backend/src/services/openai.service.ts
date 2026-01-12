import OpenAI from 'openai';
import { OpenAIItem, ItemCategory } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  async analyzeImage(imageBuffer: Buffer, imageType: string = 'image/jpeg'): Promise<OpenAIItem[]> {
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

      const response = await openai.responses.create({
        model: 'gpt-5-mini', // Using GPT-5-mini for vision capabilities (cheaper/faster than gpt-5)
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `Vous analysez une photo à des fins d'inventaire d'assurance. Identifiez TOUS les objets visibles, meubles, appareils électroniques, électroménagers, décorations et effets personnels dans cette image.

IMPORTANT: Toutes vos réponses doivent être en FRANÇAIS.

Pour CHAQUE objet que vous identifiez, fournissez:
- name: Un nom clair et spécifique en français (ex: "Téléviseur LED Samsung 55 pouces" et non juste "TV")
- category: Un parmi: furniture, electronics, clothing, appliances, decor, other (gardez les valeurs en anglais pour la catégorie)
- brand: Le nom de la marque si visible ou identifiable (laissez null si inconnu)
- model: Le numéro de modèle ou nom si visible (laissez null si inconnu)
- condition: Un parmi: new, excellent, good, fair, poor (basé sur l'usure/dommages visibles)
- estimatedAge: Âge approximatif en années (0 si neuf, estimez basé sur le style/l'usure)
- description: Une description détaillée EN FRANÇAIS incluant le matériau, la couleur, les dimensions estimées, et toute caractéristique distinctive qui aiderait à l'identifier pour les réclamations d'assurance
- boundingBox: L'emplacement de l'objet dans l'image en coordonnées normalisées (plage 0-1):
  - x: Position du bord gauche (0 = le plus à gauche, 1 = le plus à droite)
  - y: Position du bord supérieur (0 = le plus haut, 1 = le plus bas)
  - width: Largeur de la boîte englobante (0-1, relative à la largeur de l'image)
  - height: Hauteur de la boîte englobante (0-1, relative à la hauteur de l'image)

IMPORTANT:
- Listez TOUS les objets que vous pouvez voir, même les petits
- Soyez spécifique et détaillé dans les descriptions (en français)
- Incluez les dimensions si vous pouvez les estimer
- Notez tout dommage ou usure visible
- Pour les meubles, notez le matériau (bois, métal, tissu, etc.)
- Pour l'électronique, incluez la taille de l'écran, le type, etc. si visible
- Fournissez des coordonnées de boîte englobante précises au format normalisé (plage 0-1) pour chaque objet
- La boîte englobante doit étroitement entourer la portion visible de chaque objet

Retournez UNIQUEMENT du JSON valide dans ce format exact:
{
  "items": [
    {
      "name": "Nom de l'objet en français",
      "category": "furniture|electronics|clothing|appliances|decor|other",
      "brand": "Nom de la marque ou null",
      "model": "Nom du modèle ou null",
      "condition": "new|excellent|good|fair|poor",
      "estimatedAge": 0,
      "description": "Description détaillée en français avec matériau, couleur, taille, caractéristiques",
      "boundingBox": {
        "x": 0.25,
        "y": 0.30,
        "width": 0.20,
        "height": 0.15
      }
    }
  ]
}`,
              },
              {
                type: 'input_image',
                image_url: imageDataUrl,
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

      const items = parsed.items || [];
      console.log(`OpenAI identified ${items.length} items in image`);

      return items.map((item: any) => ({
        name: item.name || 'Unknown Item',
        category: (item.category || 'other') as ItemCategory,
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
      }));
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
