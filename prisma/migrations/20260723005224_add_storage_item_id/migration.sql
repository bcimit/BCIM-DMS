-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "storageItemId" TEXT;

-- AlterTable
ALTER TABLE "DocumentVersion" ADD COLUMN     "storageItemId" TEXT;
