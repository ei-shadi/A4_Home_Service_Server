/*
  Warnings:

  - You are about to drop the column `title` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category_id,name]` on the table `services` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "services_category_id_title_key";

-- AlterTable
ALTER TABLE "services" DROP COLUMN "title",
ADD COLUMN     "name" VARCHAR(200) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "services_category_id_name_key" ON "services"("category_id", "name");
