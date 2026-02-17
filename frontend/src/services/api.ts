import axios from 'axios';

// In production: use VITE_API_URL when set (frontend and backend on different origins, e.g. two Railway services).
// Otherwise same-origin (backend serves frontend, or Vite proxy in dev).
const API_URL = import.meta.env.VITE_API_URL || '';

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
    return `${API_URL}/api/inventories/${inventoryId}/images/${imageId}`;
  },
};

// Lieux (adresses / domiciles) avec pièces et coffres
export type Location = {
  id: string;
  userId: string;
  name: string;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
  rooms?: Array<{ id: string; name: string; _count?: { images: number } }>;
  safes?: Array<{ id: string; name: string; _count?: { images: number } }>;
};

export type AnalysisStatus = 'idle' | 'processing' | 'completed' | 'error';

export type RoomDetectedItem = {
  id: string;
  roomId: string;
  roomImageId?: string;
  roomAnalysisRunId?: string;
  category: string;
  itemName: string;
  brand?: string;
  model?: string;
  condition: string;
  estimatedAge?: number;
  notes?: string;
  estimatedValue: number;
  replacementValue: number;
  aiAnalysis: { description?: string; boundingBox?: { x: number; y: number; width: number; height: number }; sourceImageId?: string };
  createdAt: string;
  updatedAt: string;
};

export type SafeDetectedItem = {
  id: string;
  safeId: string;
  safeImageId?: string;
  safeAnalysisRunId?: string;
  category: string;
  itemName: string;
  brand?: string;
  model?: string;
  condition: string;
  estimatedAge?: number;
  notes?: string;
  estimatedValue: number;
  replacementValue: number;
  aiAnalysis: { description?: string; boundingBox?: { x: number; y: number; width: number; height: number }; sourceImageId?: string };
  createdAt: string;
  updatedAt: string;
};

export type RoomAnalysisRun = {
  id: string;
  modelId: string;
  status: AnalysisStatus;
  analysisMetadata: { currentImage?: number; totalImages?: number; processedImages?: number; errors?: string[] };
  createdAt: string;
  items: RoomDetectedItem[];
};

export type SafeAnalysisRun = {
  id: string;
  modelId: string;
  status: AnalysisStatus;
  analysisMetadata: { currentImage?: number; totalImages?: number; processedImages?: number; errors?: string[] };
  createdAt: string;
  items: SafeDetectedItem[];
};

export type Room = {
  id: string;
  locationId: string;
  name: string;
  analysisStatus: AnalysisStatus;
  analysisMetadata?: { currentImage?: number; totalImages?: number; processedImages?: number; errors?: string[] };
  location?: { id: string; name: string };
  images: Array<{ id: string; fileName: string; fileSize: number; uploadOrder: number; createdAt: string }>;
  items?: RoomDetectedItem[];
  analysisRuns?: RoomAnalysisRun[];
};

export type Safe = {
  id: string;
  locationId: string;
  name: string;
  analysisStatus: AnalysisStatus;
  analysisMetadata?: { currentImage?: number; totalImages?: number; processedImages?: number; errors?: string[] };
  location?: { id: string; name: string };
  images: Array<{ id: string; fileName: string; fileSize: number; uploadOrder: number; createdAt: string }>;
  items?: SafeDetectedItem[];
  analysisRuns?: SafeAnalysisRun[];
};

export const locationsApi = {
  list: async (): Promise<Location[]> => {
    const res = await api.get<Location[]>('/api/locations');
    return res.data;
  },
  create: async (data: { name: string; address?: string }): Promise<Location> => {
    const res = await api.post<Location>('/api/locations', data);
    return res.data;
  },
  getById: async (id: string): Promise<Location> => {
    const res = await api.get<Location>(`/api/locations/${id}`);
    return res.data;
  },
  update: async (id: string, data: { name?: string; address?: string }): Promise<Location> => {
    const res = await api.patch<Location>(`/api/locations/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/locations/${id}`);
  },
  addRoom: async (locationId: string, name: string) => {
    const res = await api.post(`/api/locations/${locationId}/rooms`, { name });
    return res.data;
  },
  addSafe: async (locationId: string, name: string) => {
    const res = await api.post(`/api/locations/${locationId}/safes`, { name });
    return res.data;
  },
  /** Export full inventory as CSV (addresses, rooms, items with categories) for insurer */
  exportInventoryCsv: async (): Promise<Blob> => {
    const res = await api.get('/api/export/inventory-csv', { responseType: 'blob' });
    return res.data;
  },
};

