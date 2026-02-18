import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { pricingService } from '../services/pricing.service';
import type { PricingInput } from '../services/pricing.service';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';

const router = Router();

const pricingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Trop de requetes d\'estimation, veuillez reessayer dans une minute' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
});

router.post('/estimate', requireAuth, pricingLimiter, asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw AppError.badRequest('Un tableau d\'objets est requis');
  }

  if (items.length > 50) {
    throw AppError.badRequest('Maximum 50 objets par requete');
  }

  const pricingInputs: PricingInput[] = items.map((item: Record<string, unknown>) => ({
    itemName: String(item.itemName ?? ''),
    brand: item.brand ? String(item.brand) : undefined,
    model: item.model ? String(item.model) : undefined,
    category: item.category ? String(item.category) : undefined,
  }));

  const results = await pricingService.estimatePrices(pricingInputs);

  res.json({ results });
}));

export default router;
