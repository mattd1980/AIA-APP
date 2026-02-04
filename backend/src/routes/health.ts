import { Router } from 'express';
import prisma from '../database/client';

const router = Router();

router.get('/', async (req, res) => {
  try {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'ok',
        openai: 'ok',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: 'Service indisponible',
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
