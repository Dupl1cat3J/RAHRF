"use client";
import dynamic from "next/dynamic";

const HazardHeatMapLoader = dynamic(() => import("@/components/HazardHeatMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full animate-pulse rounded-xl bg-gray-200" />
  ),
});

export default HazardHeatMapLoader;