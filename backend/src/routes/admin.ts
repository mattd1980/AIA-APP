import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

// List all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await authService.listUsers();
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

// Create user (email, name, password)
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email requis' });
    }
    if (!password || typeof password !== 'string' || password.length < 8 ||
        !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({
        error: 'Mot de passe requis (min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial)',
      });
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
  } catch (e: any) {
    if (e?.message?.includes('already exists')) {
      return res.status(409).json({ error: e.message });
    }
    if (e?.message?.includes('admin email')) {
      return res.status(400).json({ error: e.message });
    }
    res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// Get one user
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await authService.getUserById(paramId(req));
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

// Update user (name, password)
router.patch('/users/:id', async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const user = await authService.updateUser(paramId(req), {
      name: typeof name === 'string' ? name : undefined,
      password: typeof password === 'string' ? password : undefined,
    });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (e: any) {
    if (e?.message?.includes('ADMIN_PASSWORD')) {
      return res.status(400).json({ error: e.message });
    }
    res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

// Delete user (cascade: locations, inventories, etc.)
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = paramId(req);
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    const user = await authService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    if (user.email === 'admin@local') {
      return res.status(400).json({ error: 'Impossible de supprimer le compte administrateur' });
    }
    await authService.deleteUser(id);
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Erreur serveur' });
  }
});

export default router;
