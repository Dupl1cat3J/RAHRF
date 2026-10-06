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
    const accidents = await prisma.accidentRecord.findMany({
      select: {
        roadName: true,
        vehicleType: true,
        accidentDateTime: true,
        assetDamageCost: true,
        erVisits: {
          select: {
            outcomeStatus: true,
            costs: { select: { totalMedicalCost: true } },
            diagnoses: { select: { severityScore: true } },
          },
        },
      },
    });

    const DAY = 86400000;
    const now = Date.now();
    const inWindow = (d: Date, from: number, to: number) =>
      d.getTime() >= now - from * DAY && d.getTime() < now - to * DAY;
    // เปลี่ยนแปลง (%) ของ 30 วันล่าสุด เทียบกับ 30 วันก่อนหน้า
    const trend = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null;

    let severeHigh = 0;
    let severeMedium = 0;
    let fatalities = 0;
    let medical = 0;
    let asset = 0;
    const cur = { acc: 0, severe: 0, loss: 0 };
    const prev = { acc: 0, severe: 0, loss: 0 };
    const byVehicle: Record<string, number> = {};
    const roadVehicle: Record<string, Record<string, number>> = {};
    // แถว = จันทร์ถึงอาทิตย์, คอลัมน์ = 6 ช่วงเวลา ช่วงละ 4 ชั่วโมง (เวลาไทย)
    const heat = Array.from({ length: 7 }, () => Array<number>(6).fill(0));

    for (const a of accidents) {
      const assetCost = num(a.assetDamageCost);
      let medicalCost = 0;
      let severe = 0;
      for (const v of a.erVisits) {
        if (v.outcomeStatus === "Deceased") fatalities += 1;
        for (const c of v.costs) medicalCost += num(c.totalMedicalCost);
        for (const d of v.diagnoses) {
          if (d.severityScore >= 5) {
            severeHigh += 1;
            severe += 1;
          } else if (d.severityScore === 4) {
            severeMedium += 1;
            severe += 1;
          }
        }
      }
      medical += medicalCost;
      asset += assetCost;

      byVehicle[a.vehicleType] = (byVehicle[a.vehicleType] ?? 0) + 1;
      const rv = (roadVehicle[a.roadName] ??= {});
      rv[a.vehicleType] = (rv[a.vehicleType] ?? 0) + 1;

      // แปลงเป็นเวลาไทย (UTC+7) แล้วอ่านค่าด้วย getUTC*
      const t = new Date(a.accidentDateTime.getTime() + 7 * 3600000);
      heat[(t.getUTCDay() + 6) % 7][Math.floor(t.getUTCHours() / 4)] += 1;

      const bucket = inWindow(a.accidentDateTime, 30, 0)
        ? cur
        : inWindow(a.accidentDateTime, 60, 30)
          ? prev
          : null;
      if (bucket) {
        bucket.acc += 1;
        bucket.severe += severe;
        bucket.loss += medicalCost + assetCost;
      }
    }

    const primaryVehicleByRoad = Object.fromEntries(
      Object.entries(roadVehicle).map(([road, counts]) => [
        road,
        Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0],
      ]),
    );

    res.json({
      totalAccidents: accidents.length,
      severeInjuries: severeHigh + severeMedium,
      severeHigh,
      severeMedium,
      fatalities,
      medicalCost: medical,
      assetDamageCost: asset,
      totalLoss: medical + asset,
      trends: {
        accidents: trend(cur.acc, prev.acc),
        severe: trend(cur.severe, prev.severe),
        loss: trend(cur.loss, prev.loss),
      },
      byVehicle: Object.entries(byVehicle)
        .map(([vehicle, accidents]) => ({ vehicle, accidents }))
        .sort((a, b) => b.accidents - a.accidents),
      primaryVehicleByRoad,
      heatmap: heat,
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