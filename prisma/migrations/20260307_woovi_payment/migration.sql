-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "wooviChargeId" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing orders status to PAID (default)
UPDATE "Order" SET "status" = 'PAID' WHERE "status" = 'PAID';

-- AlterTable - Change default status
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
