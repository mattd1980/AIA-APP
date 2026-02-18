import { Router } from 'express';
import { locationService } from '../services/location.service';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';

const router = Router();

const param = (p: string | string[] | undefined): string => (Array.isArray(p) ? p[0] : p) ?? '';

// GET /api/locations
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const list = await locationService.listLocations(userId);
  res.json(list);
}));

// POST /api/locations
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const { name, address } = req.body as { name?: string; address?: string };
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw AppError.badRequest('Le nom du lieu est requis');
  }
  const location = await locationService.createLocation(userId, { name: name.trim(), address: address?.trim() || undefined });
  res.status(201).json(location);
}));

// GET /api/locations/:id
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const location = await locationService.getLocationById(param(req.params.id), userId);
  res.json(location);
}));

// PATCH /api/locations/:id
router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const { name, address } = req.body as { name?: string; address?: string };
  const location = await locationService.updateLocation(param(req.params.id), userId, { name, address });
  res.json(location);
}));

// DELETE /api/locations/:id
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  await locationService.deleteLocation(param(req.params.id), userId);
  res.json({ message: 'Lieu supprime' });
}));

// POST /api/locations/:id/rooms
router.post('/:id/rooms', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const { name } = req.body as { name?: string };
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw AppError.badRequest('Le nom de la piece est requis');
  }
  const room = await locationService.addRoom(param(req.params.id), userId, name.trim());
  res.status(201).json(room);
}));

// POST /api/locations/:id/safes
router.post('/:id/safes', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const { name } = req.body as { name?: string };
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw AppError.badRequest('Le nom du coffre est requis');
  }
  const safe = await locationService.addSafe(param(req.params.id), userId, name.trim());
  res.status(201).json(safe);
}));

export default router;
