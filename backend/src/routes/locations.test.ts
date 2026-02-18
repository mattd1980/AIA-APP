import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// vi.hoisted runs before vi.mock hoisting — safe for shared refs
const { mockLocationService, authFlag } = vi.hoisted(() => ({
  mockLocationService: {
    listLocations: vi.fn(),
    createLocation: vi.fn(),
    getLocationById: vi.fn(),
    updateLocation: vi.fn(),
    deleteLocation: vi.fn(),
    addRoom: vi.fn(),
    addSafe: vi.fn(),
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

import locationsRouter from './locations';
import { errorHandler } from '../middleware/error-handler';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/locations', locationsRouter);
  app.use(errorHandler);
  return app;
}

describe('Locations routes', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    authFlag.value = true;
    app = createApp();
  });

  it('GET /api/locations returns 200 with list', async () => {
    const locations = [
      { id: 'loc1', name: 'Maison', address: '123 Rue Principale' },
      { id: 'loc2', name: 'Bureau', address: '456 Av. du Travail' },
    ];
    mockLocationService.listLocations.mockResolvedValue(locations);

    const res = await request(app).get('/api/locations');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(locations);
    expect(mockLocationService.listLocations).toHaveBeenCalledWith('test-user');
  });

  it('POST /api/locations returns 201 on valid input', async () => {
    const created = { id: 'loc1', name: 'Maison', address: undefined };
    mockLocationService.createLocation.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/locations')
      .send({ name: 'Maison' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
    expect(mockLocationService.createLocation).toHaveBeenCalledWith('test-user', {
      name: 'Maison',
      address: undefined,
    });
  });

  it('POST /api/locations returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/locations')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('nom');
  });

  it('GET /api/locations/:id returns 200 with location', async () => {
    const location = { id: 'loc1', name: 'Maison', rooms: [], safes: [] };
    mockLocationService.getLocationById.mockResolvedValue(location);

    const res = await request(app).get('/api/locations/loc1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(location);
    expect(mockLocationService.getLocationById).toHaveBeenCalledWith('loc1', 'test-user');
  });

  it('GET /api/locations returns 401 without auth', async () => {
    authFlag.value = false;

    const res = await request(app).get('/api/locations');

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/locations/:id/rooms returns 201', async () => {
    const room = { id: 'room1', name: 'Salon', locationId: 'loc1' };
    mockLocationService.addRoom.mockResolvedValue(room);

    const res = await request(app)
      .post('/api/locations/loc1/rooms')
      .send({ name: 'Salon' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(room);
    expect(mockLocationService.addRoom).toHaveBeenCalledWith('loc1', 'test-user', 'Salon');
  });

  it('POST /api/locations/:id/safes returns 201', async () => {
    const safe = { id: 'safe1', name: 'Coffre principal', locationId: 'loc1' };
    mockLocationService.addSafe.mockResolvedValue(safe);

    const res = await request(app)
      .post('/api/locations/loc1/safes')
      .send({ name: 'Coffre principal' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(safe);
    expect(mockLocationService.addSafe).toHaveBeenCalledWith('loc1', 'test-user', 'Coffre principal');
  });
});
