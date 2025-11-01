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

// Přesné pozice zubů na obrázku (v procentech)
const TOOTH_POSITIONS: { [key: string]: { x: number; y: number } } = {
  // Horní čelist - pravá strana (18-11)
  "18": { x: 5, y: 12 },
  "17": { x: 11, y: 12 },
  "16": { x: 17, y: 12 },
  "15": { x: 23, y: 12 },
  "14": { x: 29, y: 12 },
  "13": { x: 35, y: 12 },
  "12": { x: 41, y: 12 },
  "11": { x: 47, y: 12 },
  
  // Horní čelist - levá strana (21-28)
  "21": { x: 53, y: 12 },
  "22": { x: 59, y: 12 },
  "23": { x: 65, y: 12 },
  "24": { x: 71, y: 12 },
  "25": { x: 77, y: 12 },
  "26": { x: 83, y: 12 },
  "27": { x: 89, y: 12 },
  "28": { x: 95, y: 12 },
  
  // Dolní čelist - pravá strana (48-41)
  "48": { x: 5, y: 88 },
  "47": { x: 11, y: 88 },
  "46": { x: 17, y: 88 },
  "45": { x: 23, y: 88 },
  "44": { x: 29, y: 88 },
  "43": { x: 35, y: 88 },
  "42": { x: 41, y: 88 },
  "41": { x: 47, y: 88 },
  
  // Dolní čelist - levá strana (31-38)
  "31": { x: 53, y: 88 },
  "32": { x: 59, y: 88 },
  "33": { x: 65, y: 88 },
  "34": { x: 71, y: 88 },
  "35": { x: 77, y: 88 },
  "36": { x: 83, y: 88 },
  "37": { x: 89, y: 88 },
  "38": { x: 95, y: 88 },
};

export default function DentalChartWithImage({ teeth = {}, notes = "" }: DentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

  const getToothColor = (toothId: string) => {
    const tooth = teeth[toothId];
    if (!tooth || !tooth.status) return "transparent";
    
    switch (tooth.status) {
      case "missing":
        return "#ef4444"; // red
      case "crown":
        return "#eab308"; // yellow
      case "filling":
        return "#3b82f6"; // blue
      case "root_canal":
        return "#dc2626"; // dark red
      case "implant":
        return "#a855f7"; // purple
      case "bridge":
        return "#f97316"; // orange
      case "healthy":
        return "#22c55e"; // green
      default:
        return tooth.hasCaries ? "#fca5a5" : "transparent";
    }
  };

  const renderToothMarker = (toothId: string) => {
    const pos = TOOTH_POSITIONS[toothId];
    const tooth = teeth[toothId];
    const hasData = tooth && (tooth.status || tooth.note || tooth.hasCaries);
    
    if (!hasData) return null;

    return (
      <div
        key={toothId}
        className="absolute"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onMouseEnter={() => setHoveredTooth(toothId)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Status indicator */}
        <div
          className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all cursor-pointer hover:scale-125"
          style={{ backgroundColor: getToothColor(toothId) }}
        />
        
        {/* Tooltip on hover */}
        {hoveredTooth === toothId && (
          <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-xl">
            <div className="font-semibold">Zub {toothId}</div>
            {tooth.status && <div className="text-gray-300">{tooth.status}</div>}
            {tooth.note && <div className="text-gray-400 text-[10px] max-w-[200px] truncate">{tooth.note}</div>}
            {tooth.hasCaries && <div className="text-red-400 text-[10px]">⚠️ Kaz</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Stav chrupu (zubní kříž)</h3>
        <div className="flex gap-2 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Korunka</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Výplň</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span>Endodoncie</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Chybí</span>
          </div>
        </div>
      </div>

      {/* Dental chart with background image */}
      <div className="relative w-full" style={{ paddingBottom: '45%' }}>
        {/* SVG dental chart as background */}
        <svg 
          viewBox="0 0 1200 540" 
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.15 }}
        >
          {/* Upper jaw - simple tooth shapes */}
          {Array.from({ length: 16 }, (_, i) => {
            const x = 50 + i * 70;
            return (
              <g key={`upper-${i}`}>
                <ellipse cx={x} cy={80} rx={25} ry={35} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
                <text x={x} y={85} textAnchor="middle" fontSize="12" fill="#6b7280">
                  {i < 8 ? 18 - i : 21 + (i - 8)}
                </text>
              </g>
            );
          })}
          
          {/* Lower jaw */}
          {Array.from({ length: 16 }, (_, i) => {
            const x = 50 + i * 70;
            return (
              <g key={`lower-${i}`}>
                <ellipse cx={x} cy={460} rx={25} ry={35} fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
                <text x={x} y={465} textAnchor="middle" fontSize="12" fill="#6b7280">
                  {i < 8 ? 48 - i : 31 + (i - 8)}
                </text>
              </g>
            );
          })}
          
          {/* Center line */}
          <line x1="600" y1="50" x2="600" y2="490" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5"/>
        </svg>

        {/* Data overlay */}
        <div className="absolute inset-0">
          {Object.keys(TOOTH_POSITIONS).map(renderToothMarker)}
        </div>
      </div>

      {/* Manual notes */}
      {notes && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs border border-blue-200">
          <span className="font-medium text-blue-900">Manuální záznam: </span>
          <span className="text-blue-800">{notes}</span>
        </div>
      )}
    </div>
  );
}