export const roomsApi = {
  getById: async (id: string): Promise<Room> => {
    const res = await api.get<Room>(`/api/rooms/${id}`);
    return res.data;
  },
  update: async (id: string, name: string): Promise<Room> => {
    const res = await api.patch<Room>(`/api/rooms/${id}`, { name });
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/rooms/${id}`);
  },
  analyze: async (roomId: string, model?: string): Promise<{ message: string; status: string }> => {
    const res = await api.post<{ message: string; status: string }>(`/api/rooms/${roomId}/analyze`, model != null ? { model } : {});
    return res.data;
  },
  addItem: async (
    roomId: string,
    data: { itemName: string; category: string; condition: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ) => {
    const res = await api.post<RoomDetectedItem>(`/api/rooms/${roomId}/items`, data);
    return res.data;
  },
  updateItem: async (
    roomId: string,
    itemId: string,
    updates: { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ): Promise<RoomDetectedItem> => {
    const res = await api.patch<RoomDetectedItem>(`/api/rooms/${roomId}/items/${itemId}`, updates);
    return res.data;
  },
  deleteItem: async (roomId: string, itemId: string): Promise<void> => {
    await api.delete(`/api/rooms/${roomId}/items/${itemId}`);
  },
  addImages: async (roomId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    const res = await api.post(`/api/rooms/${roomId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deleteImage: async (roomId: string, imageId: string): Promise<void> => {
    await api.delete(`/api/rooms/${roomId}/images/${imageId}`);
  },
  getImageUrl: (roomId: string, imageId: string): string =>
    `${API_URL}/api/rooms/${roomId}/images/${imageId}`,
  reEstimatePrices: async (roomId: string): Promise<{ updated: number }> => {
    const room = await roomsApi.getById(roomId);
    const items = room.items ?? [];
    if (items.length === 0) return { updated: 0 };
    const inputs = items.map((i) => ({
      itemName: i.itemName,
      brand: i.brand,
      model: i.model,
      category: i.category,
    }));
    const { results } = await pricingApi.estimatePrices(inputs);
    let updated = 0;
    for (let idx = 0; idx < items.length; idx++) {
      const pricing = results[idx];
      if (pricing && pricing.estimatedValue > 0) {
        await roomsApi.updateItem(roomId, items[idx].id, {
          estimatedValue: pricing.estimatedValue,
          replacementValue: pricing.replacementValue,
        });
        updated++;
      }
    }
    return { updated };
  },
};

export const safesApi = {
  getById: async (id: string): Promise<Safe> => {
    const res = await api.get<Safe>(`/api/safes/${id}`);
    return res.data;
  },
  update: async (id: string, name: string): Promise<Safe> => {
    const res = await api.patch<Safe>(`/api/safes/${id}`, { name });
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/safes/${id}`);
  },
  analyze: async (safeId: string, model?: string): Promise<{ message: string; status: string }> => {
    const res = await api.post<{ message: string; status: string }>(`/api/safes/${safeId}/analyze`, model != null ? { model } : {});
    return res.data;
  },
  addItem: async (
    safeId: string,
    data: { itemName: string; category: string; condition: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ) => {
    const res = await api.post<SafeDetectedItem>(`/api/safes/${safeId}/items`, data);
    return res.data;
  },
  updateItem: async (
    safeId: string,
    itemId: string,
    updates: { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ): Promise<SafeDetectedItem> => {
    const res = await api.patch<SafeDetectedItem>(`/api/safes/${safeId}/items/${itemId}`, updates);
    return res.data;
  },
  deleteItem: async (safeId: string, itemId: string): Promise<void> => {
    await api.delete(`/api/safes/${safeId}/items/${itemId}`);
  },
  addImages: async (safeId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    const res = await api.post(`/api/safes/${safeId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deleteImage: async (safeId: string, imageId: string): Promise<void> => {
    await api.delete(`/api/safes/${safeId}/images/${imageId}`);
  },
  getImageUrl: (safeId: string, imageId: string): string =>
    `${API_URL}/api/safes/${safeId}/images/${imageId}`,
  reEstimatePrices: async (safeId: string): Promise<{ updated: number }> => {
    const safe = await safesApi.getById(safeId);
    const items = safe.items ?? [];
    if (items.length === 0) return { updated: 0 };
    const inputs = items.map((i) => ({
      itemName: i.itemName,
      brand: i.brand,
      model: i.model,
      category: i.category,
    }));
    const { results } = await pricingApi.estimatePrices(inputs);
    let updated = 0;
    for (let idx = 0; idx < items.length; idx++) {
      const pricing = results[idx];
      if (pricing && pricing.estimatedValue > 0) {
        await safesApi.updateItem(safeId, items[idx].id, {
          estimatedValue: pricing.estimatedValue,
          replacementValue: pricing.replacementValue,
        });
        updated++;
      }
    }
    return { updated };
  },
};

export type PricingEstimateInput = {
  itemName: string;
  brand?: string;
  model?: string;
  category?: string;
};

export type PricingMetadata = {
  pricingSource: 'dataforseo' | 'none';
  medianPrice: number;
  sampleCount: number;
  searchQuery: string;
  priceRange: { min: number; max: number };
  estimatedAt: string;
};

export type PricingEstimateResult = {
  estimatedValue: number;
  replacementValue: number;
  pricingMetadata: PricingMetadata | null;
};

export const pricingApi = {
  estimatePrices: async (items: PricingEstimateInput[]): Promise<{ results: PricingEstimateResult[] }> => {
    const res = await api.post<{ results: PricingEstimateResult[] }>('/api/pricing/estimate', { items });
    return res.data;
  },
};

export type VisionModel = { id: string; label: string };

export const visionModelsApi = {
  getList: async (): Promise<VisionModel[]> => {
    const res = await api.get<VisionModel[]>('/api/vision-models');
    return res.data;
  },
};

export default api;
