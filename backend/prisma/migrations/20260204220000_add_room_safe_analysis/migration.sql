-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('idle', 'processing', 'completed', 'error');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN "analysisStatus" "AnalysisStatus" NOT NULL DEFAULT 'idle',
ADD COLUMN "analysisMetadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Safe" ADD COLUMN "analysisStatus" "AnalysisStatus" NOT NULL DEFAULT 'idle',
ADD COLUMN "analysisMetadata" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "RoomDetectedItem" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomImageId" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "itemName" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "condition" "ItemCondition" NOT NULL,
    "estimatedAge" INTEGER,
    "notes" TEXT,
    "estimatedValue" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "replacementValue" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "aiAnalysis" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomDetectedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafeDetectedItem" (
    "id" TEXT NOT NULL,
    "safeId" TEXT NOT NULL,
    "safeImageId" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "itemName" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "condition" "ItemCondition" NOT NULL,
    "estimatedAge" INTEGER,
    "notes" TEXT,
    "estimatedValue" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "replacementValue" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "aiAnalysis" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafeDetectedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomDetectedItem_roomId_idx" ON "RoomDetectedItem"("roomId");

-- CreateIndex
CREATE INDEX "RoomDetectedItem_roomImageId_idx" ON "RoomDetectedItem"("roomImageId");

-- CreateIndex
CREATE INDEX "SafeDetectedItem_safeId_idx" ON "SafeDetectedItem"("safeId");

-- CreateIndex
CREATE INDEX "SafeDetectedItem_safeImageId_idx" ON "SafeDetectedItem"("safeImageId");

-- AddForeignKey
ALTER TABLE "RoomDetectedItem" ADD CONSTRAINT "RoomDetectedItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDetectedItem" ADD CONSTRAINT "RoomDetectedItem_roomImageId_fkey" FOREIGN KEY ("roomImageId") REFERENCES "RoomImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeDetectedItem" ADD CONSTRAINT "SafeDetectedItem_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeDetectedItem" ADD CONSTRAINT "SafeDetectedItem_safeImageId_fkey" FOREIGN KEY ("safeImageId") REFERENCES "SafeImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
