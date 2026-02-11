-- CreateTable
CREATE TABLE "RoomAnalysisRun" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "modelId" VARCHAR(50) NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'processing',
    "analysisMetadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomAnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafeAnalysisRun" (
    "id" TEXT NOT NULL,
    "safeId" TEXT NOT NULL,
    "modelId" VARCHAR(50) NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'processing',
    "analysisMetadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafeAnalysisRun_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "RoomDetectedItem" ADD COLUMN "roomAnalysisRunId" TEXT;

-- AlterTable
ALTER TABLE "SafeDetectedItem" ADD COLUMN "safeAnalysisRunId" TEXT;

-- CreateIndex
CREATE INDEX "RoomAnalysisRun_roomId_idx" ON "RoomAnalysisRun"("roomId");

-- CreateIndex
CREATE INDEX "RoomAnalysisRun_createdAt_idx" ON "RoomAnalysisRun"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "SafeAnalysisRun_safeId_idx" ON "SafeAnalysisRun"("safeId");

-- CreateIndex
CREATE INDEX "SafeAnalysisRun_createdAt_idx" ON "SafeAnalysisRun"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "RoomDetectedItem_roomAnalysisRunId_idx" ON "RoomDetectedItem"("roomAnalysisRunId");

-- CreateIndex
CREATE INDEX "SafeDetectedItem_safeAnalysisRunId_idx" ON "SafeDetectedItem"("safeAnalysisRunId");

-- AddForeignKey
ALTER TABLE "RoomAnalysisRun" ADD CONSTRAINT "RoomAnalysisRun_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomDetectedItem" ADD CONSTRAINT "RoomDetectedItem_roomAnalysisRunId_fkey" FOREIGN KEY ("roomAnalysisRunId") REFERENCES "RoomAnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeAnalysisRun" ADD CONSTRAINT "SafeAnalysisRun_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafeDetectedItem" ADD CONSTRAINT "SafeDetectedItem_safeAnalysisRunId_fkey" FOREIGN KEY ("safeAnalysisRunId") REFERENCES "SafeAnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
