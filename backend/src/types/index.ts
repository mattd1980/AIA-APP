export type InventoryStatus = 'draft' | 'processing' | 'completed' | 'error';
export type ItemCategory = 'furniture' | 'electronics' | 'clothing' | 'appliances' | 'decor' | 'other';
export type ItemCondition = 'new' | 'excellent' | 'good' | 'fair' | 'poor';
export type ReportType = 'pdf' | 'json' | 'csv';

export interface CreateInventoryDto {
  images: Express.Multer.File[];
}

export interface UpdateInventoryDto {
  status?: InventoryStatus;
  metadata?: Record<string, any>;
}

export interface InventoryResponse {
  id: string;
  status: InventoryStatus;
  totalEstimatedValue: number;
  recommendedInsuranceAmount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  items?: InventoryItemResponse[];
  images?: InventoryImageResponse[];
}

export interface InventoryItemResponse {
  id: string;
  category: ItemCategory;
  itemName: string;
  brand?: string;
  model?: string;
  condition: ItemCondition;
  estimatedAge?: number;
  notes?: string;
  estimatedValue: number;
  replacementValue: number;
  aiAnalysis: Record<string, any>;
  priceData: Record<string, any>;
}

export interface InventoryImageResponse {
  id: string;
  fileName: string;
  fileSize: number;
  uploadOrder: number;
  createdAt: Date;
}

export interface BoundingBox {
  x: number; // Normalized x coordinate (0-1)
  y: number; // Normalized y coordinate (0-1)
  width: number; // Normalized width (0-1)
  height: number; // Normalized height (0-1)
}

export interface OpenAIItem {
  name: string;
  category: ItemCategory;
  brand?: string;
  model?: string;
  condition: ItemCondition;
  estimatedAge?: number;
  description: string;
  boundingBox?: BoundingBox; // Normalized coordinates (0-1 range)
}
