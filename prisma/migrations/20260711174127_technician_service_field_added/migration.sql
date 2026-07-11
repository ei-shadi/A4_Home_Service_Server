/*
  Warnings:

  - You are about to drop the column `service_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `technician_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_duration` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_type` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `service_image` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `technician_id` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category_id,title]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `technician_service_id` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_service_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_technician_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_technician_id_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "service_id",
DROP COLUMN "technician_id",
ADD COLUMN     "technician_service_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "estimated_duration",
DROP COLUMN "price",
DROP COLUMN "pricing_type",
DROP COLUMN "service_image",
DROP COLUMN "technician_id";

-- CreateTable
CREATE TABLE "technician_services" (
    "id" UUID NOT NULL,
    "technician_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "pricing_type" "PricingType" NOT NULL,
    "estimatedDuration" SMALLINT NOT NULL,
    "service_image" VARCHAR(500),
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technician_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "technician_services_technician_id_service_id_key" ON "technician_services"("technician_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "services_category_id_title_key" ON "services"("category_id", "title");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_technician_service_id_fkey" FOREIGN KEY ("technician_service_id") REFERENCES "technician_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_services" ADD CONSTRAINT "technician_services_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technician_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_services" ADD CONSTRAINT "technician_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
