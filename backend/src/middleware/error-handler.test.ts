import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/app-error';
import { errorHandler } from './error-handler';

function createMocks() {
  const req = {} as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next: NextFunction = vi.fn();
  return { req, res, next };
}

describe('errorHandler', () => {
  it('returns 404 with message for AppError notFound', () => {
    const { req, res, next } = createMocks();
    errorHandler(AppError.notFound('Room'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Piece introuvable' });
  });

  it('returns 400 with message for AppError badRequest', () => {
    const { req, res, next } = createMocks();
    errorHandler(AppError.badRequest('Champ requis'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Champ requis' });
  });

  it('returns 400 with French message for MulterError LIMIT_FILE_SIZE', () => {
    const { req, res, next } = createMocks();
    const err = new multer.MulterError('LIMIT_FILE_SIZE');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Fichier trop volumineux (max 10 Mo)' });
  });

  it('returns 400 for image filter rejection', () => {
    const { req, res, next } = createMocks();
    errorHandler(new Error('Seules les images sont acceptees'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Seules les images sont acceptees' });
  });

  it('returns 500 with generic message for unknown errors', () => {
    const { req, res, next } = createMocks();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    errorHandler({ unexpected: true }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erreur serveur' });
    consoleSpy.mockRestore();
  });
});
