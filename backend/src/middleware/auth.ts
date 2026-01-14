import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name?: string;
      picture?: string;
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
  res.status(401).json({ error: 'Authentication required' });
};
