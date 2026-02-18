import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

// List all users
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const users = await authService.listUsers();
  res.json(users);
}));

// Create user (email, name, password)
router.post('/users', asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || typeof email !== 'string') {
    throw AppError.badRequest('Email requis');
  }
  if (!password || typeof password !== 'string' || password.length < 8 ||
      !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw AppError.badRequest('Mot de passe requis (min. 8 caracteres, 1 majuscule, 1 chiffre, 1 caractere special)');
  }
  const user = await authService.createUserWithPassword({
    email: email.trim(),
    name: typeof name === 'string' ? name.trim() : undefined,
    password,
  });
  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  });
}));

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// Get one user
router.get('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUserById(paramId(req));
  if (!user) {
    throw AppError.notFound('User');
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}));

// Update user (name, password)
router.patch('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const { name, password } = req.body;
  const user = await authService.updateUser(paramId(req), {
    name: typeof name === 'string' ? name : undefined,
    password: typeof password === 'string' ? password : undefined,
  });
  if (!user) {
    throw AppError.notFound('User');
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}));

// Delete user (cascade: locations, inventories, etc.)
router.delete('/users/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = paramId(req);
  if (req.user?.id === id) {
    throw AppError.badRequest('Vous ne pouvez pas supprimer votre propre compte');
  }
  const user = await authService.getUserById(id);
  if (!user) {
    throw AppError.notFound('User');
  }
  if (user.email === 'admin@local') {
    throw AppError.badRequest('Impossible de supprimer le compte administrateur');
  }
  await authService.deleteUser(id);
  res.status(204).send();
}));

export default router;
