import "dotenv/config";
import express from "express";
import cors from "cors";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";
import { uploadRouter } from "./routes/upload";
import { requireAdmin } from "./middleware/requireAdmin";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "RAHRF API is running" });
});

app.use("/api/public", publicRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/data", requireAdmin, uploadRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});