-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('clothes', 'technology', 'others');

-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('xs', 's', 'm', 'l', 'xl', 'xxl');

-- CreateEnum
CREATE TYPE "ProductGender" AS ENUM ('men', 'women', 'kid');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sizes" "ProductSize"[],
    "gender" "ProductGender",
    "colors" TEXT[],
    "brand" TEXT,
    "type" TEXT,
    "created_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_title_idx" ON "products"("title");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_type_idx" ON "products"("type");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
