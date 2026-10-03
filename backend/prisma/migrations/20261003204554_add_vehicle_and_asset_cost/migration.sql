/*
  Warnings:

  - Added the required column `assetDamageCost` to the `accident_record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleType` to the `accident_record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accident_record" ADD COLUMN     "assetDamageCost" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "vehicleType" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "diagnosis_record_visitId_idx" ON "diagnosis_record"("visitId");

-- CreateIndex
CREATE INDEX "er_visit_record_hn_idx" ON "er_visit_record"("hn");

-- CreateIndex
CREATE INDEX "er_visit_record_accidentId_idx" ON "er_visit_record"("accidentId");

-- CreateIndex
CREATE INDEX "financial_cost_visitId_idx" ON "financial_cost"("visitId");

-- CreateIndex
CREATE INDEX "prediction_result_matchedAccidentId_idx" ON "prediction_result"("matchedAccidentId");
