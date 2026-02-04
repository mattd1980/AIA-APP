-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" VARCHAR(255),
ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Set existing admin user (admin@local) as admin
UPDATE "User" SET "isAdmin" = true WHERE "email" = 'admin@local';
