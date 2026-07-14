/*
  Warnings:

  - A unique constraint covering the columns `[stripe_session_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "stripe_session_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_session_id_key" ON "payments"("stripe_session_id");
