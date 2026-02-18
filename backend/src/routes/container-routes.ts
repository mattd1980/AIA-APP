import { Router } from 'express';
import multer from 'multer';
import { locationService } from '../services/location.service';
import { analysisService } from '../services/analysis.service';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';
import type { ContainerType } from '../types/container';
import { getContainerConfig } from '../types/container';

const param = (p: string | string[] | undefined): string => (Array.isArray(p) ? p[0] : p) ?? '';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Seules les images sont acceptees'));
  },
});

function serializeItem(item: Record<string, unknown>, config: ReturnType<typeof getContainerConfig>) {
  return {
    id: item.id,
    [config.idField]: item[config.idField],
    [config.imageIdField]: item[config.imageIdField],
    [config.runIdField]: (item[config.runIdField] as string | null) ?? undefined,
    containerId: item[config.idField],
    containerImageId: item[config.imageIdField],
    containerRunId: (item[config.runIdField] as string | null) ?? undefined,
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

export function createContainerRouter(type: ContainerType): Router {
  const router = Router();
  const config = getContainerConfig(type);

  // GET /:id - Detail
  router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const container = await locationService.getContainerById(type, param(req.params.id), userId);
    const { images: rawImages, items: rawItems, analysisRuns: runs, ...rest } = container as Record<string, unknown>;
    const images = (rawImages as Record<string, unknown>[]).map((img) => ({
      id: img.id,
      fileName: img.fileName,
      fileSize: img.fileSize,
      uploadOrder: img.uploadOrder,
      createdAt: img.createdAt,
    }));
    const items = ((rawItems as Record<string, unknown>[]) || []).map((item) => serializeItem(item, config));
    const analysisRuns = ((runs as Record<string, unknown>[]) || []).map((run) => ({
      id: run.id,
      modelId: run.modelId,
      status: run.status,
      analysisMetadata: (run.analysisMetadata as Record<string, unknown>) ?? {},
      createdAt: run.createdAt,
      items: ((run.items as Record<string, unknown>[]) || []).map((item) => serializeItem(item, config)),
    }));
    res.json({ ...rest, images, items, analysisRuns });
  }));

  // POST /:id/items - Add item manually
  router.post('/:id/items', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const body = req.body as { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string };
    if (!body.itemName || typeof body.itemName !== 'string' || !body.itemName.trim()) {
      throw AppError.badRequest('Le nom de l\'objet est requis');
    }
    if (!body.category || !body.condition) {
      throw AppError.badRequest('Categorie et etat sont requis');
    }
    const item = await locationService.createContainerManualItem(type, param(req.params.id), userId, {
      itemName: body.itemName.trim(),
      category: body.category,
      condition: body.condition,
      estimatedValue: body.estimatedValue,
      replacementValue: body.replacementValue,
      notes: body.notes?.trim(),
    });
    res.status(201).json(item);
  }));

  // PATCH /:id/items/:itemId
  router.patch('/:id/items/:itemId', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const body = req.body as { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string };
    const item = await locationService.updateContainerItem(type, param(req.params.id), param(req.params.itemId), userId, {
      itemName: body.itemName?.trim(),
      category: body.category,
      condition: body.condition,
      estimatedValue: body.estimatedValue,
      replacementValue: body.replacementValue,
      notes: body.notes,
    });
    res.json(item);
  }));

  // DELETE /:id/items/:itemId
  router.delete('/:id/items/:itemId', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteContainerItem(type, param(req.params.itemId), userId);
    res.json({ message: config.itemDeletedMessage });
  }));

  // POST /:id/analyze
  router.post('/:id/analyze', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const model = (req.body as { model?: string })?.model;
    await analysisService.startContainerAnalysis(type, param(req.params.id), userId, model);
    res.json({ message: config.analyzeStartedMessage, status: 'processing' });
  }));

  // PATCH /:id
  router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw AppError.badRequest(config.nameRequiredMessage);
    }
    const updated = await locationService.updateContainer(type, param(req.params.id), userId, name.trim());
    res.json(updated);
  }));

  // DELETE /:id
  router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteContainer(type, param(req.params.id), userId);
    res.json({ message: config.deletedMessage });
  }));

  // POST /:id/images
  router.post('/:id/images', requireAuth, upload.array('images', 20), asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw AppError.badRequest('Aucune image fournie');
    }
    const containerId = param(req.params.id);
    const created = [];
    for (let i = 0; i < files.length; i++) {
      const img = await locationService.saveContainerImage(type, containerId, userId, files[i], i);
      created.push({ id: img.id, fileName: img.fileName, fileSize: img.fileSize, uploadOrder: img.uploadOrder });
    }
    res.status(201).json(created);
  }));

  // GET /:id/images/:imageId
  router.get('/:id/images/:imageId', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const img = await locationService.getContainerImageById(type, param(req.params.imageId), userId);
    res.contentType(img.imageType);
    res.send(img.imageData);
  }));

  // DELETE /:id/images/:imageId
  router.delete('/:id/images/:imageId', requireAuth, asyncHandler(async (req, res) => {
    const userId = (req as AuthenticatedRequest).user!.id;
    await locationService.deleteContainerImage(type, param(req.params.imageId), userId);
    res.json({ message: config.imageDeletedMessage });
  }));

  return router;
}
