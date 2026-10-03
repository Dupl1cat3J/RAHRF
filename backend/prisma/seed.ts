import { prisma } from "../src/lib/prisma";

// ตัวช่วยสุ่ม
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pickOne = <T>(items: T[]): T => items[randInt(0, items.length - 1)];

// จุดจำลองในมหาวิทยาลัย (พิกัดโดยประมาณ) น้ำหนักมาก = เกิดบ่อย
const LOCATIONS = [
  { name: "Faculty of Engineering Road", lat: 7.0064, lng: 100.5035, weight: 5 },
  { name: "Sport Complex Road", lat: 7.0092, lng: 100.4988, weight: 4 },
  { name: "Faculty of Liberal Arts Road", lat: 7.0075, lng: 100.5008, weight: 3 },
  { name: "Gate 1 Main Road", lat: 7.0125, lng: 100.501, weight: 3 },
  { name: "Gate 108 Roundabout", lat: 7.005, lng: 100.4975, weight: 2 },
  { name: "Faculty of Dentistry Road", lat: 7.009, lng: 100.5025, weight: 1 },
];
// ทำให้จุดที่ weight สูงถูกสุ่มโดนบ่อยขึ้น
const WEIGHTED_LOCATIONS = LOCATIONS.flatMap((l) => Array(l.weight).fill(l));

const VEHICLES = ["Motorcycle", "Motorcycle", "Motorcycle", "Car", "Car", "Pedestrian", "Bicycle", "Bus"];
const HOURS = [7, 8, 9, 12, 13, 16, 17, 17, 18, 18, 19, 20, 22]; // ช่วงเช้า/เที่ยง/เย็นเกิดบ่อย

// การวินิจฉัยตามระดับความรุนแรง 1-5
const DIAGNOSES: Record<number, { icd10: string; injury: string; organ: string }> = {
  1: { icd10: "T14.9", injury: "Minor abrasion", organ: "Skin" },
  2: { icd10: "S80.0", injury: "Contusion", organ: "Leg" },
  3: { icd10: "S06.0", injury: "Concussion", organ: "Head" },
  4: { icd10: "S82.1", injury: "Fracture", organ: "Leg" },
  5: { icd10: "S06.5", injury: "Intracranial hemorrhage", organ: "Head" },
};
const BASE_COST = [0, 3000, 8000, 20000, 60000, 150000]; // ค่ารักษาตามความรุนแรง (บาท)
// ความเสียหายทรัพย์สินตามชนิดยานพาหนะ (บาท)
const assetDamage = (v: string) =>
  v === "Car" ? randInt(5000, 15000)
  : v === "Bus" ? randInt(10000, 20000)
  : v === "Motorcycle" ? randInt(1500, 4500)
  : v === "Bicycle" ? randInt(500, 1500)
  : 0; // Pedestrian

