import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name?: string;
      picture?: string;
      isAdmin?: boolean;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    return next();
  }
  res.status(401).json({ error: 'Authentification requise' });
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.isAdmin) {
    return next();
  }
  if (req.user) {
    return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
  }
  res.status(401).json({ error: 'Authentification requise' });
};
