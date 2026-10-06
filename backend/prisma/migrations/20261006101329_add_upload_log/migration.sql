-- CreateTable
CREATE TABLE "upload_log" (
    "Upload_id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "recordsAdded" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "detail" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_log_pkey" PRIMARY KEY ("Upload_id")
);

-- CreateIndex
CREATE INDEX "upload_log_uploadedAt_idx" ON "upload_log"("uploadedAt");
