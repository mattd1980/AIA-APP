import { Router } from 'express';
import prisma from '../database/client';

const router = Router();

/** Liveness: process is up. No DB check. Use for basic "is the container running" probes. */
router.get('/live', async (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const HEALTH_DB_TIMEOUT_MS = 10_000; // 10s – fail fast so we don't hang

/**
 * Readiness: app + DB. Railway uses this to decide when to switch traffic.
 * Returns 503 until DB is reachable. Times out after 10s so we don't hang.
 */
router.get('/', async (req, res) => {
  try {
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), HEALTH_DB_TIMEOUT_MS)
      ),
    ]);
    void result; // used by race
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: { database: 'ok', openai: 'ok' },
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      error: 'Database unreachable',
      details: error?.message ?? 'Service indisponible',
    });
  }
});

router.get('/db', async (req, res) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    res.json({
      status: 'ok',
      responseTime,
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      error: 'Database unreachable',
    });
  }
});

export default router;
