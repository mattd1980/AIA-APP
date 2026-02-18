import prisma from '../database/client';
import type { ItemCategory, ItemCondition } from '@prisma/client';
import { AppError } from '../utils/app-error';
import type { ContainerType } from '../types/container';

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
    if (!loc) throw AppError.notFound('Location');
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
    if (!room) throw AppError.notFound('Room');
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
    if (!img) throw AppError.notFound('Image');
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
        category: data.category as ItemCategory,
        itemName: data.itemName,
        condition: data.condition as ItemCondition,
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
    if (!item) throw AppError.notFound('Item');
    return await prisma.roomDetectedItem.update({
      where: { id: itemId },
      data: {
        ...(data.itemName != null && { itemName: data.itemName }),
        ...(data.category != null && { category: data.category as ItemCategory }),
        ...(data.condition != null && { condition: data.condition as ItemCondition }),
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
    if (!item) throw AppError.notFound('Item');
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
    if (!safe) throw AppError.notFound('Safe');
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
    if (!img) throw AppError.notFound('Image');
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
        category: data.category as ItemCategory,
        itemName: data.itemName,
        condition: data.condition as ItemCondition,
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
    if (!item) throw AppError.notFound('Item');
    return await prisma.safeDetectedItem.update({
      where: { id: itemId },
      data: {
        ...(data.itemName != null && { itemName: data.itemName }),
        ...(data.category != null && { category: data.category as ItemCategory }),
        ...(data.condition != null && { condition: data.condition as ItemCondition }),
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
    if (!item) throw AppError.notFound('Item');
    await prisma.safeDetectedItem.delete({ where: { id: itemId } });
  }

  // Container dispatch methods
  getContainerById(type: ContainerType, id: string, userId: string) {
    return type === 'room' ? this.getRoomById(id, userId) : this.getSafeById(id, userId);
  }

  updateContainer(type: ContainerType, id: string, userId: string, name: string) {
    return type === 'room' ? this.updateRoom(id, userId, name) : this.updateSafe(id, userId, name);
  }

  deleteContainer(type: ContainerType, id: string, userId: string) {
    return type === 'room' ? this.deleteRoom(id, userId) : this.deleteSafe(id, userId);
  }

  saveContainerImage(type: ContainerType, id: string, userId: string, file: Express.Multer.File, uploadOrder: number) {
    return type === 'room' ? this.saveRoomImage(id, userId, file, uploadOrder) : this.saveSafeImage(id, userId, file, uploadOrder);
  }

  getContainerImageById(type: ContainerType, imageId: string, userId: string) {
    return type === 'room' ? this.getRoomImageById(imageId, userId) : this.getSafeImageById(imageId, userId);
  }

  deleteContainerImage(type: ContainerType, imageId: string, userId: string) {
    return type === 'room' ? this.deleteRoomImage(imageId, userId) : this.deleteSafeImage(imageId, userId);
  }

  createContainerManualItem(
    type: ContainerType,
    id: string,
    userId: string,
    data: { itemName: string; category: string; condition: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ) {
    return type === 'room'
      ? this.createRoomManualItem(id, userId, data)
      : this.createSafeManualItem(id, userId, data);
  }

  updateContainerItem(
    type: ContainerType,
    containerId: string,
    itemId: string,
    userId: string,
    data: { itemName?: string; category?: string; condition?: string; estimatedValue?: number; replacementValue?: number; notes?: string }
  ) {
    return type === 'room'
      ? this.updateRoomItem(containerId, itemId, userId, data)
      : this.updateSafeItem(containerId, itemId, userId, data);
  }

  deleteContainerItem(type: ContainerType, itemId: string, userId: string) {
    return type === 'room' ? this.deleteRoomItem(itemId, userId) : this.deleteSafeItem(itemId, userId);
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
