-- CreateEnum
CREATE TYPE "SubmittalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'APPROVED_AS_NOTED', 'REVISE_RESUBMIT', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubmittalType" AS ENUM ('SHOP_DRAWING', 'PRODUCT_DATA', 'SAMPLE', 'CERTIFICATE', 'TEST_REPORT', 'WARRANTY', 'OTHER');

-- CreateTable
CREATE TABLE "Submittal" (
    "id" TEXT NOT NULL,
    "submittalNo" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specSection" TEXT,
    "submittalType" "SubmittalType" NOT NULL DEFAULT 'SHOP_DRAWING',
    "discipline" "Discipline" NOT NULL,
    "status" "SubmittalStatus" NOT NULL DEFAULT 'DRAFT',
    "revision" TEXT NOT NULL DEFAULT 'Rev 0',
    "reviewComments" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Submittal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Submittal_submittalNo_key" ON "Submittal"("submittalNo");

-- CreateIndex
CREATE INDEX "Submittal_projectId_status_idx" ON "Submittal"("projectId", "status");

-- AddForeignKey
ALTER TABLE "Submittal" ADD CONSTRAINT "Submittal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submittal" ADD CONSTRAINT "Submittal_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submittal" ADD CONSTRAINT "Submittal_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
