/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "patient_demographics" (
    "HN" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,

    CONSTRAINT "patient_demographics_pkey" PRIMARY KEY ("HN")
);

-- CreateTable
CREATE TABLE "accident_record" (
    "Accident_id" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "accidentDateTime" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "roadName" TEXT NOT NULL,
    "subDistrict" TEXT NOT NULL,
    "weatherCondition" TEXT NOT NULL,
    "roadSurfaceCondition" TEXT NOT NULL,
    "lightingCondition" TEXT NOT NULL,
    "vehiclesInvolvedCount" INTEGER NOT NULL,
    "casualtiesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "accident_record_pkey" PRIMARY KEY ("Accident_id")
);

-- CreateTable
CREATE TABLE "er_visit_record" (
    "Visit_id" TEXT NOT NULL,
    "hn" TEXT NOT NULL,
    "accidentId" TEXT NOT NULL,
    "incidentDateTime" TIMESTAMP(3) NOT NULL,
    "arrivalDateTime" TIMESTAMP(3) NOT NULL,
    "transportMode" TEXT NOT NULL,
    "roleInAccident" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "triageLevel" TEXT NOT NULL,
    "gcsScore" INTEGER NOT NULL,
    "riskBehavior" INTEGER NOT NULL,
    "outcomeStatus" TEXT NOT NULL,
    "losErMinutes" INTEGER NOT NULL,

    CONSTRAINT "er_visit_record_pkey" PRIMARY KEY ("Visit_id")
);

-- CreateTable
CREATE TABLE "diagnosis_record" (
    "Diagnosis_id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "icd10Code" TEXT NOT NULL,
    "injuryType" TEXT NOT NULL,
    "affectedOrgan" TEXT NOT NULL,
    "severityScore" INTEGER NOT NULL,

    CONSTRAINT "diagnosis_record_pkey" PRIMARY KEY ("Diagnosis_id")
);

-- CreateTable
CREATE TABLE "financial_cost" (
    "Financial_id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "totalMedicalCost" DECIMAL(12,2) NOT NULL,
    "costOfInactionValue" DECIMAL(12,2) NOT NULL,
    "paymentRights" TEXT NOT NULL,

    CONSTRAINT "financial_cost_pkey" PRIMARY KEY ("Financial_id")
);

-- CreateTable
CREATE TABLE "prediction_result" (
    "Prediction_id" TEXT NOT NULL,
    "matchedAccidentId" TEXT,
    "modelVersion" TEXT NOT NULL,
    "predictedAt" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" INTEGER NOT NULL,
    "predictedPeriodStart" TIMESTAMP(3) NOT NULL,
    "predictedPeriodEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_result_pkey" PRIMARY KEY ("Prediction_id")
);

-- CreateIndex
CREATE INDEX "accident_record_accidentDateTime_idx" ON "accident_record"("accidentDateTime");

-- AddForeignKey
ALTER TABLE "er_visit_record" ADD CONSTRAINT "er_visit_record_hn_fkey" FOREIGN KEY ("hn") REFERENCES "patient_demographics"("HN") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "er_visit_record" ADD CONSTRAINT "er_visit_record_accidentId_fkey" FOREIGN KEY ("accidentId") REFERENCES "accident_record"("Accident_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_record" ADD CONSTRAINT "diagnosis_record_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "er_visit_record"("Visit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_cost" ADD CONSTRAINT "financial_cost_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "er_visit_record"("Visit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_result" ADD CONSTRAINT "prediction_result_matchedAccidentId_fkey" FOREIGN KEY ("matchedAccidentId") REFERENCES "accident_record"("Accident_id") ON DELETE SET NULL ON UPDATE CASCADE;
