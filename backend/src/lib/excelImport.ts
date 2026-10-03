import ExcelJS from "exceljs";

// เวลาในไฟล์ Excel ถือเป็นเวลาไทย (UTC+7) แล้วแปลงเป็น UTC ก่อนบันทึก
const TZ_OFFSET_HOURS = 7;

type ColType = "string" | "int" | "decimal" | "datetime";
interface Col {
  key: string;
  type: ColType;
  optional?: boolean;
  min?: number;
  max?: number;
}
export interface SheetSpec {
  sheet: string; // ชื่อชีตใน Excel (ตรงกับชื่อ model)
  delegate: string; // ชื่อ property ของ prisma client
  idKey: string; // คอลัมน์ที่เป็น primary key
  columns: Col[];
}
export interface ImportError {
  sheet: string;
  row: number;
  column?: string;
  message: string;
}
export interface ParsedSheet {
  spec: SheetSpec;
  rows: Record<string, unknown>[];
}

// เรียงตามลำดับที่ต้องเขียนลง DB (ตารางแม่ก่อนตารางลูก)
export const SHEET_SPECS: SheetSpec[] = [
  {
    sheet: "PatientDemographics",
    delegate: "patientDemographics",
    idKey: "hn",
    columns: [
      { key: "hn", type: "string" },
      { key: "age", type: "int", min: 0, max: 120 },
      { key: "gender", type: "string" },
    ],
  },
  {
    sheet: "AccidentRecord",
    delegate: "accidentRecord",
    idKey: "id",
    columns: [
      { key: "id", type: "string" },
      { key: "reportedBy", type: "string" },
      { key: "accidentDateTime", type: "datetime" },
      { key: "latitude", type: "decimal", min: -90, max: 90 },
      { key: "longitude", type: "decimal", min: -180, max: 180 },
      { key: "roadName", type: "string" },
      { key: "subDistrict", type: "string" },
      { key: "weatherCondition", type: "string" },
      { key: "roadSurfaceCondition", type: "string" },
      { key: "lightingCondition", type: "string" },
      { key: "vehiclesInvolvedCount", type: "int", min: 0 },
      { key: "casualtiesCount", type: "int", min: 0 },
    ],
  },
  {
    sheet: "ErVisitRecord",
    delegate: "erVisitRecord",
    idKey: "id",
    columns: [
      { key: "id", type: "string" },
      { key: "hn", type: "string" },
      { key: "accidentId", type: "string" },
      { key: "incidentDateTime", type: "datetime" },
      { key: "arrivalDateTime", type: "datetime" },
      { key: "transportMode", type: "string" },
      { key: "roleInAccident", type: "string" },
      { key: "vehicleType", type: "string" },
      { key: "triageLevel", type: "string" },
      { key: "gcsScore", type: "int", min: 3, max: 15 },
      { key: "riskBehavior", type: "int", min: 0 },
      { key: "outcomeStatus", type: "string" },
      { key: "losErMinutes", type: "int", min: 0 },
    ],
  },
  {
    sheet: "DiagnosisRecord",
    delegate: "diagnosisRecord",
    idKey: "id",
    columns: [
      { key: "id", type: "string" },
      { key: "visitId", type: "string" },
      { key: "icd10Code", type: "string" },
      { key: "injuryType", type: "string" },
      { key: "affectedOrgan", type: "string" },
      { key: "severityScore", type: "int", min: 1, max: 5 },
    ],
  },
  {
    sheet: "FinancialCost",
    delegate: "financialCost",
    idKey: "id",
    columns: [
      { key: "id", type: "string" },
      { key: "visitId", type: "string" },
      { key: "totalMedicalCost", type: "decimal", min: 0 },
      { key: "costOfInactionValue", type: "decimal", min: 0 },
      { key: "paymentRights", type: "string" },
    ],
  },
  {
    sheet: "PredictionResult",
    delegate: "predictionResult",
    idKey: "id",
    columns: [
      { key: "id", type: "string" },
      { key: "matchedAccidentId", type: "string", optional: true },
      { key: "modelVersion", type: "string" },
      { key: "predictedAt", type: "datetime" },
      { key: "latitude", type: "decimal", min: -90, max: 90 },
      { key: "longitude", type: "decimal", min: -180, max: 180 },
      { key: "riskScore", type: "int", min: 0, max: 100 },
      { key: "riskLevel", type: "int", min: 1, max: 3 },
      { key: "predictedPeriodStart", type: "datetime" },
      { key: "predictedPeriodEnd", type: "datetime" },
    ],
  },
];

