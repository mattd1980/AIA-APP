-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('draft', 'processing', 'completed', 'error');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('furniture', 'electronics', 'clothing', 'appliances', 'decor', 'other');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('new', 'excellent', 'good', 'fair', 'poor');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('pdf', 'json', 'csv');

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'draft',
    "totalEstimatedValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "recommendedInsuranceAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "itemName" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "condition" "ItemCondition" NOT NULL,
    "estimatedAge" INTEGER,
    "estimatedValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "replacementValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "aiAnalysis" JSONB NOT NULL DEFAULT '{}',
    "priceData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryImage" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "itemId" TEXT,
    "imageData" BYTEA NOT NULL,
    "imageType" VARCHAR(50) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL DEFAULT 'pdf',
    "reportData" BYTEA NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inventory_status_idx" ON "Inventory"("status");

-- CreateIndex
CREATE INDEX "Inventory_createdAt_idx" ON "Inventory"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "InventoryItem_inventoryId_idx" ON "InventoryItem"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");

-- CreateIndex
CREATE INDEX "InventoryImage_inventoryId_idx" ON "InventoryImage"("inventoryId");

-- CreateIndex
CREATE INDEX "InventoryImage_itemId_idx" ON "InventoryImage"("itemId");

-- CreateIndex
CREATE INDEX "Report_inventoryId_idx" ON "Report"("inventoryId");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryImage" ADD CONSTRAINT "InventoryImage_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryImage" ADD CONSTRAINT "InventoryImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
