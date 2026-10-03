import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/requireAdmin";

// Admin routes: ทุก route ผ่าน requireAdmin
export const adminRouter = Router();
adminRouter.use(requireAdmin);

const num = (v: unknown) => Number(v ?? 0);

// 1) Overview
adminRouter.get("/overview", async (_req, res) => {
  try {
    const [accidents, visits, predictions, highRisk, cost, los] =
      await Promise.all([
        prisma.accidentRecord.count(),
        prisma.erVisitRecord.count(),
        prisma.predictionResult.count(),
        prisma.predictionResult.count({ where: { riskLevel: 3 } }),
        prisma.financialCost.aggregate({
          _sum: { totalMedicalCost: true, costOfInactionValue: true },
        }),
        prisma.erVisitRecord.aggregate({ _avg: { losErMinutes: true } }),
      ]);

    res.json({
      accidents,
      erVisits: visits,
      predictions,
      highRiskPredictions: highRisk,
      totalMedicalCost: num(cost._sum.totalMedicalCost),
      totalCostOfInaction: num(cost._sum.costOfInactionValue),
      avgErLosMinutes: num(los._avg.losErMinutes),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
});

// 2) Data Management / Accident Reports: รายการอุบัติเหตุ (แบ่งหน้า + กรองช่วงวันที่)
adminRouter.get("/accidents", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (req.query.from) dateFilter.gte = new Date(String(req.query.from));
    if (req.query.to) dateFilter.lte = new Date(String(req.query.to));
    const where = Object.keys(dateFilter).length
      ? { accidentDateTime: dateFilter }
      : {};

    const [items, total] = await Promise.all([
      prisma.accidentRecord.findMany({
        where,
        orderBy: { accidentDateTime: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { erVisits: true } } },
      }),
      prisma.accidentRecord.count({ where }),
    ]);

    res.json({ page, pageSize, total, items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch accidents" });
  }
});

// Accident Report: รายละเอียดอุบัติเหตุ 1 ครั้ง พร้อม visit, diagnosis, cost
adminRouter.get("/accidents/:id", async (req, res) => {
  try {
    const accident = await prisma.accidentRecord.findUnique({
      where: { id: req.params.id },
      include: {
        erVisits: {
          include: { patient: true, diagnoses: true, costs: true },
        },
        predictions: true,
      },
    });
    if (!accident) {
      res.status(404).json({ error: "Accident not found" });
      return;
    }
    res.json(accident);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch accident" });
  }
});

// 3) Predictive Analysis: ผลพยากรณ์ (กรองตาม riskLevel ได้)
adminRouter.get("/predictions", async (req, res) => {
  try {
    const level = Number(req.query.level);
    const predictions = await prisma.predictionResult.findMany({
      where: level ? { riskLevel: level } : {},
      orderBy: { predictedAt: "desc" },
      take: 200,
    });
    res.json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

// 4) Accident Hotspots: ถนนที่เกิดเหตุบ่อยที่สุด
adminRouter.get("/hotspots", async (_req, res) => {
  try {
    const hotspots = await prisma.accidentRecord.groupBy({
      by: ["roadName"],
      _count: { _all: true },
      _sum: { casualtiesCount: true },
      orderBy: { _count: { roadName: "desc" } },
      take: 10,
    });
    res.json(
      hotspots.map((h) => ({
        roadName: h.roadName,
        accidents: h._count._all,
        casualties: h._sum.casualtiesCount ?? 0,
      })),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch hotspots" });
  }
});

// 5) Risk & Cost: ค่าใช้จ่ายรวม แยกตามสิทธิ์การรักษา และแยกตามถนน
adminRouter.get("/risk-cost", async (_req, res) => {
  try {
    const [byRights, byRoad] = await Promise.all([
      prisma.financialCost.groupBy({
        by: ["paymentRights"],
        _sum: { totalMedicalCost: true, costOfInactionValue: true },
        _count: { _all: true },
      }),
      // ต้อง join 3 ตาราง (financial_cost -> er_visit_record -> accident_record)
      prisma.$queryRaw<
        { roadName: string; medicalCost: number; costOfInaction: number }[]
      >`
        SELECT a."roadName" AS "roadName",
               SUM(fc."totalMedicalCost")::float8 AS "medicalCost",
               SUM(fc."costOfInactionValue")::float8 AS "costOfInaction"
        FROM financial_cost fc
        JOIN er_visit_record v ON v."Visit_id" = fc."visitId"
        JOIN accident_record a ON a."Accident_id" = v."accidentId"
        GROUP BY a."roadName"
        ORDER BY "medicalCost" DESC
        LIMIT 10
      `,
    ]);

    res.json({
      byPaymentRights: byRights.map((r) => ({
        paymentRights: r.paymentRights,
        visits: r._count._all,
        totalMedicalCost: num(r._sum.totalMedicalCost),
        totalCostOfInaction: num(r._sum.costOfInactionValue),
      })),
      byRoad,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch risk and cost" });
  }
});