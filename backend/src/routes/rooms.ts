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

// GET /api/rooms/:roomId - Détail pièce avec images (sans bytes) et objets détectés
router.get('/:roomId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const room = await locationService.getRoomById(param(req.params.roomId), userId);
    const { images: roomImages, ...rest } = room as any;
    const images = roomImages.map((img: any) => ({
      id: img.id,
      fileName: img.fileName,
      fileSize: img.fileSize,
      uploadOrder: img.uploadOrder,
      createdAt: img.createdAt,
    }));
    const items = (rest.items || []).map((item: any) => ({
      id: item.id,
      roomId: item.roomId,
      roomImageId: item.roomImageId,
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
    }));
    res.json({ ...rest, images, items });
  } catch (error: any) {
    if (error.message === 'Room not found') {
      return res.status(404).json({ error: 'Pièce introuvable' });
    }
    console.error('Error fetching room:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/rooms/:roomId/items - Ajouter un objet manuellement (suggestion assurance)
router.post('/:roomId/items', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const body = req.body as { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string };
    if (!body.itemName || typeof body.itemName !== 'string' || !body.itemName.trim()) {
      return res.status(400).json({ error: 'Le nom de l\'objet est requis' });
    }
    if (!body.category || !body.condition) {
      return res.status(400).json({ error: 'Catégorie et état sont requis' });
    }
    const item = await locationService.createRoomManualItem(param(req.params.roomId), userId, {
      itemName: body.itemName.trim(),
      category: body.category,
      condition: body.condition,
      estimatedValue: body.estimatedValue,
      replacementValue: body.replacementValue,
      notes: body.notes?.trim(),
    });
    res.status(201).json(item);
  } catch (error: any) {
    if (error.message === 'Room not found') {
      return res.status(404).json({ error: 'Pièce introuvable' });
    }
    console.error('Error adding room item:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// PATCH /api/rooms/:roomId/items/:itemId
router.patch('/:roomId/items/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const body = req.body as { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string };
    const item = await locationService.updateRoomItem(param(req.params.roomId), param(req.params.itemId), userId, {
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
    console.error('Error updating room item:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// DELETE /api/rooms/:roomId/items/:itemId
router.delete('/:roomId/items/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteRoomItem(param(req.params.itemId), userId);
    res.json({ message: 'Objet supprimé' });
  } catch (error: any) {
    if (error.message === 'Item not found') {
      return res.status(404).json({ error: 'Objet introuvable' });
    }
    console.error('Error deleting room item:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/rooms/:roomId/analyze - Lancer l'analyse des photos (détection d'objets)
router.post('/:roomId/analyze', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    await analysisService.startRoomAnalysis(param(req.params.roomId), userId);
    res.json({ message: 'Analyse lancée', status: 'processing' });
  } catch (error: any) {
    if (error.message === 'Room not found') {
      return res.status(404).json({ error: 'Pièce introuvable' });
    }
    if (error.message === 'Aucune photo dans cette pièce') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error starting room analysis:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// PATCH /api/rooms/:roomId
router.patch('/:roomId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Le nom de la pièce est requis' });
    }
    const room = await locationService.updateRoom(param(req.params.roomId), userId, name.trim());
    res.json(room);
  } catch (error: any) {
    if (error.message === 'Room not found') {
      return res.status(404).json({ error: 'Pièce introuvable' });
    }
    console.error('Error updating room:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// DELETE /api/rooms/:roomId
router.delete('/:roomId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteRoom(param(req.params.roomId), userId);
    res.json({ message: 'Pièce supprimée' });
  } catch (error: any) {
    if (error.message === 'Room not found') {
      return res.status(404).json({ error: 'Pièce introuvable' });
    }
    console.error('Error deleting room:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/rooms/:roomId/images - Ajouter des photos
router.post('/:roomId/images', requireAuth, upload.array('images', 20), async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }
    const roomId = param(req.params.roomId);
    const created = [];
    for (let i = 0; i < files.length; i++) {
      const img = await locationService.saveRoomImage(roomId, userId, files[i], i);
      created.push({ id: img.id, fileName: img.fileName, fileSize: img.fileSize, uploadOrder: img.uploadOrder });
    }
    res.status(201).json(created);
  } catch (error: any) {
    if (error.message === 'Room not found') {
      return res.status(404).json({ error: 'Pièce introuvable' });
    }
    console.error('Error adding room images:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// GET /api/rooms/:roomId/images/:imageId - Récupérer le fichier image
router.get('/:roomId/images/:imageId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const img = await locationService.getRoomImageById(param(req.params.imageId), userId);
    res.contentType(img.imageType);
    res.send(img.imageData);
  } catch (error: any) {
    if (error.message === 'Image not found') {
      return res.status(404).json({ error: 'Image introuvable' });
    }
    console.error('Error fetching room image:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// DELETE /api/rooms/:roomId/images/:imageId
router.delete('/:roomId/images/:imageId', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteRoomImage(param(req.params.imageId), userId);
    res.json({ message: 'Image supprimée' });
  } catch (error: any) {
    if (error.message === 'Image not found') {
      return res.status(404).json({ error: 'Image introuvable' });
    }
    console.error('Error deleting room image:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

export default router;