async function main() {
  // ลบข้อมูลเก่าก่อน (ลูกก่อนแม่) เพื่อให้รันซ้ำได้โดยข้อมูลไม่ซ้อนกัน
  await prisma.financialCost.deleteMany();
  await prisma.diagnosisRecord.deleteMany();
  await prisma.erVisitRecord.deleteMany();
  await prisma.predictionResult.deleteMany();
  await prisma.accidentRecord.deleteMany();
  await prisma.patientDemographics.deleteMany();

  // 1. ผู้ป่วย 50 คน (รหัสสมมติ ไม่ใช่ HN จริง)
  const hns = Array.from({ length: 50 }, (_, i) => `ANON${100000 + i}`);
  await prisma.patientDemographics.createMany({
    data: hns.map((hn) => ({
      hn,
      age: randInt(18, 60),
      gender: pickOne(["Male", "Female"]),
    })),
  });
  console.log("patients done");

  // 2. อุบัติเหตุ 142 ครั้ง (พร้อม ER visit, วินิจฉัย, ค่าใช้จ่าย)
  const accidentIdsByRoad = new Map<string, string[]>();

  for (let i = 0; i < 142; i++) {
    const loc = pickOne(WEIGHTED_LOCATIONS);
    const severity = pickOne([1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5]); // เบาเกิดบ่อยกว่า
    const vehicle = pickOne(VEHICLES);

    // สุ่มวันภายใน 1 ปีที่ผ่านมา แล้วกำหนดชั่วโมง
    const when = new Date(Date.now() - randInt(0, 360) * 86400000);
    when.setHours(pickOne(HOURS), randInt(0, 59), 0, 0);

    const weather = pickOne(["Clear", "Clear", "Clear", "Rainy", "Cloudy"]);
    const cost = Math.round(BASE_COST[severity] * rand(0.8, 1.2));
    const d = DIAGNOSES[severity];

    const accident = await prisma.accidentRecord.create({
      data: {
        reportedBy: pickOne(["Campus Security", "Hospital ER", "Traffic Police"]),
        accidentDateTime: when,
        latitude: loc.lat + rand(-0.0003, 0.0003),
        longitude: loc.lng + rand(-0.0003, 0.0003),
        roadName: loc.name,
        subDistrict: "Kho Hong",
        weatherCondition: weather,
        roadSurfaceCondition: weather === "Rainy" ? "Wet" : "Dry",
        lightingCondition: when.getHours() >= 18 || when.getHours() < 6 ? "Night" : "Daylight",
        vehiclesInvolvedCount: randInt(1, 2),
        casualtiesCount: 1,
        vehicleType: vehicle,
        assetDamageCost: assetDamage(vehicle),
        // สร้างลูกซ้อนในคำสั่งเดียว: Prisma ใส่ FK ให้เองอัตโนมัติ
        erVisits: {
          create: {
            hn: pickOne(hns),
            incidentDateTime: when,
            arrivalDateTime: new Date(when.getTime() + randInt(10, 45) * 60000),
            transportMode: pickOne(["Ambulance", "Private car", "Walk-in"]),
            roleInAccident: vehicle === "Pedestrian" ? "Pedestrian" : pickOne(["Driver", "Passenger"]),
            vehicleType: vehicle,
            triageLevel: String(6 - severity), // รุนแรงมาก = triage เลขน้อย
            gcsScore: severity >= 4 ? randInt(8, 13) : 15,
            riskBehavior: Math.random() < 0.35 ? 1 : 0,
            outcomeStatus: severity >= 4 ? "Admitted" : pickOne(["Discharged", "Referred"]),
            losErMinutes: randInt(30, 60 + severity * 60),
            diagnoses: {
              create: {
                icd10Code: d.icd10,
                injuryType: d.injury,
                affectedOrgan: d.organ,
                severityScore: severity,
              },
            },
            costs: {
              create: {
                totalMedicalCost: cost,
                costOfInactionValue: Math.round(cost * 1.3),
                paymentRights: pickOne(["Universal coverage", "Student insurance", "Self-pay"]),
              },
            },
          },
        },
      },
    });

    accidentIdsByRoad.set(loc.name, [...(accidentIdsByRoad.get(loc.name) ?? []), accident.id]);
    if ((i + 1) % 20 === 0) console.log(`accidents: ${i + 1}/142`);
  }
  console.log("accidents done");

    // 3. ผลพยากรณ์
  const toLevel = (score: number) => (score >= 70 ? 3 : score >= 40 ? 2 : 1); // 1=Low 2=Medium 3=High
  const DAY = 86400000;

  // 3.1 ย้อนหลัง: พยากรณ์ไปแล้วและมีผลเทียบกับเหตุการณ์จริง (ใส่ matchedAccidentId)
  for (let i = 0; i < 20; i++) {
    const loc = LOCATIONS[i % LOCATIONS.length];
    const score = Math.min(95, Math.round((loc.weight / 5) * 80 + rand(0, 15)));
    const start = new Date(Date.now() - (70 - i * 3) * DAY);
    const pool = accidentIdsByRoad.get(loc.name) ?? [];

    await prisma.predictionResult.create({
      data: {
        // 17 จาก 20 ตรงกับเหตุการณ์จริง (ความแม่นยำ ~85%)
        matchedAccidentId: i < 17 && pool.length ? pool[i % pool.length] : null,
        modelVersion: i % 2 ? "RF-v1.0" : "LSTM-v1.0",
        predictedAt: new Date(start.getTime() - 7 * DAY),
        latitude: loc.lat,
        longitude: loc.lng,
        riskScore: score,
        riskLevel: toLevel(score),
        predictedPeriodStart: start,
        predictedPeriodEnd: new Date(start.getTime() + 7 * DAY),
      },
    });
  }

  // 3.2 อนาคต: ยังไม่เกิดเหตุ จึงไม่มี matchedAccidentId
  for (const loc of LOCATIONS) {
    const score = Math.min(95, Math.round((loc.weight / 5) * 85 + rand(0, 10)));
    await prisma.predictionResult.create({
      data: {
        modelVersion: "RF-v1.0",
        predictedAt: new Date(),
        latitude: loc.lat,
        longitude: loc.lng,
        riskScore: score,
        riskLevel: toLevel(score),
        predictedPeriodStart: new Date(),
        predictedPeriodEnd: new Date(Date.now() + 7 * DAY),
      },
    });
  }
  console.log("predictions done");
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());