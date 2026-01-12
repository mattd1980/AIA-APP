import { Router } from 'express';
import multer from 'multer';
import { inventoryService } from '../services/inventory.service';
import { imageService } from '../services/image.service';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/inventories - Create inventory with images
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const inventory = await inventoryService.createInventory();
    
    // Save images
    for (let i = 0; i < files.length; i++) {
      await imageService.saveImage(inventory.id, files[i], i);
    }

    // Start processing
    await inventoryService.startProcessing(inventory.id);

    res.status(201).json({
      id: inventory.id,
      status: inventory.status,
      createdAt: inventory.createdAt,
      message: 'Inventory created, processing started',
    });
  } catch (error: any) {
    console.error('Error creating inventory:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/inventories/:id - Get inventory by ID
router.get('/:id', async (req, res) => {
  try {
    const inventory = await inventoryService.getInventoryById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.json(inventory);
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/inventories - List all inventories
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;

    const result = await inventoryService.listInventories(page, limit, status);
    res.json(result);
  } catch (error: any) {
    console.error('Error listing inventories:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/inventories/:id/images/:imageId - Get image
router.get('/:id/images/:imageId', async (req, res) => {
  try {
    const image = await imageService.getImageById(req.params.imageId);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Verify image belongs to this inventory
    if (image.inventoryId !== req.params.id) {
      return res.status(403).json({ error: 'Image does not belong to this inventory' });
    }

    res.setHeader('Content-Type', image.imageType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(image.imageData);
  } catch (error: any) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PATCH /api/inventories/:id/items/:itemId - Update inventory item
router.patch('/:id/items/:itemId', async (req, res) => {
  try {
    const updatedItem = await inventoryService.updateItem(
      req.params.id,
      req.params.itemId,
      req.body
    );
    res.json(updatedItem);
  } catch (error: any) {
    if (error.message === 'Inventory not found' || error.message === 'Item not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error updating item:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE /api/inventories/:id - Delete inventory
router.delete('/:id', async (req, res) => {
  try {
    await inventoryService.deleteInventory(req.params.id);
    res.json({ message: 'Inventory deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Inventory not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error deleting inventory:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
