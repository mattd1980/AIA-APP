import { Router } from 'express';
import prisma from '../database/client';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/live', async (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const HEALTH_DB_TIMEOUT_MS = 10_000;

router.get('/', asyncHandler(async (req, res) => {
  const result = await Promise.race([
    prisma.$queryRaw`SELECT 1`,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), HEALTH_DB_TIMEOUT_MS)
    ),
  ]);
  void result;
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: { database: 'ok', openai: 'ok' },
  });
}));

router.get('/db', asyncHandler(async (req, res) => {
  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const responseTime = Date.now() - start;

  res.json({
    status: 'ok',
    responseTime,
  });
}));

export default router;
