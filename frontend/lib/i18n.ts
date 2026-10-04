// Dictionary + types only. Safe to import from both server and client components.
export type Locale = "th" | "en";
export const LOCALES: Locale[] = ["th", "en"];
export const DEFAULT_LOCALE: Locale = "en"; // change to "th" to open in Thai by default
export const LOCALE_COOKIE = "lang";

const en = {
  htmlLang: "en",
  brand: "RAHRF · PSU Road Safety",
  footer:
    "This public page is anonymous and follows Thailand's PDPA. No personal information, device data, or session trails are collected. Figures are aggregated by area.",
  error: "Cannot load data. Please check that the API server is running.",
  nav: {
    stats: "PSU Road Safety Stats",
    map: "PSU Hazard Map",
    main: "Main",
    menu: "Menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },
  stats: {
    title: "PSU Road Safety Stats",
    intro:
      "See how safe our campus roads are. This page shows accident data from around PSU Hat Yai. No personal information is ever collected.",
    totalIncidents: "Total Incidents",
    totalIncidentsNote: "Accidents recorded on and around campus.",
    casualties: "Casualties",
    casualtiesNote: "People affected across all recorded incidents.",
    highRisk: "High-risk Locations",
    highRiskNote: (n: number) => `Out of ${n} monitored locations.`,
    highRiskUnavailable: "Location data is unavailable right now.",
    timeTitle: "Accidents by Time of Day",
    timeDesc:
      "Most accidents happen right after classes end, when many students and vehicles are moving at once.",
    busiest: "Busiest Time",
    busiestInsight: (label: string, range: string) =>
      `Most accidents happen during ${label} (${range}).`,
    accidentsAria: (label: string, n: number) => `${label}: ${n} accidents`,
    slots: {
      morning: "Morning Peak",
      midday: "Midday Flow",
      afternoon: "Afternoon Rush",
      night: "Night Hours",
    },
    vehicleTitle: "Accidents by Vehicle Type",
    vehicleDesc: "Share of recorded accidents by the type of vehicle involved.",
    vehicleAria: "Accidents by vehicle type",
    totalEvents: "Total Events",
    noData: "No data yet.",
    vehicles: {} as Record<string, string>,
    roadsTitle: "Roads with the most incidents",
    incidents: (n: number) => `${n} incidents`,
    casualtiesCount: (n: number) => `${n} casualties`,
  },
  map: {
    title: "PSU Hazard Map",
    intro:
      "See which areas around campus have the highest accident risk. Tap a filter to show only one risk level.",
    filters: "Filter locations",
    all: "All Points",
    filter: { 3: "High Risk", 2: "Medium Risk", 1: "Low Risk" } as Record<number, string>,
    levels: { 3: "High", 2: "Medium", 1: "Low" } as Record<number, string>,
    topLine: (inc: number, score: number) =>
      `Highest risk in this view: ${inc} incidents, risk score ${score}.`,
    watchTitle: "Locations to watch",
    watchDesc: "Sorted by predicted risk.",
    empty: "No locations match this filter.",
    incidents: (n: number) => `${n} incidents`,
  },
};

const th: typeof en = {
  htmlLang: "th",
  brand: "RAHRF · PSU Road Safety",
  footer:
    "หน้านี้เป็นข้อมูลสาธารณะแบบไม่ระบุตัวตนและเป็นไปตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) ไม่มีการเก็บข้อมูลส่วนบุคคล ข้อมูลอุปกรณ์ หรือประวัติการใช้งาน ตัวเลขทั้งหมดเป็นข้อมูลรวมตามพื้นที่",
  error: "โหลดข้อมูลไม่ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ API ทำงานอยู่",
  nav: {
    stats: "สถิติความปลอดภัยทางถนน PSU",
    map: "แผนที่จุดเสี่ยง PSU",
    main: "เมนูหลัก",
    menu: "เมนู",
    openMenu: "เปิดเมนู",
    closeMenu: "ปิดเมนู",
    language: "ภาษา",
  },
  stats: {
    title: "สถิติความปลอดภัยทางถนน PSU",
    intro:
      "ดูว่าถนนในมหาวิทยาลัยของเราปลอดภัยแค่ไหน หน้านี้แสดงข้อมูลอุบัติเหตุบริเวณ ม.อ. หาดใหญ่ โดยไม่มีการเก็บข้อมูลส่วนบุคคลใดๆ",
    totalIncidents: "อุบัติเหตุทั้งหมด",
    totalIncidentsNote: "อุบัติเหตุที่บันทึกไว้ในและรอบมหาวิทยาลัย",
    casualties: "ผู้ประสบเหตุ",
    casualtiesNote: "จำนวนผู้ประสบเหตุจากอุบัติเหตุทั้งหมดที่บันทึกไว้",
    highRisk: "จุดเสี่ยงสูง",
    highRiskNote: (n: number) => `จากทั้งหมด ${n} จุดที่เฝ้าระวัง`,
    highRiskUnavailable: "ขณะนี้ไม่มีข้อมูลจุดเสี่ยง",
    timeTitle: "อุบัติเหตุแยกตามช่วงเวลา",
    timeDesc:
      "อุบัติเหตุส่วนใหญ่เกิดหลังเลิกเรียน ซึ่งมีนักศึกษาและยานพาหนะเคลื่อนที่พร้อมกันจำนวนมาก",
    busiest: "ช่วงที่เกิดเหตุมากสุด",
    busiestInsight: (label: string, range: string) =>
      `อุบัติเหตุเกิดมากที่สุดใน${label} (${range})`,
    accidentsAria: (label: string, n: number) => `${label}: อุบัติเหตุ ${n} ครั้ง`,
    slots: {
      morning: "ช่วงเช้าเร่งด่วน",
      midday: "ช่วงกลางวัน",
      afternoon: "ช่วงเย็นเร่งด่วน",
      night: "ช่วงกลางคืน",
    },
    vehicleTitle: "อุบัติเหตุแยกตามประเภทยานพาหนะ",
    vehicleDesc: "สัดส่วนอุบัติเหตุที่บันทึกไว้ แยกตามประเภทยานพาหนะที่เกี่ยวข้อง",
    vehicleAria: "อุบัติเหตุแยกตามประเภทยานพาหนะ",
    totalEvents: "เหตุการณ์ทั้งหมด",
    noData: "ยังไม่มีข้อมูล",
    vehicles: {
      Motorcycle: "รถจักรยานยนต์",
      Car: "รถยนต์",
      Pedestrian: "คนเดินเท้า",
      Bicycle: "จักรยาน",
      Bus: "รถบัส",
    },
    roadsTitle: "ถนนที่เกิดอุบัติเหตุมากที่สุด",
    incidents: (n: number) => `${n} ครั้ง`,
    casualtiesCount: (n: number) => `ผู้ประสบเหตุ ${n} ราย`,
  },
  map: {
    title: "แผนที่จุดเสี่ยง PSU",
    intro:
      "ดูว่าพื้นที่ใดในมหาวิทยาลัยมีความเสี่ยงอุบัติเหตุสูง แตะตัวกรองเพื่อดูเฉพาะระดับความเสี่ยงที่ต้องการ",
    filters: "กรองตำแหน่ง",
    all: "ทุกจุด",
    filter: { 3: "เสี่ยงสูง", 2: "เสี่ยงปานกลาง", 1: "เสี่ยงต่ำ" },
    levels: { 3: "สูง", 2: "ปานกลาง", 1: "ต่ำ" },
    topLine: (inc: number, score: number) =>
      `เสี่ยงสูงสุดในมุมมองนี้: เกิดเหตุ ${inc} ครั้ง คะแนนความเสี่ยง ${score}`,
    watchTitle: "จุดที่ควรระวัง",
    watchDesc: "เรียงตามความเสี่ยงที่คาดการณ์",
    empty: "ไม่มีตำแหน่งที่ตรงกับตัวกรองนี้",
    incidents: (n: number) => `${n} ครั้ง`,
  },
};

export const dict: Record<Locale, typeof en> = { en, th };
