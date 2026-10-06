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
    campus: {
      sample: "Sample data",
      safetyTitle: "Campus Safety Level",
      levels: { normal: "Normal", caution: "Caution", alert: "Alert" } as Record<string, string>,
      safetyNotes: {
        normal: "Street lights, speed bumps, and crossings around PSU Hat Yai are all working normally.",
        caution: "Some lights or crossings around PSU Hat Yai need attention.",
        alert: "Several safety systems around PSU Hat Yai need attention.",
      } as Record<string, string>,
      wellLitTitle: "Well-Lit Walkways",
      wellLitNote: "Evening walkers used well-lit paths with blue emergency lights.",
      escortsTitle: "Active Safety Escorts",
      completed: "Completed",
      avgResponse: (m: number) => `${m} min avg. response time`,
      escortsNote: (n: number) =>
        `${n} students were safely escorted this week, with no safety issues.`,
    },
  },
  map: {
    title: "PSU Hazard Map",
    intro: "See hazards, safe crossings, and well-lit paths around campus in real time.",
    filters: "Filter locations",
    all: "All Points",
    chips: { hazard: "Active Hazards", crossing: "Safe Crossings" },
    messages: {
      hazards: [
        "Caution: Road construction near the crossing.",
        "Caution: Wet road surface, please slow down.",
        "Caution: Heavy traffic when classes end.",
      ],
      crossing: "Safe crossing with a marked zebra crossing and warning signal.",
      lit: "Well-lit path with LED lighting until sunrise.",
    },
    nightTitle: "Well-Lit Paths at Night",
    nightBody:
      "LED lighting active along main walkways until sunrise. Safest routes run between Faculty of Engineering and Student Dormitory.",
    sample: "Sample data",
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
    campus: {
      sample: "ข้อมูลตัวอย่าง",
      safetyTitle: "ระดับความปลอดภัยในมหาวิทยาลัย",
      levels: { normal: "ปกติ", caution: "เฝ้าระวัง", alert: "เตือนภัย" },
      safetyNotes: {
        normal: "ไฟถนน เนินชะลอความเร็ว และทางข้ามบริเวณ ม.อ. หาดใหญ่ ทำงานเป็นปกติทั้งหมด",
        caution: "ไฟส่องสว่างหรือทางข้ามบางจุดใน ม.อ. หาดใหญ่ต้องได้รับการตรวจสอบ",
        alert: "ระบบความปลอดภัยหลายจุดใน ม.อ. หาดใหญ่ต้องได้รับการตรวจสอบ",
      },
      wellLitTitle: "ทางเดินที่มีแสงสว่างเพียงพอ",
      wellLitNote: "ผู้เดินเท้าช่วงเย็นใช้เส้นทางที่มีไฟส่องสว่างและไฟฉุกเฉินสีน้ำเงิน",
      escortsTitle: "บริการเดินส่งอย่างปลอดภัย",
      completed: "เสร็จสิ้นแล้ว",
      avgResponse: (m: number) => `เวลาตอบสนองเฉลี่ย ${m} นาที`,
      escortsNote: (n: number) =>
        `สัปดาห์นี้มีนักศึกษาได้รับการเดินส่งอย่างปลอดภัย ${n} คน ไม่พบปัญหาด้านความปลอดภัย`,
    },
  },
  map: {
    title: "แผนที่จุดเสี่ยง PSU",
    intro: "ดูจุดเสี่ยง ทางข้ามปลอดภัย และเส้นทางที่มีแสงสว่างรอบมหาวิทยาลัยแบบเรียลไทม์",
    filters: "กรองตำแหน่ง",
    all: "ทุกจุด",
    chips: { hazard: "จุดอันตรายขณะนี้", crossing: "ทางข้ามปลอดภัย" },
    messages: {
      hazards: [
        "ระวัง: มีการก่อสร้างถนนบริเวณทางข้าม",
        "ระวัง: ผิวถนนเปียก โปรดขับช้าลง",
        "ระวัง: การจราจรหนาแน่นช่วงเลิกเรียน",
      ],
      crossing: "ทางข้ามปลอดภัย มีทางม้าลายและสัญญาณเตือน",
      lit: "เส้นทางที่มีไฟ LED ส่องสว่างจนถึงรุ่งเช้า",
    },
    nightTitle: "เส้นทางสว่างยามค่ำคืน",
    nightBody:
      "ไฟ LED เปิดตลอดแนวทางเดินหลักจนถึงรุ่งเช้า เส้นทางที่ปลอดภัยที่สุดอยู่ระหว่างคณะวิศวกรรมศาสตร์กับหอพักนักศึกษา",
    sample: "ข้อมูลตัวอย่าง",
  },
};

export const dict: Record<Locale, typeof en> = { en, th };

