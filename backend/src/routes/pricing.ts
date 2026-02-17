import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { pricingService } from '../services/pricing.service';
import type { PricingInput } from '../services/pricing.service';

const router = Router();

const pricingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Trop de requêtes d\'estimation, veuillez réessayer dans une minute' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
});

router.post('/estimate', requireAuth, pricingLimiter, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Un tableau d\'objets est requis' });
    }

    if (items.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 objets par requête' });
    }

    const pricingInputs: PricingInput[] = items.map((item: Record<string, unknown>) => ({
      itemName: String(item.itemName ?? ''),
      brand: item.brand ? String(item.brand) : undefined,
      model: item.model ? String(item.model) : undefined,
      category: item.category ? String(item.category) : undefined,
    }));

    const results = await pricingService.estimatePrices(pricingInputs);

    res.json({ results });
  } catch (err) {
    console.error('[Pricing] Estimation error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'estimation des prix' });
  }
});

export default router;
