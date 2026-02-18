import { Router } from 'express';
import multer from 'multer';
import { inventoryService } from '../services/inventory.service';
import { imageService } from '../services/image.service';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/inventories
router.post('/', requireAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
  const files = req.files as Express.Multer.File[];
  const name = req.body.name as string | undefined;
  const userId = (req as AuthenticatedRequest).user!.id;

  if (!files || files.length === 0) {
    throw AppError.badRequest('Aucune image fournie');
  }

  const inventory = await inventoryService.createInventory(userId, name);

  for (let i = 0; i < files.length; i++) {
    await imageService.saveImage(inventory.id, files[i], i);
  }

  await inventoryService.startProcessing(inventory.id);

  res.status(201).json({
    id: inventory.id,
    status: inventory.status,
    createdAt: inventory.createdAt,
    message: 'Inventaire cree, traitement en cours',
  });
}));

// GET /api/inventories/:id
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const inventoryId = String(req.params.id);
  const inventory = await inventoryService.getInventoryById(inventoryId, userId);

  if (!inventory) {
    throw AppError.notFound('Inventory');
  }

  res.json(inventory);
}));

// GET /api/inventories
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;

  const result = await inventoryService.listInventories(userId, page, limit, status);
  res.json(result);
}));

// GET /api/inventories/:id/images/:imageId
router.get('/:id/images/:imageId', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const inventoryId = String(req.params.id);
  const imageId = String(req.params.imageId);

  const inventory = await inventoryService.getInventoryById(inventoryId, userId);
  if (!inventory) {
    throw AppError.notFound('Inventory');
  }

  const image = await imageService.getImageById(imageId);

  if (!image) {
    throw AppError.notFound('Image');
  }

  if (image.inventoryId !== inventoryId) {
    throw AppError.forbidden('Cette image n\'appartient pas a cet inventaire');
  }

  res.setHeader('Content-Type', image.imageType);
  res.setHeader('Cache-Control', 'private, max-age=31536000');
  res.send(image.imageData);
}));

// PATCH /api/inventories/:id
router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const inventoryId = String(req.params.id);
  const updatedInventory = await inventoryService.updateInventory(inventoryId, userId, req.body);
  res.json(updatedInventory);
}));

// POST /api/inventories/:id/images
router.post('/:id/images', requireAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
  const files = req.files as Express.Multer.File[];
  const inventoryId = String(req.params.id);
  const userId = (req as AuthenticatedRequest).user!.id;

  if (!files || files.length === 0) {
    throw AppError.badRequest('Aucune image fournie');
  }

  const result = await inventoryService.addImagesToInventory(inventoryId, userId, files);
  res.json(result);
}));

// PATCH /api/inventories/:id/items/:itemId
router.patch('/:id/items/:itemId', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const inventoryId = String(req.params.id);
  const itemId = String(req.params.itemId);

  const updatedItem = await inventoryService.updateItem(
    inventoryId,
    itemId,
    userId,
    req.body
  );
  res.json(updatedItem);
}));

// DELETE /api/inventories/:id/items/:itemId
router.delete('/:id/items/:itemId', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const inventoryId = String(req.params.id);
  const itemId = String(req.params.itemId);

  await inventoryService.deleteItem(inventoryId, itemId, userId);
  res.json({ message: 'Objet supprime' });
}));

// DELETE /api/inventories/:id
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.id;
  const inventoryId = String(req.params.id);
  await inventoryService.deleteInventory(inventoryId, userId);
  res.json({ message: 'Inventaire supprime' });
}));

export default router;
