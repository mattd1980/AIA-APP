import axios from 'axios';

// Use relative URL in production (same domain), or env variable if set
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Inventory = {
  id: string;
  status: 'draft' | 'processing' | 'completed' | 'error';
  totalEstimatedValue: number;
  recommendedInsuranceAmount: number;
  createdAt: string;
  itemCount?: number;
  metadata?: Record<string, any>;
};

export type InventoryItem = {
  id: string;
  category: string;
  itemName: string;
  brand?: string;
  model?: string;
  condition: string;
  estimatedAge?: number;
  estimatedValue: number;
  replacementValue: number;
  aiAnalysis?: {
    description?: string;
    confidence?: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  images?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    uploadOrder: number;
    createdAt: string;
  }>;
};

export type InventoryDetail = Inventory & {
  items: InventoryItem[];
  images: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    uploadOrder: number;
  }>;
};

export const inventoryApi = {
  create: async (files: File[]): Promise<Inventory> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<Inventory>('/api/inventories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getById: async (id: string): Promise<InventoryDetail> => {
    const response = await api.get<InventoryDetail>(`/api/inventories/${id}`);
    return response.data;
  },

  list: async (page = 1, limit = 20, status?: string): Promise<{
    data: Inventory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);

    const response = await api.get(`/api/inventories?${params}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/inventories/${id}`);
  },

  generateReport: async (id: string): Promise<Blob> => {
    const response = await api.post(
      `/api/inventories/${id}/report`,
      {},
      { responseType: 'blob' }
    );
    return response.data;
  },

  updateItem: async (
    inventoryId: string,
    itemId: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> => {
    const response = await api.patch<InventoryItem>(
      `/api/inventories/${inventoryId}/items/${itemId}`,
      updates
    );
    return response.data;
  },

  getImageUrl: (inventoryId: string, imageId: string): string => {
    return `${API_URL}/api/inventories/${inventoryId}/images/${imageId}`;
  },
};

export default api;
