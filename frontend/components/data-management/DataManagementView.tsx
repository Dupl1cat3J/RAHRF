"use client";

import { useState, type ReactNode } from "react";
import RecentUploads from "./RecentUploads";
import SourceStatusCards from "./SourceStatusCards";
import UploadPanel from "./UploadPanel";

type Tab = "api" | "upload";

function SectionHeader({ title, subtitle, tint, children }: { title: string; subtitle: string; tint: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}>{children}</div>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

const icon = "h-6 w-6";

export default function DataManagementView() {
  const [tab, setTab] = useState<Tab>("api");
  const [refreshKey, setRefreshKey] = useState(0);

  const tabButton = (value: Tab, label: string) => (
    <button
      onClick={() => setTab(value)}
      className={`flex-1 rounded-full px-6 py-3.5 text-base font-semibold transition ${
        tab === value ? "bg-blue-600 text-white shadow-md" : "text-slate-800 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Data Management</h1>
        <p className="mt-3 text-lg text-slate-700">
          Manage and update accident, traffic, hospital, and map data for PSU Hat Yai. Personal information is
          protected under PDPA.
        </p>
      </div>

      <div className="mx-auto flex max-w-3xl gap-2 rounded-full bg-white p-2 shadow-md">
        {tabButton("api", "Retrieve External Data (API)")}
        {tabButton("upload", "Upload Data Files (Excel/CSV)")}
      </div>

      {tab === "api" && (
        <section>
          <SectionHeader title="Data Source Status" subtitle="Connection Status" tint="bg-blue-100 text-blue-600">
            <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="4" width="16" height="5" rx="1.5" />
              <rect x="4" y="11" width="16" height="9" rx="1.5" />
            </svg>
          </SectionHeader>
          <SourceStatusCards />
        </section>
      )}

      <section>
        <SectionHeader
          title="Upload Data Files"
          subtitle="Files Are Automatically Converted Into The Database"
          tint="bg-red-100 text-red-500"
        >
          <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
          </svg>
        </SectionHeader>
        <UploadPanel onFinished={() => setRefreshKey((k) => k + 1)} />
      </section>

      <section>
        <SectionHeader
          title="Recent Data Uploads"
          subtitle="History Of Uploaded Files And Database Conversion Status"
          tint="bg-indigo-100 text-indigo-600"
        >
          <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" />
          </svg>
        </SectionHeader>
        <RecentUploads refreshKey={refreshKey} />
      </section>
    </div>
  );
}