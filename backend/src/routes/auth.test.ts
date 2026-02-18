import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// vi.hoisted runs before vi.mock hoisting — safe for shared refs
const { mockAuthService, authUser } = vi.hoisted(() => ({
  mockAuthService: {
    findOrCreateUser: vi.fn(),
    getUserById: vi.fn(),
    authenticateByEmailPassword: vi.fn(),
  },
  authUser: { value: null as Express.User | null },
}));

vi.mock('../services/auth.service', () => ({
  authService: mockAuthService,
}));

// Mock passport to avoid strategy registration side-effects
vi.mock('passport', () => {
  const passportMock = {
    use: vi.fn(),
    serializeUser: vi.fn(),
    deserializeUser: vi.fn(),
    authenticate: vi.fn(() => (req: express.Request, res: express.Response, next: express.NextFunction) => next()),
  };
  return { default: passportMock };
});

vi.mock('passport-google-oauth20', () => ({
  Strategy: vi.fn(),
}));

vi.mock('passport-local', () => ({
  Strategy: vi.fn(),
}));

import authRouter from './auth';

function createApp() {
  const app = express();
  app.use(express.json());
  // Simulate session user injection before auth routes
  app.use((req, _res, next) => {
    if (authUser.value) {
      req.user = authUser.value;
    }
    next();
  });
  app.use('/api/auth', authRouter);
  return app;
}

describe('Auth routes', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    authUser.value = null;
    app = createApp();
  });

  describe('GET /api/auth/me', () => {
    it('returns 200 with user data when authenticated', async () => {
      authUser.value = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic.jpg',
        isAdmin: false,
      };

      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('user-1');
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.name).toBe('Test User');
      expect(res.body.isAdmin).toBe(false);
    });

    it('returns 401 when not authenticated', async () => {
      authUser.value = null;

      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/auth/google/enabled', () => {
    it('returns enabled status', async () => {
      const res = await request(app).get('/api/auth/google/enabled');

      expect(res.status).toBe(200);
      expect(typeof res.body.enabled).toBe('boolean');
    });
  });
});
