import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/lib/i18n";

export type Lang = "en" | "th";

const D: Record<string, { en: string; th: string }> = {
  // ทั่วไป
  navOverview: { en: "Overview", th: "ภาพรวม" },
  navData: { en: "Data Management", th: "จัดการข้อมูล" },
  navPredictive: { en: "Predictive Analysis", th: "วิเคราะห์เชิงพยากรณ์" },
  navHotspots: { en: "Accident Hotspots", th: "จุดเสี่ยงอุบัติเหตุ" },
  navCost: { en: "Risk & Cost", th: "ความเสี่ยงและต้นทุน" },
  navReports: { en: "Accident Reports", th: "รายงานอุบัติเหตุ" },
  demoBadge: { en: "Demo with simulated data", th: "ข้อมูลจำลองเพื่อการสาธิต" },
  signOut: { en: "Sign out", th: "ออกจากระบบ" },
  roleAdmin: { en: "Admin", th: "ผู้ดูแลระบบ" },
  loadError: {
    en: "Cannot load data. Please check that the API server is running.",
    th: "ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ API ทำงานอยู่",
  },

  // หน้า Overview
  ovTitle: { en: "Road Safety Overview", th: "ภาพรวมความปลอดภัยทางถนน" },
  ovSub: {
    en: "Summary of accident statistics, predictive risk hotspots, and estimated cost.",
    th: "สรุปสถิติอุบัติเหตุ จุดเสี่ยงเชิงพยากรณ์ และค่าใช้จ่ายโดยประมาณ",
  },
  cTotal: { en: "Total Accident", th: "อุบัติเหตุทั้งหมด" },
  cIncidents: { en: "Incidents", th: "ครั้ง" },
  cCasualties: { en: "Casualties & Injuries", th: "ผู้เสียชีวิตและผู้บาดเจ็บ" },
  cSevere: { en: "Severe", th: "บาดเจ็บรุนแรง" },
  cFatalities: { en: "Fatalities", th: "เสียชีวิต" },
  cHigh: { en: "High Priority Cases", th: "เคสเร่งด่วนสูง" },
  cMedium: { en: "Medium Priority Cases", th: "เคสเร่งด่วนปานกลาง" },
  cCases: { en: "cases", th: "เคส" },
  cLoss: { en: "Estimated Financial Loss", th: "ความเสียหายทางการเงินโดยประมาณ" },
  cTotalCost: { en: "Total Cost", th: "ค่าใช้จ่ายรวม" },
  cMedical: { en: "Medical Costs", th: "ค่ารักษาพยาบาล" },
  cAsset: { en: "Asset Damages", th: "ความเสียหายต่อทรัพย์สิน" },
  viewPatient: { en: "View Patient Details", th: "ดูรายละเอียดผู้ป่วย" },
  viewFinancial: { en: "View Financial Details", th: "ดูรายละเอียดทางการเงิน" },
  mapTitle: { en: "Accident Hotspot Map", th: "แผนที่จุดเสี่ยงอุบัติเหตุ" },
  mapSub: {
    en: "Areas with frequent accidents and high risk",
    th: "พื้นที่ที่เกิดอุบัติเหตุบ่อยและมีความเสี่ยงสูง",
  },
  viewMap: { en: "View Full Map", th: "ดูแผนที่เต็ม" },
  riskLevel: { en: "Risk Level", th: "ระดับความเสี่ยง" },
  levelHigh: { en: "High", th: "สูง" },
  levelMedium: { en: "Medium", th: "กลาง" },
  levelLow: { en: "Low", th: "ต่ำ" },
  hazTitle: { en: "Hazardous Locations", th: "จุดอันตราย" },
  hazTop: { en: "TOP 5", th: "5 อันดับแรก" },
  hazSub: {
    en: "Ranked by how often and how severe accidents are",
    th: "เรียงตามความถี่และความรุนแรงของอุบัติเหตุ",
  },
  primary: { en: "Primary", th: "ยานพาหนะหลัก" },
  incidents: { en: "incidents", th: "ครั้ง" },
  analyze: { en: "Analyze Spatial Hotspots", th: "วิเคราะห์จุดเสี่ยงเชิงพื้นที่" },
  timeTitle: { en: "Time & Risk Distribution", th: "การกระจายตามเวลาและความเสี่ยง" },
  timeSub: {
    en: "Accidents by hour of day and day of week",
    th: "อุบัติเหตุตามช่วงเวลาและวันในสัปดาห์",
  },
  dayWindow: { en: "Day / Window", th: "วัน / ช่วงเวลา" },
  lowRisk: { en: "Low Risk", th: "ความเสี่ยงต่ำ" },
  critical: { en: "Critical", th: "วิกฤต" },
  peakWindow: { en: "Peak Risk Window", th: "ช่วงเวลาเสี่ยงสูงสุด" },
  peakNote: {
    en: "High risk during this period. Consider extra patrols and lighting checks.",
    th: "ช่วงเวลานี้มีความเสี่ยงสูง ควรเพิ่มการลาดตระเวนและตรวจสอบแสงสว่าง",
  },
  viewPredictive: { en: "View Predictive Analysis", th: "ดูการวิเคราะห์เชิงพยากรณ์" },
  vehTitle: { en: "Accidents by Vehicle Type", th: "อุบัติเหตุตามชนิดยานพาหนะ" },
  vehSub: {
    en: "Accident distribution by vehicle involvement",
    th: "สัดส่วนอุบัติเหตุตามยานพาหนะที่เกี่ยวข้อง",
  },
  collisions: { en: "COLLISIONS", th: "ครั้ง" },
  inc: { en: "inc.", th: "ครั้ง" },
  viewRecords: { en: "View Detailed Accident Records", th: "ดูบันทึกอุบัติเหตุโดยละเอียด" },

  // ยานพาหนะและวัน
  vehMotorcycle: { en: "Motorcycles", th: "รถจักรยานยนต์" },
  vehCar: { en: "Cars", th: "รถยนต์" },
  vehPedestrian: { en: "Pedestrians", th: "คนเดินเท้า" },
  vehBicycle: { en: "Bicycles", th: "จักรยาน" },
  vehBus: { en: "Bus", th: "รถโดยสาร" },
  dayMon: { en: "Mon", th: "จ." },
  dayTue: { en: "Tue", th: "อ." },
  dayWed: { en: "Wed", th: "พ." },
  dayThu: { en: "Thu", th: "พฤ." },
  dayFri: { en: "Fri", th: "ศ." },
  daySat: { en: "Sat", th: "ส." },
  daySun: { en: "Sun", th: "อา." },
};

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return v === "th" || v === "en" ? v : DEFAULT_LOCALE;
}

export async function getT() {
  const lang = await getLang();
  const t = (key: string, fallback?: string) => D[key]?.[lang] ?? fallback ?? key;
  return { lang, t };
}