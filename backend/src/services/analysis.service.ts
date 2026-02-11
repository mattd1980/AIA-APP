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
    const modelId = model && model.trim() ? model.trim() : 'gpt-5.2';
    const run = await prisma.roomAnalysisRun.create({
      data: {
        roomId,
        modelId,
        status: 'processing',
        analysisMetadata: {},
      },
    });
    await prisma.room.update({
      where: { id: roomId },
      data: { analysisStatus: 'processing', analysisMetadata: {} },
    });
    this.processRoomAnalysis(roomId, model, run.id).catch(async (err) => {
      console.error(`[Room ${roomId}] Analysis error:`, err);
      await prisma.roomAnalysisRun.update({
        where: { id: run.id },
        data: { status: 'error', analysisMetadata: { error: (err as Error).message } },
      });
      await prisma.room.update({
        where: { id: roomId },
        data: {
          analysisStatus: 'error',
          analysisMetadata: { error: (err as Error).message },
        },
      });
    });
  }

  private async processRoomAnalysis(roomId: string, model: string | null | undefined, runId: string) {
    const images = await prisma.roomImage.findMany({
      where: { roomId },
      orderBy: { uploadOrder: 'asc' },
    });
    const errors: string[] = [];
    let processed = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        await prisma.roomAnalysisRun.update({
          where: { id: runId },
          data: {
            analysisMetadata: {
              currentImage: i + 1,
              totalImages: images.length,
              processedImages: processed,
            },
          },
        });
        const imageBuffer = Buffer.from(image.imageData);
        const items = await openaiService.analyzeImage(imageBuffer, image.imageType, model);
        for (const itemData of items) {
          await prisma.roomDetectedItem.create({
            data: {
              roomId,
              roomAnalysisRunId: runId,
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

    const runStatus = errors.length === images.length ? 'error' : 'completed';
    await prisma.roomAnalysisRun.update({
      where: { id: runId },
      data: {
        status: runStatus,
        analysisMetadata: {
          processedImages: processed,
          totalImages: images.length,
          ...(errors.length > 0 && { errors }),
        },
      },
    });
    await prisma.room.update({
      where: { id: roomId },
      data: {
        analysisStatus: runStatus,
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
    const modelId = model && model.trim() ? model.trim() : 'gpt-5.2';
    const run = await prisma.safeAnalysisRun.create({
      data: {
        safeId,
        modelId,
        status: 'processing',
        analysisMetadata: {},
      },
    });
    await prisma.safe.update({
      where: { id: safeId },
      data: { analysisStatus: 'processing', analysisMetadata: {} },
    });
    this.processSafeAnalysis(safeId, model, run.id).catch(async (err) => {
      console.error(`[Safe ${safeId}] Analysis error:`, err);
      await prisma.safeAnalysisRun.update({
        where: { id: run.id },
        data: { status: 'error', analysisMetadata: { error: (err as Error).message } },
      });
      await prisma.safe.update({
        where: { id: safeId },
        data: {
          analysisStatus: 'error',
          analysisMetadata: { error: (err as Error).message },
        },
      });
    });
  }

  private async processSafeAnalysis(safeId: string, model: string | null | undefined, runId: string) {
    const images = await prisma.safeImage.findMany({
      where: { safeId },
      orderBy: { uploadOrder: 'asc' },
    });
    const errors: string[] = [];
    let processed = 0;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        await prisma.safeAnalysisRun.update({
          where: { id: runId },
          data: {
            analysisMetadata: {
              currentImage: i + 1,
              totalImages: images.length,
              processedImages: processed,
            },
          },
        });
        const imageBuffer = Buffer.from(image.imageData);
        const items = await openaiService.analyzeImage(imageBuffer, image.imageType, model);
        for (const itemData of items) {
          await prisma.safeDetectedItem.create({
            data: {
              safeId,
              safeAnalysisRunId: runId,
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

    const runStatus = errors.length === images.length ? 'error' : 'completed';
    await prisma.safeAnalysisRun.update({
      where: { id: runId },
      data: {
        status: runStatus,
        analysisMetadata: {
          processedImages: processed,
          totalImages: images.length,
          ...(errors.length > 0 && { errors }),
        },
      },
    });
    await prisma.safe.update({
      where: { id: safeId },
      data: {
        analysisStatus: runStatus,
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
