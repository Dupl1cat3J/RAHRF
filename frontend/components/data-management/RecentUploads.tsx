"use client";

import { useEffect, useState } from "react";

type Log = {
  id: string;
  fileName: string;
  format: string;
  recordsAdded: number;
  status: string;
  detail: {
    imported?: Record<string, number>;
    errors?: { sheet: string; row: number; column?: string; message: string }[];
    totalErrors?: number;
    message?: string;
  } | null;
  uploadedAt: string;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Bangkok",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export default function RecentUploads({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<Log[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<Log | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/data/uploads", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Log[]) => !cancelled && (setRows(data), setFailed(false)))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const th = "px-4 py-3 text-left text-sm font-semibold text-slate-700";

  return (
    <>
      <div className="overflow-x-auto rounded-3xl bg-white shadow-md">
        <table className="w-full min-w-[720px]">
          <thead className="bg-indigo-50/60">
            <tr>
              <th className={th}>Source File Name</th>
              <th className={th}>Format</th>
              <th className={th}>Records Added</th>
              <th className={th}>Upload Date</th>
              <th className={th}>Status</th>
              <th className={th}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {rows?.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-4 font-medium">{r.fileName}</td>
                <td className="px-4 py-4">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{r.format}</span>
                </td>
                <td className="px-4 py-4">{r.recordsAdded.toLocaleString()} rows</td>
                <td className="px-4 py-4 text-slate-600">{fmtDate(r.uploadedAt)} ICT</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      r.status === "Success" ? "bg-green-200 text-green-900" : "bg-red-100 text-red-700"
                    }`}
                  >
                    • {r.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => setSelected(r)} className="font-semibold text-blue-600 hover:underline">
                    View Details ↗
                  </button>
                </td>
              </tr>
            ))}
            {rows && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No uploads yet.
                </td>
              </tr>
            )}
            {!rows && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {failed ? "Cannot load upload history. Is the backend running?" : "Loading..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold">{selected.fileName}</h3>
            <p className="text-sm text-slate-500">
              {selected.status} · {fmtDate(selected.uploadedAt)} ICT
            </p>
            <div className="mt-4 space-y-1 text-sm">
              {selected.detail?.imported &&
                Object.entries(selected.detail.imported).map(([sheet, n]) => (
                  <p key={sheet} className="flex justify-between border-b border-slate-100 py-1">
                    <span>{sheet}</span>
                    <span className="font-semibold">{n.toLocaleString()} rows</span>
                  </p>
                ))}
              {selected.detail?.message && <p className="text-red-700">{selected.detail.message}</p>}
              {selected.detail?.errors?.map((e, i) => (
                <p key={i} className="text-red-700">
                  • {e.sheet} row {e.row}
                  {e.column ? ` (${e.column})` : ""}: {e.message}
                </p>
              ))}
              {selected.detail?.totalErrors && selected.detail.totalErrors > (selected.detail.errors?.length ?? 0) && (
                <p className="text-slate-500">…and {selected.detail.totalErrors - (selected.detail.errors?.length ?? 0)} more.</p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}