// ดึงค่าจริงออกจาก cell (กรณีเป็นสูตร, rich text, hyperlink)
function cellRaw(v: ExcelJS.CellValue): unknown {
  if (v && typeof v === "object" && !(v instanceof Date)) {
    const o = v as unknown as Record<string, unknown>;
    if ("result" in o) return o.result;
    if (Array.isArray(o.richText))
      return (o.richText as { text: string }[]).map((t) => t.text).join("");
    if ("text" in o) return o.text;
  }
  return v;
}

const isEmpty = (v: unknown) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");

function toNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
  if (!Number.isFinite(n)) throw new Error(`"${String(v)}" is not a number`);
  return n;
}

function toDate(v: unknown): Date {
  let d: Date;
  if (v instanceof Date) {
    // exceljs อ่านเวลาในเซลล์เป็น UTC ตรงๆ จึงลบ offset ของเวลาไทยออก
    d = new Date(v.getTime() - TZ_OFFSET_HOURS * 3600 * 1000);
  } else if (typeof v === "string") {
    const s = v.trim().replace(" ", "T");
    d = /(Z|[+-]\d{2}:?\d{2})$/.test(s) ? new Date(s) : new Date(`${s}+0${TZ_OFFSET_HOURS}:00`);
  } else {
    throw new Error(`"${String(v)}" is not a date/time`);
  }
  if (Number.isNaN(d.getTime())) throw new Error(`"${String(v)}" is not a valid date/time`);
  return d;
}

function coerce(col: Col, v: unknown): unknown {
  switch (col.type) {
    case "string":
      return String(v).trim();
    case "datetime":
      return toDate(v);
    case "int":
    case "decimal": {
      const n = toNumber(v);
      if (col.type === "int" && !Number.isInteger(n)) throw new Error(`${n} must be a whole number`);
      if (col.min !== undefined && n < col.min) throw new Error(`${n} is below the minimum (${col.min})`);
      if (col.max !== undefined && n > col.max) throw new Error(`${n} is above the maximum (${col.max})`);
      return n;
    }
  }
}

export async function parseWorkbook(buffer: Buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const known = new Set(SHEET_SPECS.map((s) => s.sheet));
  const unknownSheets = wb.worksheets.map((w) => w.name).filter((n) => !known.has(n));
  const sheets: ParsedSheet[] = [];
  const errors: ImportError[] = [];

  for (const spec of SHEET_SPECS) {
    const ws = wb.getWorksheet(spec.sheet);
    if (!ws) continue;

    const headerCol = new Map<string, number>();
    ws.getRow(1).eachCell((cell, colNumber) => {
      const name = String(cellRaw(cell.value) ?? "").trim();
      if (name) headerCol.set(name, colNumber);
    });
    const missing = spec.columns.filter((c) => !c.optional && !headerCol.has(c.key)).map((c) => c.key);
    if (missing.length) {
      errors.push({ sheet: spec.sheet, row: 1, message: `Missing column(s): ${missing.join(", ")}` });
      continue;
    }

    const rows: Record<string, unknown>[] = [];
    const seenIds = new Set<string>();
    for (let r = 2; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const values = spec.columns.map((c) => {
        const idx = headerCol.get(c.key);
        return idx ? cellRaw(row.getCell(idx).value) : null;
      });
      if (values.every(isEmpty)) continue; // ข้ามแถวว่าง

      const data: Record<string, unknown> = {};
      spec.columns.forEach((col, i) => {
        const v = values[i];
        if (isEmpty(v)) {
          if (col.optional) data[col.key] = null;
          else errors.push({ sheet: spec.sheet, row: r, column: col.key, message: "Required value is empty" });
          return;
        }
        try {
          data[col.key] = coerce(col, v);
        } catch (e) {
          errors.push({ sheet: spec.sheet, row: r, column: col.key, message: (e as Error).message });
        }
      });

      const id = data[spec.idKey] as string | undefined;
      if (id) {
        if (seenIds.has(id))
          errors.push({ sheet: spec.sheet, row: r, column: spec.idKey, message: `Duplicate ${spec.idKey} "${id}" in this sheet` });
        seenIds.add(id);
      }
      rows.push(data);
    }
    sheets.push({ spec, rows });
  }
  return { sheets, errors, unknownSheets };
}