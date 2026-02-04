import { Router } from 'express';
import multer from 'multer';
import { locationService } from '../services/location.service';
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

// GET /api/locations - Liste des lieux
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const list = await locationService.listLocations(userId);
    res.json(list);
  } catch (error: any) {
    console.error('Error listing locations:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/locations - Créer un lieu
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { name, address } = req.body as { name?: string; address?: string };
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Le nom du lieu est requis' });
    }
    const location = await locationService.createLocation(userId, { name: name.trim(), address: address?.trim() || undefined });
    res.status(201).json(location);
  } catch (error: any) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// GET /api/locations/:id - Détail d'un lieu (pièces + coffres)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const location = await locationService.getLocationById(param(req.params.id), userId);
    res.json(location);
  } catch (error: any) {
    if (error.message === 'Location not found') {
      return res.status(404).json({ error: 'Lieu introuvable' });
    }
    console.error('Error fetching location:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// PATCH /api/locations/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { name, address } = req.body as { name?: string; address?: string };
    const location = await locationService.updateLocation(param(req.params.id), userId, { name, address });
    res.json(location);
  } catch (error: any) {
    if (error.message === 'Location not found') {
      return res.status(404).json({ error: 'Lieu introuvable' });
    }
    console.error('Error updating location:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// DELETE /api/locations/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteLocation(param(req.params.id), userId);
    res.json({ message: 'Lieu supprimé' });
  } catch (error: any) {
    if (error.message === 'Location not found') {
      return res.status(404).json({ error: 'Lieu introuvable' });
    }
    console.error('Error deleting location:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/locations/:id/rooms - Ajouter une pièce
router.post('/:id/rooms', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Le nom de la pièce est requis' });
    }
    const room = await locationService.addRoom(param(req.params.id), userId, name.trim());
    res.status(201).json(room);
  } catch (error: any) {
    if (error.message === 'Location not found') {
      return res.status(404).json({ error: 'Lieu introuvable' });
    }
    console.error('Error adding room:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/locations/:id/safes - Ajouter un coffre
router.post('/:id/safes', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Le nom du coffre est requis' });
    }
    const safe = await locationService.addSafe(param(req.params.id), userId, name.trim());
    res.status(201).json(safe);
  } catch (error: any) {
    if (error.message === 'Location not found') {
      return res.status(404).json({ error: 'Lieu introuvable' });
    }
    console.error('Error adding safe:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

export default router;
