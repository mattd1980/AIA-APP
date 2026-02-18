import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// vi.hoisted runs before vi.mock hoisting — safe for shared refs
const { mockEstimatePrices, authFlag } = vi.hoisted(() => ({
  mockEstimatePrices: vi.fn(),
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

vi.mock('../services/pricing.service', () => ({
  pricingService: {
    estimatePrices: mockEstimatePrices,
  },
}));

import pricingRouter from './pricing';
import { errorHandler } from '../middleware/error-handler';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/pricing', pricingRouter);
  app.use(errorHandler);
  return app;
}

describe('POST /api/pricing/estimate', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    authFlag.value = true;
    app = createApp();
  });

  it('returns 401 when not authenticated', async () => {
    authFlag.value = false;

    const res = await request(app)
      .post('/api/pricing/estimate')
      .send({ items: [{ itemName: 'Laptop' }] });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when items is missing', async () => {
    const res = await request(app)
      .post('/api/pricing/estimate')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('tableau');
  });

  it('returns 400 when items is empty array', async () => {
    const res = await request(app)
      .post('/api/pricing/estimate')
      .send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('tableau');
  });

  it('returns 400 when items exceeds 50', async () => {
    const items = Array.from({ length: 51 }, (_, i) => ({ itemName: `Item ${i}` }));

    const res = await request(app)
      .post('/api/pricing/estimate')
      .send({ items });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('50');
  });

  it('returns 200 with correct pricing results on valid request', async () => {
    mockEstimatePrices.mockResolvedValue([
      {
        estimatedValue: 100,
        replacementValue: 130,
        pricingMetadata: {
          pricingSource: 'dataforseo',
          medianPrice: 100,
          sampleCount: 5,
          searchQuery: '"Laptop"',
          priceRange: { min: 80, max: 120 },
          estimatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    ]);

    const res = await request(app)
      .post('/api/pricing/estimate')
      .send({ items: [{ itemName: 'Laptop', brand: 'Dell' }] });

    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0].estimatedValue).toBe(100);
    expect(res.body.results[0].replacementValue).toBe(130);
    expect(mockEstimatePrices).toHaveBeenCalledTimes(1);

    // Verify the service received correctly mapped inputs
    const inputs = mockEstimatePrices.mock.calls[0][0];
    expect(inputs[0].itemName).toBe('Laptop');
    expect(inputs[0].brand).toBe('Dell');
  });
});
