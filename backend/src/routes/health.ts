import { Router } from 'express';
import prisma from '../database/client';

const router = Router();

/** Liveness: process is up. No DB check. Use for basic "is the container running" probes. */
router.get('/live', async (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Readiness: app + DB. Railway uses this to decide when to switch traffic.
 * Returns 503 until DB is reachable so deploy is not marked healthy until DB is up.
 */
router.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
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

    const [inventories, items, images] = await Promise.all([
      prisma.inventory.count(),
      prisma.inventoryItem.count(),
      prisma.inventoryImage.count(),
    ]);

    res.json({
      status: 'ok',
      responseTime,
      connections: {
        active: 0, // Prisma doesn't expose this easily
        idle: 0,
        max: 20,
      },
      database: {
        tables: {
          inventories,
          inventory_items: items,
          inventory_images: images,
        },
      },
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      error: error.message,
    });
  }
});

export default router;
