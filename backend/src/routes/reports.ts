import { Router } from 'express';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import prisma from '../database/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../utils/app-error';

const router = Router();

// POST /api/inventories/:id/report - Generate PDF report
router.post('/:inventoryId/report', requireAuth, asyncHandler(async (req, res) => {
  const inventoryId = String(req.params.inventoryId);
  const userId = (req as AuthenticatedRequest).user!.id;

  const inventory = await prisma.inventory.findFirst({
    where: { id: inventoryId, userId },
    include: {
      items: {
        include: {
          images: {
            select: {
              id: true,
              fileName: true,
              uploadOrder: true,
            },
          },
        },
      },
      images: {
        select: {
          id: true,
          fileName: true,
          uploadOrder: true,
          imageData: true,
          imageType: true,
        },
      },
    },
  });

  if (!inventory) {
    throw AppError.notFound('Inventory');
  }

  if (inventory.status !== 'completed') {
    throw AppError.badRequest('L\'inventaire doit etre termine avant de generer le rapport');
  }

  type InventoryWithRelations = typeof inventory & {
    items: Array<{
      id: string;
      itemName: string;
      brand: string | null;
      model: string | null;
      category: string;
      condition: string;
      estimatedAge: number | null;
      replacementValue: unknown;
      aiAnalysis: unknown;
      images: Array<{
        id: string;
        fileName: string;
        uploadOrder: number;
      }>;
    }>;
    images: Array<{
      id: string;
      fileName: string;
      uploadOrder: number;
      imageData: Buffer;
      imageType: string;
    }>;
  };

  const inventoryWithRelations = inventory as InventoryWithRelations;

  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  doc.on('end', async () => {
    try {
      const pdfBuffer = Buffer.concat(chunks);

      prisma.report.create({
        data: {
          inventoryId: String(inventoryId),
          reportType: 'pdf',
          reportData: pdfBuffer,
        },
      }).catch((err) => {
        console.error('Error saving report to database:', err);
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="inventory-report-${String(inventoryId)}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error: unknown) {
      console.error('Error finalizing PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erreur lors de la generation du rapport PDF' });
      }
    }
  });

  doc.on('error', (error: Error) => {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur lors de la generation du rapport PDF' });
    }
  });

  doc.fontSize(20).text('Rapport d\'Inventaire', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Date: ${new Date(inventory.createdAt).toLocaleDateString('fr-CA')}`);
  const statusLabels: Record<string, string> = { draft: 'Brouillon', processing: 'En cours', completed: 'Termine', error: 'Erreur' };
  doc.text(`Statut: ${statusLabels[inventory.status] ?? inventory.status}`);
  doc.text(`Valeur totale estimee: $${Number(inventory.totalEstimatedValue).toFixed(2)} CAD`);
  doc.text(`Montant d'assurance recommande: $${Number(inventory.recommendedInsuranceAmount).toFixed(2)} CAD`);
  doc.moveDown();

  const drawBoundingBoxOnImage = async (imageBuffer: Buffer, boundingBox: { x: number; y: number; width: number; height: number }, imageWidth: number, imageHeight: number): Promise<Buffer> => {
    const x = Math.round(boundingBox.x * imageWidth);
    const y = Math.round(boundingBox.y * imageHeight);
    const width = Math.round(boundingBox.width * imageWidth);
    const height = Math.round(boundingBox.height * imageHeight);

    const svgOverlay = Buffer.from(`
      <svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="rgba(239, 68, 68, 0.2)" />
        <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#ef4444" stroke-width="3" />
      </svg>
    `);

    return await sharp(imageBuffer)
      .composite([{ input: svgOverlay, top: 0, left: 0 }])
      .png()
      .toBuffer();
  };

  if (inventoryWithRelations.items && inventoryWithRelations.items.length > 0) {
    doc.fontSize(16).text('Objets inventories', { underline: true });
    doc.moveDown();

    const categoryLabels: Record<string, string> = { furniture: 'Meubles', electronics: 'Electronique', clothing: 'Vetements', appliances: 'Electromenagers', decor: 'Decoration', other: 'Autre' };
    const conditionLabels: Record<string, string> = { new: 'Neuf', excellent: 'Excellent', good: 'Bon', fair: 'Passable', poor: 'Mauvais' };
    for (const [index, item] of inventoryWithRelations.items.entries()) {
      doc.fontSize(12);
      doc.text(`${index + 1}. ${item.itemName}`, { continued: false });
      if (item.brand) doc.text(`   Marque: ${item.brand}`, { indent: 20 });
      if (item.model) doc.text(`   Modele: ${item.model}`, { indent: 20 });
      doc.text(`   Categorie: ${categoryLabels[item.category] ?? item.category}`, { indent: 20 });
      doc.text(`   Etat: ${conditionLabels[item.condition] ?? item.condition}`, { indent: 20 });
      if (item.estimatedAge !== null && item.estimatedAge !== undefined) {
        doc.text(`   Age estime: ${item.estimatedAge} an(s)`, { indent: 20 });
      }
      doc.text(`   Valeur de remplacement: $${Number(item.replacementValue).toFixed(2)} CAD`, { indent: 20 });

      const analysis = item.aiAnalysis as Record<string, unknown> | null;
      if (analysis && typeof analysis === 'object' && 'description' in analysis) {
        const description = analysis.description;
        if (typeof description === 'string' && description) {
          doc.fontSize(10);
          doc.text(`   Description: ${description}`, { indent: 20 });
          doc.fontSize(12);
        }
      }

      const boundingBox = analysis && typeof analysis === 'object'
        ? (analysis as Record<string, unknown>).boundingBox as { x: number; y: number; width: number; height: number } | undefined
        : undefined;
      const sourceImageId = analysis && typeof analysis === 'object'
        ? (analysis as Record<string, unknown>).sourceImageId as string | undefined
        : undefined;

      if (boundingBox && sourceImageId) {
        const sourceImage = inventoryWithRelations.images.find((img) => img.id === sourceImageId);
        if (sourceImage) {
          try {
            doc.moveDown(0.5);
            doc.fontSize(10).text('   Image avec detection:', { indent: 20 });

            const imageMetadata = await sharp(sourceImage.imageData).metadata();
            const imageWidth = imageMetadata.width || 800;
            const imageHeight = imageMetadata.height || 600;

            const annotatedImage = await drawBoundingBoxOnImage(
              sourceImage.imageData,
              boundingBox,
              imageWidth,
              imageHeight
            );

            const maxWidth = 400;
            const scale = maxWidth / imageWidth;
            const pdfImageWidth = maxWidth;
            const pdfImageHeight = imageHeight * scale;

            doc.image(annotatedImage, undefined, undefined, {
              fit: [pdfImageWidth, pdfImageHeight],
            });

            doc.moveDown(0.5);
          } catch (imageError) {
            console.error(`Error processing image for item ${item.id}:`, imageError);
            doc.fontSize(10).text('   (Erreur lors du chargement de l\'image)', { indent: 20 });
          }
        }
      }

      doc.moveDown(1);
    }
  } else {
    doc.fontSize(12).text('Aucun objet identifie dans cet inventaire.', { align: 'center' });
  }

  doc.end();
}));

export default router;
