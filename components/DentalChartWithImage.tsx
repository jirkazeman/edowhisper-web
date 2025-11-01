"use client";

import { useState } from "react";
import Image from "next/image";

interface ToothData {
  status?: string;
  note?: string;
  hasCaries?: boolean;
}

interface DentalChartProps {
  teeth?: { [key: string]: ToothData };
  notes?: string;
}

// Pozice každého zubu na obrázku (procenta z celkové šířky/výšky)
// Tyto hodnoty se musí přizpůsobit podle skutečného obrázku
const toothPositions: { [key: string]: { x: number; y: number; row: number } } = {
  // Horní řada - korunky
  "18": { x: 5, y: 15, row: 1 },
  "17": { x: 12, y: 15, row: 1 },
  "16": { x: 19, y: 15, row: 1 },
  "15": { x: 26, y: 15, row: 1 },
  "14": { x: 33, y: 15, row: 1 },
  "13": { x: 40, y: 15, row: 1 },
  "12": { x: 45, y: 15, row: 1 },
  "11": { x: 48, y: 15, row: 1 },
  
  "21": { x: 52, y: 15, row: 1 },
  "22": { x: 55, y: 15, row: 1 },
  "23": { x: 60, y: 15, row: 1 },
  "24": { x: 67, y: 15, row: 1 },
  "25": { x: 74, y: 15, row: 1 },
  "26": { x: 81, y: 15, row: 1 },
  "27": { x: 88, y: 15, row: 1 },
  "28": { x: 95, y: 15, row: 1 },
  
  // Dolní řada - kořeny
  "48": { x: 5, y: 85, row: 4 },
  "47": { x: 12, y: 85, row: 4 },
  "46": { x: 19, y: 85, row: 4 },
  "45": { x: 26, y: 85, row: 4 },
  "44": { x: 33, y: 85, row: 4 },
  "43": { x: 40, y: 85, row: 4 },
  "42": { x: 45, y: 85, row: 4 },
  "41": { x: 48, y: 85, row: 4 },
  
  "31": { x: 52, y: 85, row: 4 },
  "32": { x: 55, y: 85, row: 4 },
  "33": { x: 60, y: 85, row: 4 },
  "34": { x: 67, y: 85, row: 4 },
  "35": { x: 74, y: 85, row: 4 },
  "36": { x: 81, y: 85, row: 4 },
  "37": { x: 88, y: 85, row: 4 },
  "38": { x: 95, y: 85, row: 4 },
};

export default function DentalChartWithImage({ teeth = {}, notes }: DentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

  const getToothColor = (toothId: string) => {
    const tooth = teeth[toothId];
    if (!tooth) return "transparent";
    
    if (tooth.hasCaries) return "rgba(239, 68, 68, 0.6)"; // červená
    if (tooth.status === "missing") return "rgba(156, 163, 175, 0.6)"; // šedá
    if (tooth.status === "crown") return "rgba(234, 179, 8, 0.6)"; // žlutá
    if (tooth.status === "filling") return "rgba(59, 130, 246, 0.6)"; // modrá
    if (tooth.note) return "rgba(59, 130, 246, 0.4)"; // světle modrá
    
    return "transparent";
  };

  return (
    <div className="relative w-full h-full">
      {/* Background image */}
      <div className="relative w-full aspect-[2/1]">
        <Image
          src="/images/dental-chart-bg.jpeg"
          alt="Zubní schéma"
          fill
          className="object-contain"
          priority
        />
        
        {/* Tooth data overlays */}
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
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredTooth(toothId)}
              onMouseLeave={() => setHoveredTooth(null)}
            >
              {hasData && (
                <div
                  className="w-6 h-6 rounded-full border-2 border-white cursor-pointer transition-transform hover:scale-125"
                  style={{ backgroundColor: getToothColor(toothId) }}
                  title={tooth.note || tooth.status || undefined}
                >
                  <span className="text-[8px] text-white font-bold flex items-center justify-center h-full">
                    {toothId}
                  </span>
                </div>
              )}
              
              {/* Hover tooltip */}
              {hoveredTooth === toothId && hasData && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                  <div className="font-semibold">{toothId}</div>
                  {tooth.status && <div className="text-gray-300">{tooth.status}</div>}
                  {tooth.note && <div className="text-gray-400 max-w-[200px]">{tooth.note}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Notes */}
      {notes && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <span className="font-semibold">Poznámky: </span>
          <span>{notes}</span>
        </div>
      )}
    </div>
  );
}
