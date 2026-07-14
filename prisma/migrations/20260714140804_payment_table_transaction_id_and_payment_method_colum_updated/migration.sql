-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "transaction_id" DROP NOT NULL,
ALTER COLUMN "payment_method" DROP NOT NULL;
