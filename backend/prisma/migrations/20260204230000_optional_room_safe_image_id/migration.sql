-- AlterTable: allow manual items (no source image)
ALTER TABLE "RoomDetectedItem" ALTER COLUMN "roomImageId" DROP NOT NULL;

ALTER TABLE "SafeDetectedItem" ALTER COLUMN "safeImageId" DROP NOT NULL;
