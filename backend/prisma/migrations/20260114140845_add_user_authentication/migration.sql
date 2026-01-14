-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "googleId" TEXT,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- Create a default system user for existing inventories
INSERT INTO "User" ("id", "email", "name", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000000', 'system@migration.local', 'System Migration User', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- AlterTable - Add userId as nullable first
ALTER TABLE "Inventory" ADD COLUMN "userId" TEXT;

-- Update existing inventories to use the system user
UPDATE "Inventory" SET "userId" = '00000000-0000-0000-0000-000000000000' WHERE "userId" IS NULL;

-- Now make userId required
ALTER TABLE "Inventory" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Inventory_userId_idx" ON "Inventory"("userId");
