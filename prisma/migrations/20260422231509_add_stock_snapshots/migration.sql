-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "newStock" DOUBLE PRECISION,
ADD COLUMN     "previousStock" DOUBLE PRECISION,
ALTER COLUMN "quantity" DROP NOT NULL;
