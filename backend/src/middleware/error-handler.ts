import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/app-error';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: 'Fichier trop volumineux (max 10 Mo)',
      LIMIT_UNEXPECTED_FILE: 'Champ de fichier inattendu',
    };
    res.status(400).json({ error: messages[err.code] ?? err.message });
    return;
  }

  if (err instanceof Error && err.message === 'Seules les images sont acceptees') {
    res.status(400).json({ error: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erreur serveur' });
}
