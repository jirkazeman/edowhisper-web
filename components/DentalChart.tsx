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

export default function DentalChart({ teeth = {}, notes = "" }: DentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

  // FDI notation - čtyři kvadranty
  const upperRight = Array.from({ length: 8 }, (_, i) => `1${i + 1}`); // 11-18
  const upperLeft = Array.from({ length: 8 }, (_, i) => `2${i + 1}`); // 21-28
  const lowerLeft = Array.from({ length: 8 }, (_, i) => `3${i + 1}`); // 31-38
  const lowerRight = Array.from({ length: 8 }, (_, i) => `4${i + 1}`); // 41-48

  const getToothColor = (toothId: string) => {
    const tooth = teeth[toothId];
    if (!tooth) return "fill-white stroke-gray-300";
    
    switch (tooth.status) {
      case "missing":
        return "fill-gray-200 stroke-gray-400";
      case "crown":
        return "fill-yellow-200 stroke-yellow-500";
      case "filling":
        return "fill-blue-200 stroke-blue-500";
      case "root_canal":
        return "fill-red-200 stroke-red-500";
      case "implant":
        return "fill-purple-200 stroke-purple-500";
      case "bridge":
        return "fill-orange-200 stroke-orange-500";
      case "healthy":
      default:
        return tooth.hasCaries ? "fill-red-100 stroke-red-400" : "fill-green-50 stroke-green-400";
    }
  };

  const renderTooth = (toothId: string, x: number, y: number, isUpper: boolean) => {
    const tooth = teeth[toothId];
    const hasData = tooth && (tooth.status || tooth.note || tooth.hasCaries);

    return (
      <g
        key={toothId}
        onMouseEnter={() => setHoveredTooth(toothId)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Tooth rectangle */}
        <rect
          x={x}
          y={y}
          width="35"
          height="50"
          rx="4"
          className={`${getToothColor(toothId)} ${hasData ? 'stroke-2' : 'stroke-1'} transition-all cursor-pointer`}
        />
        
        {/* Tooth number */}
        <text
          x={x + 17.5}
          y={y + (isUpper ? 45 : 15)}
          textAnchor="middle"
          className="text-[10px] font-semibold fill-gray-700"
        >
          {toothId}
        </text>

        {/* Caries indicator */}
        {tooth?.hasCaries && (
          <circle
            cx={x + 28}
            cy={y + 8}
            r="4"
            className="fill-red-500"
          />
        )}

        {/* Note indicator */}
        {tooth?.note && (
          <circle
            cx={x + 7}
            cy={y + 8}
            r="3"
            className="fill-blue-500"
          />
        )}

        {/* Hover tooltip */}
        {hoveredTooth === toothId && hasData && (
          <g>
            <rect
              x={x - 10}
              y={y - 30}
              width="120"
              height="auto"
              className="fill-gray-900 opacity-90"
              rx="4"
            />
            <text
              x={x + 50}
              y={y - 15}
              textAnchor="middle"
              className="text-xs fill-white font-medium"
            >
              {tooth.status || "Bez stavu"}
            </text>
            {tooth.note && (
              <text
                x={x + 50}
                y={y - 5}
                textAnchor="middle"
                className="text-[10px] fill-white"
              >
                {tooth.note.substring(0, 20)}...
              </text>
            )}
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Zubní kříž (FDI)</h3>
        <div className="flex gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-200 border border-yellow-500 rounded"></div>
            <span>Korunka</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-200 border border-blue-500 rounded"></div>
            <span>Výplň</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 border border-red-500 rounded"></div>
            <span>Kořen</span>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 650 260" className="w-full h-auto">
        {/* Upper jaw */}
        <g>
          {/* Upper right (18-11) */}
          {upperRight.reverse().map((id, i) => renderTooth(id, 10 + i * 40, 10, true))}
          
          {/* Upper left (21-28) */}
          {upperLeft.map((id, i) => renderTooth(id, 330 + i * 40, 10, true))}
        </g>

        {/* Center line */}
        <line x1="320" y1="10" x2="320" y2="250" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />

        {/* Lower jaw */}
        <g>
          {/* Lower right (48-41) */}
          {lowerRight.reverse().map((id, i) => renderTooth(id, 10 + i * 40, 200, false))}
          
          {/* Lower left (31-38) */}
          {lowerLeft.map((id, i) => renderTooth(id, 330 + i * 40, 200, false))}
        </g>
      </svg>

      {/* Notes */}
      {notes && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
          <span className="font-medium text-gray-700">Poznámky: </span>
          <span className="text-gray-600">{notes}</span>
        </div>
      )}
    </div>
  );
}

