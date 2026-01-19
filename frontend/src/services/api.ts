import axios from 'axios';

// In production we prefer same-origin calls (no CORS) and let the frontend server proxy `/api/*`
// to the backend. In dev we still hit localhost backend directly.
const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

export type Inventory = {
  id: string;
  name?: string;
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
  notes?: string;
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
  create: async (files: File[], name?: string): Promise<Inventory> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    if (name) {
      formData.append('name', name);
    }

    const response = await api.post<Inventory>('/api/inventories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, updates: { name?: string }): Promise<Inventory> => {
    const response = await api.patch<Inventory>(`/api/inventories/${id}`, updates);
    return response.data;
  },

  addImages: async (id: string, files: File[]): Promise<{ message: string }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await api.post<{ message: string }>(`/api/inventories/${id}/images`, formData, {
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

  deleteItem: async (inventoryId: string, itemId: string): Promise<void> => {
    await api.delete(`/api/inventories/${inventoryId}/items/${itemId}`);
  },

  getImageUrl: (inventoryId: string, imageId: string): string => {
    // If API_URL is empty (prod), this becomes a same-origin relative URL.
    return `${API_URL}/api/inventories/${inventoryId}/images/${imageId}`;
  },
};

export default api;
