import { Router, type Request, type Response } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { parseWorkbook } from "../lib/excelImport";

// POST /api/admin/data/upload   อัปโหลดไฟล์ .xlsx (form-data, field "file")
// GET  /api/admin/data/uploads  ประวัติการอัปโหลดล่าสุด
export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// บันทึกประวัติ ถ้าบันทึกไม่สำเร็จจะไม่ให้กระทบการอัปโหลดหลัก
async function logUpload(fileName: string, recordsAdded: number, status: "Success" | "Failed", detail: unknown) {
  try {
    await prisma.uploadLog.create({
      data: { fileName, format: "XLSX", recordsAdded, status, detail: JSON.parse(JSON.stringify(detail)) },
    });
  } catch (e) {
    console.error("Failed to write upload log", e);
  }
}

async function handleUpload(req: Request, res: Response) {
  const fileName = req.file?.originalname ?? "unknown";
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Send multipart/form-data with field name "file".' });
      return;
    }
    if (!fileName.toLowerCase().endsWith(".xlsx")) {
      res.status(400).json({ error: "Only .xlsx files are supported." });
      return;
    }

    const { sheets, errors, unknownSheets } = await parseWorkbook(req.file.buffer);

    if (errors.length) {
      await logUpload(fileName, 0, "Failed", { totalErrors: errors.length, errors: errors.slice(0, 20) });
      res.status(400).json({
        error: "Validation failed. Nothing was saved.",
        totalErrors: errors.length,
        errors: errors.slice(0, 50),
      });
      return;
    }
    if (!sheets.length) {
      const message = "No recognised sheets found. Sheet names must match the table names exactly.";
      await logUpload(fileName, 0, "Failed", { message });
      res.status(400).json({ error: message });
      return;
    }

    const imported: Record<string, number> = {};
    await prisma.$transaction(
      async (tx) => {
        for (const { spec, rows } of sheets) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const delegate = (tx as any)[spec.delegate];
          for (const data of rows) {
            const { [spec.idKey]: id, ...rest } = data;
            await delegate.upsert({ where: { [spec.idKey]: id }, update: rest, create: data });
          }
          imported[spec.sheet] = rows.length;
        }
      },
      { timeout: 120_000, maxWait: 10_000 },
    );

    const totalRows = Object.values(imported).reduce((a, b) => a + b, 0);
    await logUpload(fileName, totalRows, "Success", { imported });
    res.json({ message: "Import complete", imported, totalRows, ignoredSheets: unknownSheets });
  } catch (error) {
    console.error(error);
    const code = (error as { code?: string })?.code;
    if (code === "P2003") {
      const message =
        "A row refers to an id that does not exist (check hn, accidentId, visitId, matchedAccidentId). Nothing was saved.";
      await logUpload(fileName, 0, "Failed", { message });
      res.status(400).json({ error: message });
      return;
    }
    // ดึงบรรทัดสำคัญจาก error ของ Prisma ให้แสดงในหน้าเว็บ (endpoint นี้สำหรับ admin เท่านั้น)
    const msg = error instanceof Error ? error.message : String(error);
    const hint = msg
      .split("\n")
      .filter((l) => /argument|unknown|invalid value|unique constraint|violat/i.test(l))
      .slice(0, 3)
      .map((l) => l.trim())
      .join(" ");
    await logUpload(fileName, 0, "Failed", { message: hint || "Unexpected server error" });
    res.status(500).json({ error: hint ? `Failed to import file. ${hint}` : "Failed to import file" });
  }
}

uploadRouter.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: `Upload failed: ${err.message}` });
      return;
    }
    void handleUpload(req, res);
  });
});

uploadRouter.get("/uploads", async (_req, res) => {
  try {
    const rows = await prisma.uploadLog.findMany({ orderBy: { uploadedAt: "desc" }, take: 10 });
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch upload history" });
  }
});