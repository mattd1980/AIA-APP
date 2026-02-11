import prisma from '../database/client';

class LocationService {
  async listLocations(userId: string) {
    return await prisma.location.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        rooms: { select: { id: true, name: true, _count: { select: { images: true } } } },
        safes: { select: { id: true, name: true, _count: { select: { images: true } } } },
      },
    });
  }

  async createLocation(userId: string, data: { name: string; address?: string }) {
    return await prisma.location.create({
      data: {
        userId,
        name: data.name,
        address: data.address ?? null,
      },
    });
  }

  async getLocationById(locationId: string, userId: string) {
    const loc = await prisma.location.findFirst({
      where: { id: locationId, userId },
      include: {
        rooms: {
          include: { _count: { select: { images: true } } },
          orderBy: { name: 'asc' },
        },
        safes: {
          include: { _count: { select: { images: true } } },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!loc) throw new Error('Location not found');
    return loc;
  }

  async updateLocation(locationId: string, userId: string, data: { name?: string; address?: string }) {
    await this.getLocationById(locationId, userId);
    return await prisma.location.update({
      where: { id: locationId },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.address !== undefined && { address: data.address || null }),
      },
    });
  }

  async deleteLocation(locationId: string, userId: string) {
    await this.getLocationById(locationId, userId);
    await prisma.location.delete({ where: { id: locationId } });
  }

  // Rooms
  async addRoom(locationId: string, userId: string, name: string) {
    await this.getLocationById(locationId, userId);
    return await prisma.room.create({
      data: { locationId, name },
    });
  }

  async getRoomById(roomId: string, userId: string) {
    const room = await prisma.room.findFirst({
      where: { id: roomId, location: { userId } },
      include: {
        location: { select: { id: true, name: true } },
        images: { orderBy: { uploadOrder: 'asc' } },
        items: { orderBy: { createdAt: 'asc' } },
        analysisRuns: {
          orderBy: { createdAt: 'desc' },
          include: { items: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });
    if (!room) throw new Error('Room not found');
    return room;
  }

  async updateRoom(roomId: string, userId: string, name: string) {
    await this.getRoomById(roomId, userId);
    return await prisma.room.update({
      where: { id: roomId },
      data: { name },
    });
  }

  async deleteRoom(roomId: string, userId: string) {
    await this.getRoomById(roomId, userId);
    await prisma.room.delete({ where: { id: roomId } });
  }

  async saveRoomImage(roomId: string, userId: string, file: Express.Multer.File, uploadOrder: number) {
    await this.getRoomById(roomId, userId);
    return await prisma.roomImage.create({
      data: {
        roomId,
        imageData: file.buffer,
        imageType: file.mimetype,
        fileName: file.originalname,
        fileSize: file.size,
        uploadOrder,
      },
    });
  }

  async getRoomImageById(imageId: string, userId: string) {
    const img = await prisma.roomImage.findFirst({
      where: { id: imageId, room: { location: { userId } } },
    });
    if (!img) throw new Error('Image not found');
    return img;
  }

  async deleteRoomImage(imageId: string, userId: string) {
    await this.getRoomImageById(imageId, userId);
    await prisma.roomImage.delete({ where: { id: imageId } });
  }

  async createRoomManualItem(
    roomId: string,
    userId: string,
    data: { itemName: string; category: string; condition: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ) {
    await this.getRoomById(roomId, userId);
    return await prisma.roomDetectedItem.create({
      data: {
        roomId,
        roomImageId: null,
        category: data.category as any,
        itemName: data.itemName,
        condition: data.condition as any,
        estimatedValue: data.estimatedValue ?? 0,
        replacementValue: data.replacementValue ?? 0,
        notes: data.notes ?? null,
        aiAnalysis: {},
      },
    });
  }

  async updateRoomItem(
    roomId: string,
    itemId: string,
    userId: string,
    data: { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ) {
    const item = await prisma.roomDetectedItem.findFirst({
      where: { id: itemId, roomId, room: { location: { userId } } },
    });
    if (!item) throw new Error('Item not found');
    return await prisma.roomDetectedItem.update({
      where: { id: itemId },
      data: {
        ...(data.itemName != null && { itemName: data.itemName }),
        ...(data.category != null && { category: data.category as any }),
        ...(data.condition != null && { condition: data.condition as any }),
        ...(data.estimatedValue != null && { estimatedValue: data.estimatedValue }),
        ...(data.replacementValue != null && { replacementValue: data.replacementValue }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
      },
    });
  }

  async deleteRoomItem(itemId: string, userId: string) {
    const item = await prisma.roomDetectedItem.findFirst({
      where: { id: itemId, room: { location: { userId } } },
    });
    if (!item) throw new Error('Item not found');
    await prisma.roomDetectedItem.delete({ where: { id: itemId } });
  }

  // Safes
  async addSafe(locationId: string, userId: string, name: string) {
    await this.getLocationById(locationId, userId);
    return await prisma.safe.create({
      data: { locationId, name },
    });
  }

  async getSafeById(safeId: string, userId: string) {
    const safe = await prisma.safe.findFirst({
      where: { id: safeId, location: { userId } },
      include: {
        location: { select: { id: true, name: true } },
        images: { orderBy: { uploadOrder: 'asc' } },
        items: { orderBy: { createdAt: 'asc' } },
        analysisRuns: {
          orderBy: { createdAt: 'desc' },
          include: { items: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });
    if (!safe) throw new Error('Safe not found');
    return safe;
  }

  async updateSafe(safeId: string, userId: string, name: string) {
    await this.getSafeById(safeId, userId);
    return await prisma.safe.update({
      where: { id: safeId },
      data: { name },
    });
  }

  async deleteSafe(safeId: string, userId: string) {
    await this.getSafeById(safeId, userId);
    await prisma.safe.delete({ where: { id: safeId } });
  }

  async saveSafeImage(safeId: string, userId: string, file: Express.Multer.File, uploadOrder: number) {
    await this.getSafeById(safeId, userId);
    return await prisma.safeImage.create({
      data: {
        safeId,
        imageData: file.buffer,
        imageType: file.mimetype,
        fileName: file.originalname,
        fileSize: file.size,
        uploadOrder,
      },
    });
  }

  async getSafeImageById(imageId: string, userId: string) {
    const img = await prisma.safeImage.findFirst({
      where: { id: imageId, safe: { location: { userId } } },
    });
    if (!img) throw new Error('Image not found');
    return img;
  }

  async deleteSafeImage(imageId: string, userId: string) {
    await this.getSafeImageById(imageId, userId);
    await prisma.safeImage.delete({ where: { id: imageId } });
  }

  async createSafeManualItem(
    safeId: string,
    userId: string,
    data: { itemName: string; category: string; condition: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ) {
    await this.getSafeById(safeId, userId);
    return await prisma.safeDetectedItem.create({
      data: {
        safeId,
        safeImageId: null,
        category: data.category as any,
        itemName: data.itemName,
        condition: data.condition as any,
        estimatedValue: data.estimatedValue ?? 0,
        replacementValue: data.replacementValue ?? 0,
        notes: data.notes ?? null,
        aiAnalysis: {},
      },
    });
  }

  async updateSafeItem(
    safeId: string,
    itemId: string,
    userId: string,
    data: { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ) {
    const item = await prisma.safeDetectedItem.findFirst({
      where: { id: itemId, safeId, safe: { location: { userId } } },
    });
    if (!item) throw new Error('Item not found');
    return await prisma.safeDetectedItem.update({
      where: { id: itemId },
      data: {
        ...(data.itemName != null && { itemName: data.itemName }),
        ...(data.category != null && { category: data.category as any }),
        ...(data.condition != null && { condition: data.condition as any }),
        ...(data.estimatedValue != null && { estimatedValue: data.estimatedValue }),
        ...(data.replacementValue != null && { replacementValue: data.replacementValue }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
      },
    });
  }

  async deleteSafeItem(itemId: string, userId: string) {
    const item = await prisma.safeDetectedItem.findFirst({
      where: { id: itemId, safe: { location: { userId } } },
    });
    if (!item) throw new Error('Item not found');
    await prisma.safeDetectedItem.delete({ where: { id: itemId } });
  }

  /** All locations with rooms, safes, and their items for CSV export */
  async getExportData(userId: string) {
    return await prisma.location.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        rooms: {
          orderBy: { name: 'asc' },
          include: {
            items: { orderBy: { createdAt: 'asc' } },
          },
        },
        safes: {
          orderBy: { name: 'asc' },
          include: {
            items: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });
  }
}

export const locationService = new LocationService();
