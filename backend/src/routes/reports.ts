import { Router } from 'express';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import prisma from '../database/client';

const router = Router();

// POST /api/inventories/:id/report - Generate PDF report
router.post('/:inventoryId/report', async (req, res) => {
  try {
    const { inventoryId } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
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
      return res.status(404).json({ error: 'Inventory not found' });
    }

    if (inventory.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Inventory must be completed before generating report' 
      });
    }

    // Generate PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        
        // Save report to database (don't wait for it to complete before sending)
        prisma.report.create({
          data: {
            inventoryId,
            reportType: 'pdf',
            reportData: pdfBuffer,
          },
        }).catch((err) => {
          console.error('Error saving report to database:', err);
          // Don't fail the request if saving fails
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="inventory-report-${inventoryId}.pdf"`
        );
        res.send(pdfBuffer);
      } catch (error: any) {
        console.error('Error finalizing PDF:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error generating PDF report' });
        }
      }
    });
    
    doc.on('error', (error: Error) => {
      console.error('PDF generation error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error generating PDF report' });
      }
    });

    // PDF Content
    doc.fontSize(20).text('Rapport d\'Inventaire', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12);
    doc.text(`Date: ${new Date(inventory.createdAt).toLocaleDateString('fr-CA')}`);
    doc.text(`Statut: ${inventory.status}`);
    doc.text(`Valeur totale estimée: $${Number(inventory.totalEstimatedValue).toFixed(2)} CAD`);
    doc.text(`Montant d'assurance recommandé: $${Number(inventory.recommendedInsuranceAmount).toFixed(2)} CAD`);
    doc.moveDown();

    // Helper function to draw bounding box on image
    const drawBoundingBoxOnImage = async (imageBuffer: Buffer, boundingBox: any, imageWidth: number, imageHeight: number): Promise<Buffer> => {
      const x = Math.round(boundingBox.x * imageWidth);
      const y = Math.round(boundingBox.y * imageHeight);
      const width = Math.round(boundingBox.width * imageWidth);
      const height = Math.round(boundingBox.height * imageHeight);
      
      // Create SVG overlay with bounding box
      const svgOverlay = Buffer.from(`
        <svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
          <!-- Semi-transparent red fill -->
          <rect 
            x="${x}" 
            y="${y}" 
            width="${width}" 
            height="${height}"
            fill="rgba(239, 68, 68, 0.2)"
          />
          <!-- Red border -->
          <rect 
            x="${x}" 
            y="${y}" 
            width="${width}" 
            height="${height}"
            fill="none"
            stroke="#ef4444"
            stroke-width="3"
          />
        </svg>
      `);

      return await sharp(imageBuffer)
        .composite([
          {
            input: svgOverlay,
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer();
    };

    // Items
    if (inventory.items && inventory.items.length > 0) {
      doc.fontSize(16).text('Items Inventoriés', { underline: true });
      doc.moveDown();

      for (const [index, item] of inventory.items.entries()) {
        doc.fontSize(12);
        doc.text(`${index + 1}. ${item.itemName}`, { continued: false });
        if (item.brand) doc.text(`   Marque: ${item.brand}`, { indent: 20 });
        if (item.model) doc.text(`   Modèle: ${item.model}`, { indent: 20 });
        doc.text(`   Catégorie: ${item.category}`, { indent: 20 });
        doc.text(`   État: ${item.condition}`, { indent: 20 });
        if (item.estimatedAge !== null && item.estimatedAge !== undefined) {
          doc.text(`   Âge estimé: ${item.estimatedAge} an(s)`, { indent: 20 });
        }
        doc.text(`   Valeur de remplacement: $${Number(item.replacementValue).toFixed(2)} CAD`, { indent: 20 });
        
        // Add AI description if available
        if (item.aiAnalysis && typeof item.aiAnalysis === 'object' && 'description' in item.aiAnalysis) {
          const description = (item.aiAnalysis as any).description;
          if (description) {
            doc.fontSize(10);
            doc.text(`   Description: ${description}`, { indent: 20 });
            doc.fontSize(12);
          }
        }

        // Add image with bounding box if available
        const aiAnalysis = item.aiAnalysis as any;
        if (aiAnalysis?.boundingBox && aiAnalysis?.sourceImageId) {
          const sourceImage = inventory.images.find(img => img.id === aiAnalysis.sourceImageId);
          if (sourceImage) {
            try {
              doc.moveDown(0.5);
              doc.fontSize(10).text('   Image avec détection:', { indent: 20 });
              
              // Get image dimensions
              const imageMetadata = await sharp(sourceImage.imageData).metadata();
              const imageWidth = imageMetadata.width || 800;
              const imageHeight = imageMetadata.height || 600;
              
              // Draw bounding box on image
              const annotatedImage = await drawBoundingBoxOnImage(
                sourceImage.imageData,
                aiAnalysis.boundingBox,
                imageWidth,
                imageHeight
              );
              
              // Embed image in PDF (max width 400, maintain aspect ratio)
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
      doc.fontSize(12).text('Aucun item identifié dans cet inventaire.', { align: 'center' });
    }

    doc.end();
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
