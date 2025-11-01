"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

interface ToothData {
  status?: string;
  note?: string;
  hasCaries?: boolean;
  mobility?: number;
  implant?: boolean;
}

interface SimpleDentalChartProps {
  teeth?: { [key: string]: ToothData };
  notes?: string;
  isChildTeeth?: boolean;
}

// Pozice každého zubu na obrázku (v procentech)
// Tyto pozice jsou odhadnuté a budou se muset přesně doladit podle skutečného obrázku
const toothPositions: { [key: string]: { x: number; y: number; view: 'buccal-upper' | 'occlusal-upper' | 'occlusal-lower' | 'buccal-lower' } } = {
  // HORNÍ ČELIST - Buccal view (korunky) - řada 1
  "18": { x: 6, y: 12, view: 'buccal-upper' },
  "17": { x: 12, y: 12, view: 'buccal-upper' },
  "16": { x: 18, y: 12, view: 'buccal-upper' },
  "15": { x: 24, y: 12, view: 'buccal-upper' },
  "14": { x: 30, y: 12, view: 'buccal-upper' },
  "13": { x: 36, y: 12, view: 'buccal-upper' },
  "12": { x: 42, y: 12, view: 'buccal-upper' },
  "11": { x: 47, y: 12, view: 'buccal-upper' },
  
  "21": { x: 53, y: 12, view: 'buccal-upper' },
  "22": { x: 58, y: 12, view: 'buccal-upper' },
  "23": { x: 64, y: 12, view: 'buccal-upper' },
  "24": { x: 70, y: 12, view: 'buccal-upper' },
  "25": { x: 76, y: 12, view: 'buccal-upper' },
  "26": { x: 82, y: 12, view: 'buccal-upper' },
  "27": { x: 88, y: 12, view: 'buccal-upper' },
  "28": { x: 94, y: 12, view: 'buccal-upper' },
  
  // HORNÍ ČELIST - Occlusal view (žvýkací plochy) - řada 2
  "18-o": { x: 6, y: 30, view: 'occlusal-upper' },
  "17-o": { x: 12, y: 30, view: 'occlusal-upper' },
  "16-o": { x: 18, y: 30, view: 'occlusal-upper' },
  "15-o": { x: 24, y: 30, view: 'occlusal-upper' },
  "14-o": { x: 30, y: 30, view: 'occlusal-upper' },
  "13-o": { x: 36, y: 30, view: 'occlusal-upper' },
  "12-o": { x: 42, y: 30, view: 'occlusal-upper' },
  "11-o": { x: 47, y: 30, view: 'occlusal-upper' },
  
  "21-o": { x: 53, y: 30, view: 'occlusal-upper' },
  "22-o": { x: 58, y: 30, view: 'occlusal-upper' },
  "23-o": { x: 64, y: 30, view: 'occlusal-upper' },
  "24-o": { x: 70, y: 30, view: 'occlusal-upper' },
  "25-o": { x: 76, y: 30, view: 'occlusal-upper' },
  "26-o": { x: 82, y: 30, view: 'occlusal-upper' },
  "27-o": { x: 88, y: 30, view: 'occlusal-upper' },
  "28-o": { x: 94, y: 30, view: 'occlusal-upper' },
  
  // DOLNÍ ČELIST - Occlusal view - řada 3
  "48-o": { x: 6, y: 55, view: 'occlusal-lower' },
  "47-o": { x: 12, y: 55, view: 'occlusal-lower' },
  "46-o": { x: 18, y: 55, view: 'occlusal-lower' },
  "45-o": { x: 24, y: 55, view: 'occlusal-lower' },
  "44-o": { x: 30, y: 55, view: 'occlusal-lower' },
  "43-o": { x: 36, y: 55, view: 'occlusal-lower' },
  "42-o": { x: 42, y: 55, view: 'occlusal-lower' },
  "41-o": { x: 47, y: 55, view: 'occlusal-lower' },
  
  "31-o": { x: 53, y: 55, view: 'occlusal-lower' },
  "32-o": { x: 58, y: 55, view: 'occlusal-lower' },
  "33-o": { x: 64, y: 55, view: 'occlusal-lower' },
  "34-o": { x: 70, y: 55, view: 'occlusal-lower' },
  "35-o": { x: 76, y: 55, view: 'occlusal-lower' },
  "36-o": { x: 82, y: 55, view: 'occlusal-lower' },
  "37-o": { x: 88, y: 55, view: 'occlusal-lower' },
  "38-o": { x: 94, y: 55, view: 'occlusal-lower' },
  
  // DOLNÍ ČELIST - Buccal view (kořeny) - řada 4
  "48": { x: 6, y: 88, view: 'buccal-lower' },
  "47": { x: 12, y: 88, view: 'buccal-lower' },
  "46": { x: 18, y: 88, view: 'buccal-lower' },
  "45": { x: 24, y: 88, view: 'buccal-lower' },
  "44": { x: 30, y: 88, view: 'buccal-lower' },
  "43": { x: 36, y: 88, view: 'buccal-lower' },
  "42": { x: 42, y: 88, view: 'buccal-lower' },
  "41": { x: 47, y: 88, view: 'buccal-lower' },
  
  "31": { x: 53, y: 88, view: 'buccal-lower' },
  "32": { x: 58, y: 88, view: 'buccal-lower' },
  "33": { x: 64, y: 88, view: 'buccal-lower' },
  "34": { x: 70, y: 88, view: 'buccal-lower' },
  "35": { x: 76, y: 88, view: 'buccal-lower' },
  "36": { x: 82, y: 88, view: 'buccal-lower' },
  "37": { x: 88, y: 88, view: 'buccal-lower' },
  "38": { x: 94, y: 88, view: 'buccal-lower' },
};

