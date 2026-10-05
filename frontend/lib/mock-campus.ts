// MOCK DATA for the PSU Hat Yai demo. None of these numbers come from the database.
// When real sources exist (lighting sensors, escort service logs), replace this
// object with a fetch from the backend.
export type SafetyLevel = "normal" | "caution" | "alert";

export const MOCK_CAMPUS: {
  safety: { level: SafetyLevel; score: number };
  wellLit: { percent: number; change: number };
  escorts: { completed: number; avgResponseMin: number };
} = {
  safety: { level: "normal", score: 94.2 },
  wellLit: { percent: 98.4, change: 2.1 },
  escorts: { completed: 128, avgResponseMin: 3.2 },
};