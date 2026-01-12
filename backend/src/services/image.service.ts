import prisma from '../database/client';

class ImageService {
  async saveImage(inventoryId: string, file: Express.Multer.File, uploadOrder: number) {
    return await prisma.inventoryImage.create({
      data: {
        inventoryId,
        imageData: file.buffer,
        imageType: file.mimetype,
        fileName: file.originalname,
        fileSize: file.size,
        uploadOrder,
      },
    });
  }

  async getImageById(id: string) {
    return await prisma.inventoryImage.findUnique({
      where: { id },
    });
  }
}

export const imageService = new ImageService();
