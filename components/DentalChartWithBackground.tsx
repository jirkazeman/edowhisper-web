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

// Přesné pozice zubů podle FDI schématu (v procentech od levého horního rohu)
const toothPositions: { [key: string]: { x: number; y: number; quadrant: string } } = {
  // Horní pravý (18-11)
  "18": { x: 5, y: 8, quadrant: "upper-right" },
  "17": { x: 11, y: 8, quadrant: "upper-right" },
  "16": { x: 17, y: 8, quadrant: "upper-right" },
  "15": { x: 23, y: 8, quadrant: "upper-right" },
  "14": { x: 29, y: 8, quadrant: "upper-right" },
  "13": { x: 35, y: 8, quadrant: "upper-right" },
  "12": { x: 41, y: 8, quadrant: "upper-right" },
  "11": { x: 47, y: 8, quadrant: "upper-right" },
  
  // Horní levý (21-28)
  "21": { x: 53, y: 8, quadrant: "upper-left" },
  "22": { x: 59, y: 8, quadrant: "upper-left" },
  "23": { x: 65, y: 8, quadrant: "upper-left" },
  "24": { x: 71, y: 8, quadrant: "upper-left" },
  "25": { x: 77, y: 8, quadrant: "upper-left" },
  "26": { x: 83, y: 8, quadrant: "upper-left" },
  "27": { x: 89, y: 8, quadrant: "upper-left" },
  "28": { x: 95, y: 8, quadrant: "upper-left" },
  
  // Dolní pravý (48-41)
  "48": { x: 5, y: 92, quadrant: "lower-right" },
  "47": { x: 11, y: 92, quadrant: "lower-right" },
  "46": { x: 17, y: 92, quadrant: "lower-right" },
  "45": { x: 23, y: 92, quadrant: "lower-right" },
  "44": { x: 29, y: 92, quadrant: "lower-right" },
  "43": { x: 35, y: 92, quadrant: "lower-right" },
  "42": { x: 41, y: 92, quadrant: "lower-right" },
  "41": { x: 47, y: 92, quadrant: "lower-right" },
  
  // Dolní levý (31-38)
  "31": { x: 53, y: 92, quadrant: "lower-left" },
  "32": { x: 59, y: 92, quadrant: "lower-left" },
  "33": { x: 65, y: 92, quadrant: "lower-left" },
  "34": { x: 71, y: 92, quadrant: "lower-left" },
  "35": { x: 77, y: 92, quadrant: "lower-left" },
  "36": { x: 83, y: 92, quadrant: "lower-left" },
  "37": { x: 89, y: 92, quadrant: "lower-left" },
  "38": { x: 95, y: 92, quadrant: "lower-left" },
};

export default function DentalChartWithBackground({ teeth = {}, notes = "" }: DentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

  const getToothColor = (toothId: string) => {
    const tooth = teeth[toothId];
    if (!tooth) return "bg-blue-500";
    
    switch (tooth.status) {
      case "missing": return "bg-gray-400";
      case "crown": return "bg-yellow-500";
      case "filling": return "bg-blue-400";
      case "root_canal": return "bg-red-500";
      case "implant": return "bg-purple-500";
      case "bridge": return "bg-orange-500";
      case "healthy": return tooth.hasCaries ? "bg-red-300" : "bg-green-400";
      default: return tooth.hasCaries ? "bg-red-300" : "bg-blue-500";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "missing": return "Chybí";
      case "crown": return "Korunka";
      case "filling": return "Výplň";
      case "root_canal": return "Kořen";
      case "implant": return "Implantát";
      case "bridge": return "Most";
      case "healthy": return "Zdravý";
      default: return "Bez stavu";
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-700">Zubní kříž (FDI)</h3>
        <div className="flex gap-2 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded"></div>
            <span>Korunka</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded"></div>
            <span>Výplň</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span>Kořen</span>
          </div>
        </div>
      </div>

      {/* Dental chart with background */}
      <div className="relative w-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
        {/* Central dividing line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 z-0"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 z-0"></div>
        
        {/* Quadrant labels */}
        <div className="absolute top-1 left-1 text-[8px] text-gray-400 font-mono">HR</div>
        <div className="absolute top-1 right-1 text-[8px] text-gray-400 font-mono">HL</div>
        <div className="absolute bottom-1 left-1 text-[8px] text-gray-400 font-mono">DR</div>
        <div className="absolute bottom-1 right-1 text-[8px] text-gray-400 font-mono">DL</div>

        <div className="relative w-full h-64">
          {/* Map all tooth positions */}
          {Object.entries(toothPositions).map(([toothId, pos]) => {
            const tooth = teeth[toothId];
            const hasData = tooth && (tooth.status || tooth.note || tooth.hasCaries);
            
            return (
              <div
                key={toothId}
                className="absolute"
                style={{ 
                  left: `${pos.x}%`, 
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseEnter={() => setHoveredTooth(toothId)}
                onMouseLeave={() => setHoveredTooth(null)}
              >
                {/* Tooth indicator */}
                <div className="relative">
                  <div 
                    className={`w-6 h-6 rounded-full ${getToothColor(toothId)} ${
                      hasData ? 'ring-2 ring-offset-1' : 'opacity-40'
                    } transition-all cursor-pointer hover:scale-125 flex items-center justify-center`}
                  >
                    <span className="text-[8px] font-bold text-white">{toothId}</span>
                  </div>
                  
                  {/* Caries indicator */}
                  {tooth?.hasCaries && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-white"></div>
                  )}
                  
                  {/* Note indicator */}
                  {tooth?.note && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border border-white"></div>
                  )}
                </div>

                {/* Hover tooltip */}
                {hoveredTooth === toothId && hasData && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 
                                bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg 
                                whitespace-nowrap pointer-events-none">
                    <div className="font-semibold">{toothId}: {getStatusLabel(tooth.status || undefined)}</div>
                    {tooth.note && (
                      <div className="text-gray-300 mt-0.5">{tooth.note.substring(0, 30)}...</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-[10px]">
          <span className="font-medium text-gray-700">Poznámky: </span>
          <span className="text-gray-600">{notes}</span>
        </div>
      )}
    </div>
  );
}

