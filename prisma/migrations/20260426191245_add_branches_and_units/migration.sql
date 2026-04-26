/*
  Warnings:

  - You are about to drop the column `unidad` on the `materials` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `products` table. All the data in the column will be lost.
  - Added the required column `Sucursal` to the `materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_id` to the `materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Sucursal` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Sucursal` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "materials" DROP COLUMN "unidad",
ADD COLUMN     "Sucursal" TEXT NOT NULL,
ADD COLUMN     "unit_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "unit",
ADD COLUMN     "Sucursal" TEXT NOT NULL,
ADD COLUMN     "unit_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "Sucursal" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_Sucursal_fkey" FOREIGN KEY ("Sucursal") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_Sucursal_fkey" FOREIGN KEY ("Sucursal") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_Sucursal_fkey" FOREIGN KEY ("Sucursal") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
