import prisma from '../database/client';
import { openaiService } from './openai.service';
import { locationService } from './location.service';

class AnalysisService {
  async startRoomAnalysis(roomId: string, userId: string, model?: string | null) {
    await locationService.getRoomById(roomId, userId);
    const images = await prisma.roomImage.findMany({
      where: { roomId },
      orderBy: { uploadOrder: 'asc' },
    });
    if (images.length === 0) {
      throw new Error('Aucune photo dans cette pièce');
    }
    await prisma.room.update({
      where: { id: roomId },
      data: { analysisStatus: 'processing', analysisMetadata: {} },
    });
    this.processRoomAnalysis(roomId, model).catch((err) => {
      console.error(`[Room ${roomId}] Analysis error:`, err);
      prisma.room.update({
        where: { id: roomId },
        data: {
          analysisStatus: 'error',
          analysisMetadata: { error: (err as Error).message },
        },
      });
    });
  }

  private async processRoomAnalysis(roomId: string, model?: string | null) {
    const images = await prisma.roomImage.findMany({
      where: { roomId },
      orderBy: { uploadOrder: 'asc' },
    });
    const errors: string[] = [];
    let processed = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        await prisma.room.update({
          where: { id: roomId },
          data: {
            analysisMetadata: {
              currentImage: i + 1,
              totalImages: images.length,
              processedImages: processed,
            },
          },
        });
        const items = await openaiService.analyzeImage(image.imageData, image.imageType, model);
        for (const itemData of items) {
          await prisma.roomDetectedItem.create({
            data: {
              roomId,
              roomImageId: image.id,
              category: itemData.category,
              itemName: itemData.name,
              brand: itemData.brand ?? undefined,
              model: itemData.model ?? undefined,
              condition: itemData.condition,
              estimatedAge: itemData.estimatedAge ?? undefined,
              estimatedValue: 0,
              replacementValue: 0,
              aiAnalysis: {
                description: itemData.description,
                sourceImageId: image.id,
                boundingBox: itemData.boundingBox
                  ? {
                      x: itemData.boundingBox.x,
                      y: itemData.boundingBox.y,
                      width: itemData.boundingBox.width,
                      height: itemData.boundingBox.height,
                    }
                  : undefined,
              },
            },
          });
        }
        processed++;
      } catch (err: any) {
        errors.push(`${image.fileName}: ${err.message || 'Erreur'}`);
      }
    }

    await prisma.room.update({
      where: { id: roomId },
      data: {
        analysisStatus: errors.length === images.length ? 'error' : 'completed',
        analysisMetadata: {
          processedImages: processed,
          totalImages: images.length,
          ...(errors.length > 0 && { errors }),
        },
      },
    });
  }

  async startSafeAnalysis(safeId: string, userId: string, model?: string | null) {
    await locationService.getSafeById(safeId, userId);
    const images = await prisma.safeImage.findMany({
      where: { safeId },
      orderBy: { uploadOrder: 'asc' },
    });
    if (images.length === 0) {
      throw new Error('Aucune photo dans ce coffre');
    }
    await prisma.safe.update({
      where: { id: safeId },
      data: { analysisStatus: 'processing', analysisMetadata: {} },
    });
    this.processSafeAnalysis(safeId, model).catch((err) => {
      console.error(`[Safe ${safeId}] Analysis error:`, err);
      prisma.safe.update({
        where: { id: safeId },
        data: {
          analysisStatus: 'error',
          analysisMetadata: { error: (err as Error).message },
        },
      });
    });
  }

  private async processSafeAnalysis(safeId: string, model?: string | null) {
    const images = await prisma.safeImage.findMany({
      where: { safeId },
      orderBy: { uploadOrder: 'asc' },
    });
    const errors: string[] = [];
    let processed = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        await prisma.safe.update({
          where: { id: safeId },
          data: {
            analysisMetadata: {
              currentImage: i + 1,
              totalImages: images.length,
              processedImages: processed,
            },
          },
        });
        const items = await openaiService.analyzeImage(image.imageData, image.imageType, model);
        for (const itemData of items) {
          await prisma.safeDetectedItem.create({
            data: {
              safeId,
              safeImageId: image.id,
              category: itemData.category,
              itemName: itemData.name,
              brand: itemData.brand ?? undefined,
              model: itemData.model ?? undefined,
              condition: itemData.condition,
              estimatedAge: itemData.estimatedAge ?? undefined,
              estimatedValue: 0,
              replacementValue: 0,
              aiAnalysis: {
                description: itemData.description,
                sourceImageId: image.id,
                boundingBox: itemData.boundingBox
                  ? {
                      x: itemData.boundingBox.x,
                      y: itemData.boundingBox.y,
                      width: itemData.boundingBox.width,
                      height: itemData.boundingBox.height,
                    }
                  : undefined,
              },
            },
          });
        }
        processed++;
      } catch (err: any) {
        errors.push(`${image.fileName}: ${err.message || 'Erreur'}`);
      }
    }

    await prisma.safe.update({
      where: { id: safeId },
      data: {
        analysisStatus: errors.length === images.length ? 'error' : 'completed',
        analysisMetadata: {
          processedImages: processed,
          totalImages: images.length,
          ...(errors.length > 0 && { errors }),
        },
      },
    });
  }
}

export const analysisService = new AnalysisService();
