import { Router } from 'express';
import { VISION_MODELS } from '../services/openai.service';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/vision-models - List vision models the user can select for image analysis
router.get('/', requireAuth, (_req, res) => {
  res.json(VISION_MODELS);
});

export default router;
