import type { Request, Response, NextFunction } from "express";

// TEMPORARY: ใช้ API key ชั่วคราวระหว่างพัฒนา
// เมื่อทำ PSU Passport เสร็จ ให้แทนที่ฟังก์ชันนี้ด้วยการตรวจ session/token จริง
// (route ฝั่ง admin ไม่ต้องแก้ เพราะเรียกผ่าน middleware ตัวนี้ตัวเดียว)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = process.env.ADMIN_API_KEY;
  if (!key || req.header("x-api-key") !== key) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}