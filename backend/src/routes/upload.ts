import { Router, type Request, type Response } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { parseWorkbook } from "../lib/excelImport";

// POST /api/admin/data/upload  (form-data, field ชื่อ "file", ไฟล์ .xlsx)
export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

async function handleUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Send multipart/form-data with field name "file".' });
      return;
    }
    if (!req.file.originalname.toLowerCase().endsWith(".xlsx")) {
      res.status(400).json({ error: "Only .xlsx files are supported." });
      return;
    }

    const { sheets, errors, unknownSheets } = await parseWorkbook(req.file.buffer);

    if (errors.length) {
      res.status(400).json({
        error: "Validation failed. Nothing was saved.",
        totalErrors: errors.length,
        errors: errors.slice(0, 50),
      });
      return;
    }
    if (!sheets.length) {
      res.status(400).json({ error: "No recognised sheets found. Sheet names must match the table names exactly." });
      return;
    }

    // เขียนทุกชีตใน transaction เดียว ถ้าพังจะย้อนกลับทั้งหมด
    const imported: Record<string, number> = {};
    await prisma.$transaction(
      async (tx) => {
        for (const { spec, rows } of sheets) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const delegate = (tx as any)[spec.delegate];
          for (const data of rows) {
            const { [spec.idKey]: id, ...rest } = data;
            await delegate.upsert({
              where: { [spec.idKey]: id },
              update: rest,
              create: data,
            });
          }
          imported[spec.sheet] = rows.length;
        }
      },
      { timeout: 120_000, maxWait: 10_000 },
    );

    res.json({ message: "Import complete", imported, ignoredSheets: unknownSheets });
  } catch (error) {
    console.error(error);
    const code = (error as { code?: string })?.code;
    if (code === "P2003") {
      res.status(400).json({
        error: "A row refers to an id that does not exist (check hn, accidentId, visitId, matchedAccidentId). Nothing was saved.",
      });
      return;
    }
    res.status(500).json({ error: "Failed to import file" });
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