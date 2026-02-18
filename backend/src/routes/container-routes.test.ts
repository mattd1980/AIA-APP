import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const { mockLocationService, mockAnalysisService, authFlag } = vi.hoisted(() => ({
  mockLocationService: {
    getContainerById: vi.fn(),
    updateContainer: vi.fn(),
    deleteContainer: vi.fn(),
    saveContainerImage: vi.fn(),
    getContainerImageById: vi.fn(),
    deleteContainerImage: vi.fn(),
    createContainerManualItem: vi.fn(),
    updateContainerItem: vi.fn(),
    deleteContainerItem: vi.fn(),
  },
  mockAnalysisService: {
    startContainerAnalysis: vi.fn(),
  },
  authFlag: { value: true },
}));

vi.mock('../middleware/auth', () => ({
  requireAuth: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (authFlag.value) {
      req.user = { id: 'test-user', email: 'test@example.com' };
      return next();
    }
    res.status(401).json({ error: 'Authentification requise' });
  },
}));

vi.mock('../services/location.service', () => ({
  locationService: mockLocationService,
}));

vi.mock('../services/analysis.service', () => ({
  analysisService: mockAnalysisService,
}));

import { createContainerRouter } from './container-routes';
import { errorHandler } from '../middleware/error-handler';
import type { ContainerType } from '../types/container';
import { getContainerConfig } from '../types/container';

function createApp(type: ContainerType) {
  const app = express();
  app.use(express.json());
  app.use('/', createContainerRouter(type));
  app.use(errorHandler);
  return app;
}

describe.each(['room', 'safe'] as const)('container-routes (%s)', (type) => {
  const config = getContainerConfig(type);
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    authFlag.value = true;
    app = createApp(type);
  });

  it('GET /:id returns 401 without auth', async () => {
    authFlag.value = false;
    const res = await request(app).get('/c1');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentification requise');
  });

  it('GET /:id returns container detail', async () => {
    const container = {
      id: 'c1',
      name: 'Test',
      locationId: 'loc1',
      analysisStatus: 'idle',
      location: { id: 'loc1', name: 'Loc' },
      images: [{ id: 'img1', fileName: 'a.jpg', fileSize: 100, uploadOrder: 0, createdAt: new Date() }],
      items: [],
      analysisRuns: [],
    };
    mockLocationService.getContainerById.mockResolvedValue(container);

    const res = await request(app).get('/c1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('c1');
    expect(res.body.images).toHaveLength(1);
    expect(res.body.images[0].id).toBe('img1');
    expect(mockLocationService.getContainerById).toHaveBeenCalledWith(type, 'c1', 'test-user');
  });

  it('POST /:id/items returns 400 when itemName is missing', async () => {
    const res = await request(app)
      .post('/c1/items')
      .send({ category: 'Electronics', condition: 'good' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('nom');
  });

  it('POST /:id/items returns 201 when valid', async () => {
    const item = { id: 'item1', itemName: 'Laptop', category: 'Electronics', condition: 'good' };
    mockLocationService.createContainerManualItem.mockResolvedValue(item);

    const res = await request(app)
      .post('/c1/items')
      .send({ itemName: 'Laptop', category: 'Electronics', condition: 'good' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('item1');
    expect(mockLocationService.createContainerManualItem).toHaveBeenCalledWith(
      type, 'c1', 'test-user',
      expect.objectContaining({ itemName: 'Laptop', category: 'Electronics', condition: 'good' }),
    );
  });

  it('PATCH /:id/items/:itemId returns 200', async () => {
    const updated = { id: 'item1', itemName: 'Updated' };
    mockLocationService.updateContainerItem.mockResolvedValue(updated);

    const res = await request(app)
      .patch('/c1/items/item1')
      .send({ itemName: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.itemName).toBe('Updated');
    expect(mockLocationService.updateContainerItem).toHaveBeenCalledWith(
      type, 'c1', 'item1', 'test-user', expect.objectContaining({ itemName: 'Updated' }),
    );
  });

  it('DELETE /:id/items/:itemId returns 200', async () => {
    mockLocationService.deleteContainerItem.mockResolvedValue(undefined);

    const res = await request(app).delete('/c1/items/item1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(config.itemDeletedMessage);
    expect(mockLocationService.deleteContainerItem).toHaveBeenCalledWith(type, 'item1', 'test-user');
  });

  it('POST /:id/analyze returns 200', async () => {
    mockAnalysisService.startContainerAnalysis.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/c1/analyze')
      .send({ model: 'gpt-4o' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('processing');
    expect(res.body.message).toBe(config.analyzeStartedMessage);
    expect(mockAnalysisService.startContainerAnalysis).toHaveBeenCalledWith(type, 'c1', 'test-user', 'gpt-4o');
  });

  it('PATCH /:id returns 400 when name is empty', async () => {
    const res = await request(app)
      .patch('/c1')
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(config.nameRequiredMessage);
  });

  it('DELETE /:id returns 200', async () => {
    mockLocationService.deleteContainer.mockResolvedValue(undefined);

    const res = await request(app).delete('/c1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(config.deletedMessage);
    expect(mockLocationService.deleteContainer).toHaveBeenCalledWith(type, 'c1', 'test-user');
  });
});
