import { Router } from 'express';
import multer from 'multer';
import { locationService } from '../services/location.service';
import { analysisService } from '../services/analysis.service';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const param = (p: string | string[] | undefined): string => (Array.isArray(p) ? p[0] : p) ?? '';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Seules les images sont acceptées'));
  },
});

function serializeSafeItem(item: any) {
  return {
    id: item.id,
    safeId: item.safeId,
    safeImageId: item.safeImageId,
    safeAnalysisRunId: item.safeAnalysisRunId ?? undefined,
    category: item.category,
    itemName: item.itemName,
    brand: item.brand,
    model: item.model,
    condition: item.condition,
    estimatedAge: item.estimatedAge,
    notes: item.notes,
    estimatedValue: Number(item.estimatedValue),
    replacementValue: Number(item.replacementValue),
    aiAnalysis: item.aiAnalysis,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// GET /api/safes/:safeId - Détail coffre avec images (sans bytes), objets et runs d'analyse par modèle
router.get('/:safeId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const safe = await locationService.getSafeById(param(req.params.safeId), userId);
    const { images: safeImages, items: safeItems, analysisRuns: runs, ...rest } = safe as any;
    const images = safeImages.map((img: any) => ({
      id: img.id,
      fileName: img.fileName,
      fileSize: img.fileSize,
      uploadOrder: img.uploadOrder,
      createdAt: img.createdAt,
    }));
    const items = (safeItems || []).map(serializeSafeItem);
    const analysisRuns = (runs || []).map((run: any) => ({
      id: run.id,
      modelId: run.modelId,
      status: run.status,
      analysisMetadata: run.analysisMetadata ?? {},
      createdAt: run.createdAt,
      items: (run.items || []).map(serializeSafeItem),
    }));
    res.json({ ...rest, images, items, analysisRuns });
  } catch (error: any) {
    if (error.message === 'Safe not found') {
      return res.status(404).json({ error: 'Coffre introuvable' });
    }
    console.error('Error fetching safe:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/safes/:safeId/items - Ajouter un objet manuellement (suggestion assurance)
router.post('/:safeId/items', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const body = req.body as { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string };
    if (!body.itemName || typeof body.itemName !== 'string' || !body.itemName.trim()) {
      return res.status(400).json({ error: 'Le nom de l\'objet est requis' });
    }
    if (!body.category || !body.condition) {
      return res.status(400).json({ error: 'Catégorie et état sont requis' });
    }
    const item = await locationService.createSafeManualItem(param(req.params.safeId), userId, {
      itemName: body.itemName.trim(),
      category: body.category,
      condition: body.condition,
      estimatedValue: body.estimatedValue,
      replacementValue: body.replacementValue,
      notes: body.notes?.trim(),
    });
    res.status(201).json(item);
  } catch (error: any) {
    if (error.message === 'Safe not found') {
      return res.status(404).json({ error: 'Coffre introuvable' });
    }
    console.error('Error adding safe item:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// PATCH /api/safes/:safeId/items/:itemId
router.patch('/:safeId/items/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const body = req.body as { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string };
    const item = await locationService.updateSafeItem(param(req.params.safeId), param(req.params.itemId), userId, {
      itemName: body.itemName?.trim(),
      category: body.category,
      condition: body.condition,
      estimatedValue: body.estimatedValue,
      replacementValue: body.replacementValue,
      notes: body.notes,
    });
    res.json(item);
  } catch (error: any) {
    if (error.message === 'Item not found') {
      return res.status(404).json({ error: 'Objet introuvable' });
    }
    console.error('Error updating safe item:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// DELETE /api/safes/:safeId/items/:itemId
router.delete('/:safeId/items/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteSafeItem(param(req.params.itemId), userId);
    res.json({ message: 'Objet supprimé' });
  } catch (error: any) {
    if (error.message === 'Item not found') {
      return res.status(404).json({ error: 'Objet introuvable' });
    }
    console.error('Error deleting safe item:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/safes/:safeId/analyze - Lancer l'analyse des photos (détection d'objets)
router.post('/:safeId/analyze', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const model = (req.body as { model?: string })?.model;
    await analysisService.startSafeAnalysis(param(req.params.safeId), userId, model);
    res.json({ message: 'Analyse lancée', status: 'processing' });
  } catch (error: any) {
    if (error.message === 'Safe not found') {
      return res.status(404).json({ error: 'Coffre introuvable' });
    }
    if (error.message === 'Aucune photo dans ce coffre') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error starting safe analysis:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// PATCH /api/safes/:safeId
router.patch('/:safeId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Le nom du coffre est requis' });
    }
    const safe = await locationService.updateSafe(param(req.params.safeId), userId, name.trim());
    res.json(safe);
  } catch (error: any) {
    if (error.message === 'Safe not found') {
      return res.status(404).json({ error: 'Coffre introuvable' });
    }
    console.error('Error updating safe:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// DELETE /api/safes/:safeId
router.delete('/:safeId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteSafe(param(req.params.safeId), userId);
    res.json({ message: 'Coffre supprimé' });
  } catch (error: any) {
    if (error.message === 'Safe not found') {
      return res.status(404).json({ error: 'Coffre introuvable' });
    }
    console.error('Error deleting safe:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/safes/:safeId/images - Ajouter des photos
router.post('/:safeId/images', requireAuth, upload.array('images', 20), async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
    const safeId = param(req.params.safeId);
    const created = [];
    for (let i = 0; i < files.length; i++) {
      const img = await locationService.saveSafeImage(safeId, userId, files[i], i);
      created.push({ id: img.id, fileName: img.fileName, fileSize: img.fileSize, uploadOrder: img.uploadOrder });
    }
    res.status(201).json(created);
  } catch (error: any) {
    if (error.message === 'Safe not found') {
      return res.status(404).json({ error: 'Coffre introuvable' });
    }
    console.error('Error adding safe images:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// GET /api/safes/:safeId/images/:imageId - Récupérer le fichier image
router.get('/:safeId/images/:imageId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const img = await locationService.getSafeImageById(param(req.params.imageId), userId);
    res.contentType(img.imageType);
    res.send(img.imageData);
  } catch (error: any) {
    if (error.message === 'Image not found') {
      return res.status(404).json({ error: 'Image introuvable' });
    }
    console.error('Error fetching safe image:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// DELETE /api/safes/:safeId/images/:imageId
router.delete('/:safeId/images/:imageId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteSafeImage(param(req.params.imageId), userId);
    res.json({ message: 'Image supprimée' });
  } catch (error: any) {
    if (error.message === 'Image not found') {
      return res.status(404).json({ error: 'Image introuvable' });
    }
    console.error('Error deleting safe image:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

export default router;
