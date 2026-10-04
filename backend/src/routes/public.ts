import { Router } from "express";
import { prisma } from "../lib/prisma";

// Public routes: ไม่ต้อง login
// PDPA: ห้ามแตะ PatientDemographics / ErVisitRecord / DiagnosisRecord / FinancialCost
// ส่งเฉพาะข้อมูลสรุปรวมจาก AccidentRecord และ PredictionResult เท่านั้น
export const publicRouter = Router();

// สถิติความปลอดภัยของ PSU
publicRouter.get("/stats", async (_req, res) => {
  try {
    const [total, byRoad, byWeather, byHour] = await Promise.all([
      prisma.accidentRecord.aggregate({
        _count: { _all: true },
        _sum: { casualtiesCount: true },
      }),
      prisma.accidentRecord.groupBy({
        by: ["roadName"],
        _count: { _all: true },
        _sum: { casualtiesCount: true },
        orderBy: { _count: { roadName: "desc" } },
        take: 5,
      }),
      prisma.accidentRecord.groupBy({
        by: ["weatherCondition"],
        _count: { _all: true },
      }),
      // เวลาใน DB เก็บเป็น UTC แปลงเป็นเวลาไทยก่อนนับรายชั่วโมง
      prisma.$queryRaw<{ hour: number; count: number }[]>`
        SELECT EXTRACT(HOUR FROM ("accidentDateTime" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Bangkok')::int AS hour,
               COUNT(*)::int AS count
        FROM accident_record
        GROUP BY 1
        ORDER BY 1
      `,
    ]);

    res.json({
      totalAccidents: total._count._all,
      totalCasualties: total._sum.casualtiesCount ?? 0,
      topRoads: byRoad.map((r) => ({
        roadName: r.roadName,
        accidents: r._count._all,
        casualties: r._sum.casualtiesCount ?? 0,
      })),
      byWeather: byWeather.map((w) => ({
        weather: w.weatherCondition,
        accidents: w._count._all,
      })),
      byHour,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Hazard Map: จุดเสี่ยงจากผลพยากรณ์ + จุดเกิดเหตุ (ไม่มีข้อมูลผู้ป่วย)
publicRouter.get("/hazard-map", async (_req, res) => {
  try {
    const [predictions, accidents] = await Promise.all([
      prisma.predictionResult.findMany({
        where: { riskLevel: { gte: 2 } },
        orderBy: { riskScore: "desc" },
        take: 200,
        select: {
          latitude: true,
          longitude: true,
          riskScore: true,
          riskLevel: true,
          predictedPeriodStart: true,
          predictedPeriodEnd: true,
        },
      }),
      prisma.accidentRecord.findMany({
        orderBy: { accidentDateTime: "desc" },
        take: 300,
        select: {
          roadName: true,
          latitude: true,
          longitude: true,
          casualtiesCount: true,
        },
      }),
    ]);

    // Prisma Decimal จะถูก serialize เป็น string จึงแปลงเป็น number ให้ Google Maps ใช้ได้เลย
    res.json({
      riskPoints: predictions.map((p) => ({
        ...p,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
      })),
      accidentPoints: accidents.map((a) => ({
        ...a,
        latitude: Number(a.latitude),
        longitude: Number(a.longitude),
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch hazard map" });
  }
});

// Hotspots: สรุปรายถนน (จำนวนอุบัติเหตุ + คะแนนความเสี่ยงล่าสุดจากผลพยากรณ์)
// ใช้กับหน้า PSU Hazard Map ไม่มีข้อมูลผู้ป่วย
const num = (d: unknown) => Number(d ?? 0);

publicRouter.get("/hotspots", async (_req, res) => {
  try {
    const [accidents, predictions] = await Promise.all([
      prisma.accidentRecord.findMany({
        select: { roadName: true, latitude: true, longitude: true },
      }),
      prisma.predictionResult.findMany({ orderBy: { predictedAt: "desc" } }),
    ]);

    const groups = new Map<string, { name: string; n: number; lat: number; lng: number }>();
    for (const a of accidents) {
      const g = groups.get(a.roadName) ?? { name: a.roadName, n: 0, lat: 0, lng: 0 };
      g.n += 1;
      g.lat += num(a.latitude);
      g.lng += num(a.longitude);
      groups.set(a.roadName, g);
    }

    const hotspots = [...groups.values()]
      .map((g) => {
        const lat = g.lat / g.n;
        const lng = g.lng / g.n;
        let best: (typeof predictions)[number] | null = null;
        let bestD = Infinity;
        for (const p of predictions) {
          const d = (num(p.latitude) - lat) ** 2 + (num(p.longitude) - lng) ** 2;
          if (d < bestD) {
            bestD = d;
            best = p;
          }
        }
        return {
          id: g.name,
          name: g.name,
          lat,
          lng,
          incidents: g.n,
          riskScore: best ? best.riskScore : 0,
          riskLevel: best ? best.riskLevel : 1,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);

    res.json(hotspots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch hotspots" });
  }
});