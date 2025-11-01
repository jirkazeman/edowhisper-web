"use client";

import { useState } from "react";

interface ToothData {
  id: string;
  status?: "healthy" | "missing" | "crown" | "filling" | "root_canal" | "implant" | "bridge" | null;
  note?: string;
  hasCaries?: boolean;
}

interface DentalChartProps {
  teeth?: { [key: string]: ToothData };
  notes?: string;
}

export default function DentalChartProfessional({ teeth = {}, notes = "" }: DentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

  const getStatusColor = (toothId: string) => {
    const tooth = teeth[toothId];
    if (!tooth || !tooth.status) return "transparent";
    
    const colors: { [key: string]: string } = {
      missing: "#ef4444",
      crown: "#eab308", 
      filling: "#3b82f6",
      root_canal: "#dc2626",
      implant: "#a855f7",
      bridge: "#f97316",
      healthy: "#22c55e"
    };
    
    return colors[tooth.status] || (tooth.hasCaries ? "#fca5a5" : "transparent");
  };

  // FDI notation
  const upperRight = ["18", "17", "16", "15", "14", "13", "12", "11"];
  const upperLeft = ["21", "22", "23", "24", "25", "26", "27", "28"];
  const lowerRight = ["48", "47", "46", "45", "44", "43", "42", "41"];
  const lowerLeft = ["31", "32", "33", "34", "35", "36", "37", "38"];

  const renderTooth = (toothId: string, index: number, isLeft: boolean) => {
    const tooth = teeth[toothId];
    const hasData = tooth && (tooth.status || tooth.note || tooth.hasCaries);
    const color = getStatusColor(toothId);

    return (
      <div
        key={toothId}
        className="relative flex flex-col items-center"
        onMouseEnter={() => setHoveredTooth(toothId)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Tooth visualization - 4 views stacked */}
        <div className="w-full aspect-[1/4] bg-gray-50 rounded border border-gray-200 relative overflow-hidden">
          {hasData && (
            <div 
              className="absolute inset-0 opacity-30"
              style={{ backgroundColor: color }}
            />
          )}
          
          {/* Tooth number at top */}
          <div className="absolute top-0 left-0 right-0 text-center text-[8px] font-semibold text-gray-700 bg-white/80">
            {toothId}
          </div>

          {/* Status indicators */}
          {tooth?.hasCaries && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          )}
          {tooth?.note && (
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          )}
        </div>

        {/* Hover tooltip */}
        {hoveredTooth === toothId && hasData && (
          <div className="absolute z-50 bottom-full mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
            <div className="font-semibold">{toothId}</div>
            {tooth.status && <div className="text-gray-300">{tooth.status}</div>}
            {tooth.note && <div className="text-gray-400 max-w-[150px] truncate">{tooth.note}</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded p-2 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[11px] font-semibold text-gray-700">Zubní kříž</h3>
        <div className="flex gap-2 text-[8px]">
          <div className="flex items-center gap-0.5">
            <div className="w-2 h-2 bg-yellow-500 rounded"></div>
            <span>Korunka</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
            <span>Výplň</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-2 h-2 bg-red-600 rounded"></div>
            <span>Endo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-17 gap-0.5">
        {/* Upper jaw */}
        {upperRight.map((id, i) => renderTooth(id, i, false))}
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-px h-full bg-gray-300"></div>
        </div>
        {upperLeft.map((id, i) => renderTooth(id, i, true))}

        {/* Spacer */}
        <div className="col-span-17 h-1"></div>

        {/* Lower jaw */}
        {lowerRight.map((id, i) => renderTooth(id, i, false))}
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-px h-full bg-gray-300"></div>
        </div>
        {lowerLeft.map((id, i) => renderTooth(id, i, true))}
      </div>

      {notes && (
        <div className="mt-1 p-1 bg-blue-50 rounded text-[9px] border border-blue-200">
          <span className="font-medium text-blue-900">Poznámky: </span>
          <span className="text-blue-800">{notes}</span>
        </div>
      )}
    </div>
  );
}

