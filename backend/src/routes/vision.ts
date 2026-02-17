import { Router } from 'express';
import { VISION_MODELS } from '../services/openai.service';
import { GEMINI_MODELS } from '../services/gemini.service';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/vision-models - List vision models the user can select for image analysis
router.get('/', requireAuth, (_req, res) => {
  const models = process.env.GEMINI_API_KEY
    ? [...VISION_MODELS, ...GEMINI_MODELS]
    : [...VISION_MODELS];
  res.json(models);
});

export default router;
