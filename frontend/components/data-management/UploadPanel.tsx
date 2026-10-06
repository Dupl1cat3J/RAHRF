"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024; // ต้องตรงกับ limit ใน backend (multer)
const FORMAT_NOTE = ".XLSX"; // เพิ่ม .CSV / .GEOJSON เมื่อ backend รองรับ

type Phase = "idle" | "uploading" | "converting" | "done" | "error";
type ApiResult = {
  error?: string;
  totalRows?: number;
  errors?: { sheet: string; row: number; column?: string; message: string }[];
};

const nowTime = () => new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Bangkok" });
const mb = (n: number) =>
  n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;

export default function UploadPanel({ onFinished }: { onFinished: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [rows, setRows] = useState<number | null>(null);
  const [log, setLog] = useState("");
  const [problems, setProblems] = useState<string[]>([]);

  function fail(message: string, list: string[] = []) {
    setPhase("error");
    setLog(`[${nowTime()}] ${message}`);
    setProblems(list);
  }

  function start(f: File) {
    setFile(f);
    setRows(null);
    setProblems([]);
    if (!f.name.toLowerCase().endsWith(".xlsx")) return fail("Only .xlsx files are supported right now.");
    if (f.size > MAX_BYTES) return fail(`File is too large (${mb(f.size)}). The limit is ${mb(MAX_BYTES)}.`);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    const t0 = Date.now();
    setPhase("uploading");
    setPercent(0);
    setLog("");

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const sec = Math.max((Date.now() - t0) / 1000, 0.001);
      const bps = e.loaded / sec;
      setSpeed(bps);
      setEta(Math.ceil((e.total - e.loaded) / bps));
      setPercent(Math.round((e.loaded / e.total) * 60)); // ขั้น 1/3 ใช้ 0-60%
    };
    xhr.upload.onload = () => {
      setPhase("converting");
      setPercent(75);
    };
    xhr.onload = () => {
      let data: ApiResult = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) {
        setPhase("done");
        setPercent(100);
        setRows(data.totalRows ?? null);
        setLog(`[${nowTime()}] Import complete — no errors found. Your data is ready to use.`);
        onFinished();
      } else {
        const list = (data.errors ?? []).slice(0, 5).map((e) => `${e.sheet} row ${e.row}${e.column ? ` (${e.column})` : ""}: ${e.message}`);
        fail(data.error ?? `Import failed (HTTP ${xhr.status}).`, list);
        onFinished();
      }
    };
    xhr.onerror = () => fail("Cannot reach the server. Please check that the API is running.");
    xhr.onabort = () => {
      setPhase("idle");
      setFile(null);
    };

    const form = new FormData();
    form.append("file", f);
    xhr.open("POST", "/api/admin/data/upload");
    xhr.send(form);
  }

  const stage =
    phase === "uploading"
      ? { n: 1, title: "Uploading file", desc: "Sending the file to the server." }
      : phase === "converting"
        ? { n: 2, title: "Converting Excel to Database", desc: "Checking data columns and automatically importing records into the Road Safety Database." }
        : phase === "done"
          ? { n: 3, title: "Import complete", desc: "All sheets were saved to the Road Safety Database." }
          : { n: 3, title: "Import failed", desc: "Nothing was saved. Fix the problems below and upload the file again." };

  const busy = phase === "uploading" || phase === "converting";

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f && !busy) start(f);
        }}
        className={`flex min-h-72 flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-md ${
          dragging ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-md">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 .5 9" />
            <path d="M12 12v8m0-8-3 3m3-3 3 3" />
          </svg>
        </div>
        <p className="text-lg font-semibold">
          Drag &amp; Drop Excel (.xlsx) files here, or{" "}
          <button
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="text-blue-600 underline disabled:opacity-50"
          >
            Browse Computer
          </button>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Supported formats: <b className="text-slate-800">{FORMAT_NOTE}</b> (Max file size: {mb(MAX_BYTES)}).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) start(f);
            e.target.value = "";
          }}
        />
      </div>

      {file && phase !== "idle" && (
        <div className="rounded-3xl bg-white p-5 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{file.name}</p>
              <p className="text-sm text-slate-500">
                {mb(file.size)}
                {phase === "uploading" && (
                  <span className="text-blue-600">
                    {" "}
                    · {(speed / 1024 / 1024).toFixed(1)} MB/s · ETA: {eta}s
                  </span>
                )}
                {rows !== null && <span className="font-semibold text-green-600"> · {rows.toLocaleString()} rows parsed</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-blue-600">{percent}%</span>
              <button
                aria-label="Cancel"
                onClick={() => (busy ? xhrRef.current?.abort() : (setPhase("idle"), setFile(null)))}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
            <div
              className={`h-full rounded-full transition-all ${phase === "error" ? "bg-red-500" : "bg-blue-600"}`}
              style={{ width: `${phase === "error" ? 100 : percent}%` }}
            />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-100 p-4">
            <p className="font-bold">
              {phase === "error" ? "Error" : `Stage ${stage.n}/3`}: {stage.title}
            </p>
            <p className="text-sm text-slate-500">{stage.desc}</p>
          </div>

          {problems.length > 0 && (
            <ul className="mt-3 space-y-1 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {problems.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          )}

          {log && (
            <p
              className={`mt-3 rounded-full px-5 py-3 text-sm text-white ${phase === "error" ? "bg-red-900" : "bg-slate-900"}`}
            >
              {log}
            </p>
          )}
        </div>
      )}
    </div>
  );
}