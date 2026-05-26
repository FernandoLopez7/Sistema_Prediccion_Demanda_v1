-- AlterTable
ALTER TABLE "products" ADD COLUMN     "family_id" TEXT;

-- CreateTable
CREATE TABLE "families" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;