export default function SimpleDentalChart({ teeth = {}, notes, isChildTeeth = false }: SimpleDentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getToothColor = (toothId: string) => {
    const tooth = teeth[toothId];
    if (!tooth) return "transparent";
    
    if (tooth.hasCaries) return "rgba(239, 68, 68, 0.7)"; // červená
    if (tooth.status === "missing") return "rgba(156, 163, 175, 0.7)"; // šedá
    if (tooth.status === "crown") return "rgba(234, 179, 8, 0.7)"; // žlutá
    if (tooth.status === "filling") return "rgba(59, 130, 246, 0.7)"; // modrá
    if (tooth.status === "implant") return "rgba(168, 85, 247, 0.7)"; // fialová
    if (tooth.note) return "rgba(34, 197, 94, 0.5)"; // zelená
    
    return "transparent";
  };

  const chartContent = (
    <div className="relative w-full">
      {/* Background Image */}
      <div className="relative w-full aspect-[16/9]">
        <Image
          src="/images/dental-chart-bg.jpeg"
          alt="Zubní kříž"
          fill
          className="object-contain"
          priority
        />
        
        {/* Tooth Data Overlays */}
        {Object.entries(toothPositions).map(([key, pos]) => {
          // Extrahuj číslo zubu (bez "-o" suffixu)
          const toothId = key.replace('-o', '');
          const tooth = teeth[toothId];
          const hasData = tooth && (tooth.status || tooth.note || tooth.hasCaries);
          
          if (!hasData) return null;
          
          return (
            <div
              key={key}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredTooth(toothId)}
              onMouseLeave={() => setHoveredTooth(null)}
            >
              {/* Data indicator */}
              <div
                className="w-5 h-5 rounded-full border-2 border-white cursor-pointer transition-all hover:scale-125 shadow-lg flex items-center justify-center"
                style={{ backgroundColor: getToothColor(toothId) }}
                title={tooth.note || tooth.status || undefined}
              >
                <span className="text-[8px] font-bold text-white">{toothId}</span>
              </div>
              
              {/* Hover tooltip */}
              {hoveredTooth === toothId && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-xl whitespace-nowrap z-50 min-w-[120px]">
                  <div className="font-semibold mb-1">Zub {toothId}</div>
                  {tooth.status && <div className="text-gray-300">Status: {tooth.status}</div>}
                  {tooth.mobility && <div className="text-gray-300">Mobilita: {tooth.mobility}</div>}
                  {tooth.implant && <div className="text-blue-300">Implantát</div>}
                  {tooth.hasCaries && <div className="text-red-300">Kaz</div>}
                  {tooth.note && <div className="text-gray-400 mt-1 max-w-[200px]">{tooth.note}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Korunka</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Výplň</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Implantát</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span>Chybí</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Kaz</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Poznámka</span>
        </div>
      </div>
      
      {/* Notes */}
      {notes && (
        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200 text-sm">
          <span className="font-semibold text-blue-900">Poznámky: </span>
          <span className="text-blue-800">{notes}</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Normal view */}
      <div className="bg-white p-4 rounded-lg shadow-sm relative">
        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition z-10"
          title="Zobrazit na celou obrazovku"
        >
          <Maximize2 size={20} className="text-gray-600" />
        </button>
        
        <h3 className="font-semibold text-sm mb-3">Zubní kříž</h3>
        {chartContent}
      </div>
      
      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto p-8">
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition z-10"
            title="Zavřít"
          >
            <X size={24} className="text-gray-600" />
          </button>
          
          <div className="max-w-[90vw] mx-auto">
            {chartContent}
          </div>
        </div>
      )}
    </>
  );
}

