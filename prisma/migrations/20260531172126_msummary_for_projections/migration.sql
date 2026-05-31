-- CreateTable
CREATE TABLE "msummary" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT,
    "product_name" TEXT,
    "sales_month" DATE,
    "sales_value" INTEGER,

    CONSTRAINT "msummary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "msummary" ADD CONSTRAINT "productfk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
