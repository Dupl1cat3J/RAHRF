import DataManagementView from "@/components/data-management/DataManagementView";

// ย้ายไฟล์นี้ไปไว้ใน layout แอดมินของคุณ (header + แถบเมนู) เมื่อรวมกับหน้า Overview
export default function DataManagementPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <DataManagementView />
      </div>
    </div>
  );
}