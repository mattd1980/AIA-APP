import prisma from '../database/client';
import { Prisma } from '@prisma/client';
import { openaiService } from './openai.service';
import { geminiService } from './gemini.service';
import { locationService } from './location.service';
import { pricingService } from './pricing.service';
import type { PricingInput } from './pricing.service';
import { AppError } from '../utils/app-error';
import { getErrorMessage } from '../utils/get-error-message';
import type { ContainerType } from '../types/container';

function isGeminiModel(modelId: string): boolean {
  return modelId.startsWith('gemini-');
}

class AnalysisService {
  async startRoomAnalysis(roomId: string, userId: string, model?: string | null) {
    await locationService.getRoomById(roomId, userId);
    const images = await prisma.roomImage.findMany({
      where: { roomId },
      orderBy: { uploadOrder: 'asc' },
    });
    if (images.length === 0) {
      throw AppError.badRequest('Aucune photo dans cette piece');
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
    const createdItemIds: { id: string; input: PricingInput; aiAnalysis: Prisma.InputJsonObject }[] = [];

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
        const items = isGeminiModel(model || '')
          ? await geminiService.analyzeImage(imageBuffer, image.imageType, model)
          : await openaiService.analyzeImage(imageBuffer, image.imageType, model);
        for (const itemData of items) {
          const aiAnalysis: Prisma.InputJsonObject = {
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
          };
          const created = await prisma.roomDetectedItem.create({
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
              aiAnalysis,
            },
          });
          createdItemIds.push({
            id: created.id,
            input: {
              itemName: itemData.name,
              brand: itemData.brand ?? undefined,
              model: itemData.model ?? undefined,
              category: itemData.category,
            },
            aiAnalysis,
          });
        }
        processed++;
      } catch (err: unknown) {
        errors.push(`${image.fileName}: ${getErrorMessage(err, 'Erreur')}`);
      }
    }

    // Price all detected items (non-fatal)
    try {
      if (createdItemIds.length > 0) {
        const pricingResults = await pricingService.estimatePrices(
          createdItemIds.map((item) => item.input)
        );
        for (let i = 0; i < createdItemIds.length; i++) {
          const pricing = pricingResults[i];
          if (pricing && (pricing.estimatedValue > 0 || pricing.pricingMetadata)) {
            await prisma.roomDetectedItem.update({
              where: { id: createdItemIds[i].id },
              data: {
                estimatedValue: pricing.estimatedValue,
                replacementValue: pricing.replacementValue,
                aiAnalysis: {
                  ...createdItemIds[i].aiAnalysis,
                  ...(pricing.pricingMetadata
                    ? { pricing: pricing.pricingMetadata as unknown as Prisma.InputJsonObject }
                    : {}),
                } as Prisma.InputJsonObject,
              },
            });
          }
        }
      }
    } catch (pricingErr) {
      console.warn(`[Room ${roomId}] Pricing failed (non-fatal):`, (pricingErr as Error).message);
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
      throw AppError.badRequest('Aucune photo dans ce coffre');
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
    const createdItemIds: { id: string; input: PricingInput; aiAnalysis: Prisma.InputJsonObject }[] = [];

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
        const items = isGeminiModel(model || '')
          ? await geminiService.analyzeImage(imageBuffer, image.imageType, model)
          : await openaiService.analyzeImage(imageBuffer, image.imageType, model);
        for (const itemData of items) {
          const aiAnalysis: Prisma.InputJsonObject = {
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
          };
          const created = await prisma.safeDetectedItem.create({
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
              aiAnalysis,
            },
          });
          createdItemIds.push({
            id: created.id,
            input: {
              itemName: itemData.name,
              brand: itemData.brand ?? undefined,
              model: itemData.model ?? undefined,
              category: itemData.category,
            },
            aiAnalysis,
          });
        }
        processed++;
      } catch (err: unknown) {
        errors.push(`${image.fileName}: ${getErrorMessage(err, 'Erreur')}`);
      }
    }

    // Price all detected items (non-fatal)
    try {
      if (createdItemIds.length > 0) {
        const pricingResults = await pricingService.estimatePrices(
          createdItemIds.map((item) => item.input)
        );
        for (let i = 0; i < createdItemIds.length; i++) {
          const pricing = pricingResults[i];
          if (pricing && (pricing.estimatedValue > 0 || pricing.pricingMetadata)) {
            await prisma.safeDetectedItem.update({
              where: { id: createdItemIds[i].id },
              data: {
                estimatedValue: pricing.estimatedValue,
                replacementValue: pricing.replacementValue,
                aiAnalysis: {
                  ...createdItemIds[i].aiAnalysis,
                  ...(pricing.pricingMetadata
                    ? { pricing: pricing.pricingMetadata as unknown as Prisma.InputJsonObject }
                    : {}),
                } as Prisma.InputJsonObject,
              },
            });
          }
        }
      }
    } catch (pricingErr) {
      console.warn(`[Safe ${safeId}] Pricing failed (non-fatal):`, (pricingErr as Error).message);
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
  startContainerAnalysis(type: ContainerType, containerId: string, userId: string, model?: string | null) {
    return type === 'room'
      ? this.startRoomAnalysis(containerId, userId, model)
      : this.startSafeAnalysis(containerId, userId, model);
  }
}

export const analysisService = new AnalysisService();
