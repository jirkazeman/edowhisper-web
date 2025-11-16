"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

interface ToothData {
  status?: 'healthy' | 'missing' | 'crown' | 'filling' | 'root_canal' | 'implant' | 'bridge' | null;
  note?: string;
  hasCaries?: boolean;
  mobility?: number;
  implant?: boolean;
}

interface SimpleDentalChartProps {
  teeth?: { [key: string]: ToothData };
  notes?: string;
  isChildTeeth?: boolean;
  fontSize?: number; // Pro propojení se zoom funkcionalitou
  onToothClick?: (toothId: string) => void; // Callback pro kliknutí na zub
  readonly?: boolean; // Pokud true, nelze editovat
}

// Pozice každého zubu na obrázku (v procentech)
// Tyto pozice jsou odhadnuté a budou se muset přesně doladit podle skutečného obrázku
const toothPositions: { [key: string]: { x: number; y: number; view: 'buccal-upper' | 'occlusal-upper' | 'occlusal-lower' | 'buccal-lower' } } = {
  // HORNÍ ČELIST - Buccal view (korunky) - řada 1 (zobrazujeme jen tuto řadu nahoře)
  "18": { x: 6, y: 30, view: 'buccal-upper' },
  "17": { x: 12, y: 30, view: 'buccal-upper' },
  "16": { x: 18, y: 30, view: 'buccal-upper' },
  "15": { x: 24, y: 30, view: 'buccal-upper' },
  "14": { x: 30, y: 30, view: 'buccal-upper' },
  "13": { x: 36, y: 30, view: 'buccal-upper' },
  "12": { x: 42, y: 30, view: 'buccal-upper' },
  "11": { x: 47, y: 30, view: 'buccal-upper' },
  
  "21": { x: 53, y: 30, view: 'buccal-upper' },
  "22": { x: 58, y: 30, view: 'buccal-upper' },
  "23": { x: 64, y: 30, view: 'buccal-upper' },
  "24": { x: 70, y: 30, view: 'buccal-upper' },
  "25": { x: 76, y: 30, view: 'buccal-upper' },
  "26": { x: 82, y: 30, view: 'buccal-upper' },
  "27": { x: 88, y: 30, view: 'buccal-upper' },
  "28": { x: 94, y: 30, view: 'buccal-upper' },
  
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
  
  // DOLNÍ ČELIST - Buccal view (kořeny) - řada 4 (zobrazujeme jen tuto řadu dole, posunuto o 3× kolečko dolů)
  "48": { x: 6, y: 70, view: 'buccal-lower' },
  "47": { x: 12, y: 70, view: 'buccal-lower' },
  "46": { x: 18, y: 70, view: 'buccal-lower' },
  "45": { x: 24, y: 70, view: 'buccal-lower' },
  "44": { x: 30, y: 70, view: 'buccal-lower' },
  "43": { x: 36, y: 70, view: 'buccal-lower' },
  "42": { x: 42, y: 70, view: 'buccal-lower' },
  "41": { x: 47, y: 70, view: 'buccal-lower' },
  
  "31": { x: 53, y: 70, view: 'buccal-lower' },
  "32": { x: 58, y: 70, view: 'buccal-lower' },
  "33": { x: 64, y: 70, view: 'buccal-lower' },
  "34": { x: 70, y: 70, view: 'buccal-lower' },
  "35": { x: 76, y: 70, view: 'buccal-lower' },
  "36": { x: 82, y: 70, view: 'buccal-lower' },
  "37": { x: 88, y: 70, view: 'buccal-lower' },
  "38": { x: 94, y: 70, view: 'buccal-lower' },
};

export default function SimpleDentalChart({ 
  teeth = {}, 
  notes, 
  isChildTeeth = false, 
  fontSize = 100,
  onToothClick,
  readonly = false,
}: SimpleDentalChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Velikost tečky podle zoom (30px pro optimální viditelnost)
  // Minimální zoom pro prvky - při 70% zoom jsou prvky stále 85%
  const minZoom = 85;
  const effectiveZoom = Math.max(minZoom, fontSize);
  const markerSize = (30 * effectiveZoom) / 100;

  // PŘESNĚ STEJNÉ BARVY JAKO V MOBILNÍ APLIKACI (Odontogram.tsx)
  const getToothColor = (toothId: string) => {
    const tooth = teeth[toothId];
    if (!tooth) return "#FFFFFF"; // Bílá pro nedefinované (místo transparent)
    
    const { status, hasCaries } = tooth;
    
    // PRIORITA: Kaz je vždy červený!
    if (hasCaries) return "#FF6B6B"; // Červená (systemRed)
    
    switch (status) {
      case 'missing':
        return "#E5E5EA"; // Šedá (missing light)
      case 'crown':
        return "#FFD60A"; // Žlutá (systemYellow)
      case 'filling':
        return "#4E73DF"; // Modrá (systemBlue)
      case 'root_canal':
        return "#E879F9"; // Fialová (Purple)
      case 'implant':
        return "#72E4AD"; // Zelená (systemGreen)
      case 'bridge':
        return "#F97316"; // Oranžová (Orange)
      case 'healthy':
      default:
        return "#FFFFFF"; // Bílá (cardBackground)
    }
  };

  // Kontrola, jestli má zub relevantní data (ne healthy)
  const hasRelevantData = (tooth: ToothData | undefined) => {
    if (!tooth) return false;
    if (tooth.hasCaries) return true;
    if (tooth.note && tooth.note.trim()) return true;
    if (tooth.status && tooth.status !== 'healthy') return true;
    return false;
  };

  // Zjisti, jestli má zubní kříž nějaká data
  const hasAnyData = Object.values(teeth).some(tooth => hasRelevantData(tooth));

  // Počeštěné názvy stavů
  const getToothStatusLabel = (status?: string | null): string | undefined => {
    if (!status) return undefined;
    
    switch (status) {
      case 'healthy': return 'Zdravý';
      case 'missing': return 'Chybí';
      case 'crown': return 'Korunka';
      case 'filling': return 'Výplň';
      case 'root_canal': return 'Ošetřený kořen';
      case 'implant': return 'Implantát';
      case 'bridge': return 'Můstek';
      default: return status;
    }
  };

  // Pokud nejsou žádná data a je readonly mode → zobraz message
  if (!hasAnyData && readonly) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">📋 Nejsou data pro zubní kříž</p>
        <p className="text-gray-400 text-sm mt-2">
          Zubní kříž nebyl vyplněn pro tento záznam
        </p>
      </div>
    );
  }

  const chartContent = (
    <div className="relative w-full">
        {/* HORNÍ ČELIST */}
        <div className="relative w-full aspect-[8/1]">
          <Image
            src="/images/tooth_nahore.png"
            alt="Horní zuby"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* DOLNÍ ČELIST */}
        <div className="relative w-full aspect-[8/1]">
          <Image
            src="/images/tooth_dole.png"
            alt="Dolní zuby"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Fullscreen button - nad obrázkem */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg transition z-50 bg-white/80 backdrop-blur-sm"
          title="Zobrazit na celou obrazovku"
        >
          <Maximize2 size={20} className="text-gray-600" />
        </button>
        
        {/* Tooth Data Overlays */}
        {Object.entries(toothPositions).map(([key, pos]) => {
          // Extrahuj číslo zubu (bez "-o" suffixu)
          const toothId = key.replace('-o', '');
          const tooth = teeth[toothId];
          
          // Zobrazit pouze zuby s relevantními daty (ne healthy)
          if (!hasRelevantData(tooth) && readonly) return null;
          
          // Zjisti, jestli je to dolní zub (31-38, 41-48)
          const isLowerTooth = /^[34]/.test(toothId);
          
          return (
            <div
              key={key}
              className="absolute pointer-events-none flex flex-col items-center"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredTooth(toothId)}
              onMouseLeave={() => setHoveredTooth(null)}
            >
              {/* Pro dolní zuby: číslo NAD kruhem v šedém kruhu */}
              {isLowerTooth && (
                <div 
                  className="mb-1 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300"
                  style={{ 
                    width: `${markerSize * 0.85}px`,
                    height: `${markerSize * 0.85}px`,
                  }}
                >
                  <span 
                    className="font-semibold pointer-events-none"
                    style={{ 
                      fontSize: `${markerSize * 0.45}px`,
                      color: '#8E8E93'
                    }}
                  >
                    {toothId}
                  </span>
                </div>
              )}
              
              {/* Data indicator - zaoblený vrchol pro dolní zuby */}
              <div
                className={`pointer-events-auto border-2 border-gray-400 transition-all hover:scale-125 shadow-lg flex items-center justify-center ${
                  !readonly ? 'cursor-pointer' : ''
                }`}
                style={{ 
                  backgroundColor: getToothColor(toothId),
                  width: `${markerSize}px`,
                  height: `${markerSize}px`,
                  // Zaoblený vrchol pro dolní zuby (jako v mobilní aplikaci)
                  borderRadius: isLowerTooth ? '50% 50% 8px 8px' : '50%',
                  borderTopLeftRadius: isLowerTooth ? '50%' : '50%',
                  borderTopRightRadius: isLowerTooth ? '50%' : '50%',
                  borderBottomLeftRadius: isLowerTooth ? '8px' : '50%',
                  borderBottomRightRadius: isLowerTooth ? '8px' : '50%',
                }}
                title={tooth?.note || getToothStatusLabel(tooth?.status) || `Zub ${toothId}`}
                onClick={() => {
                  if (!readonly && onToothClick) {
                    onToothClick(toothId);
                  }
                }}
              >
                {/* Kruh je prázdný - čísla jsou mimo */}
              </div>
              
              {/* Pro horní zuby: číslo POD kruhem v šedém kruhu */}
              {!isLowerTooth && (
                <div 
                  className="mt-1 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300"
                  style={{ 
                    width: `${markerSize * 0.85}px`,
                    height: `${markerSize * 0.85}px`,
                  }}
                >
                  <span 
                    className="font-semibold pointer-events-none"
                    style={{ 
                      fontSize: `${markerSize * 0.45}px`,
                      color: '#8E8E93'
                    }}
                  >
                    {toothId}
                  </span>
                </div>
              )}
              
              {/* Hover tooltip - POČEŠTĚNO */}
              {hoveredTooth === toothId && tooth && (
                <div className="pointer-events-none absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-xl whitespace-nowrap z-50 min-w-[120px]">
                  <div className="font-semibold mb-1">Zub {toothId}</div>
                  {tooth.status && <div className="text-gray-300">{getToothStatusLabel(tooth.status)}</div>}
                  {tooth.mobility && <div className="text-gray-300">Mobilita: {tooth.mobility}</div>}
                  {tooth.hasCaries && <div className="text-red-300">⚠️ Kaz</div>}
                  {tooth.note && <div className="text-gray-400 mt-1 max-w-[200px]">{tooth.note}</div>}
                </div>
              )}
            </div>
          );
        })}
      
      {/* Legend - PŘESNÉ BARVY JAKO V MOBILNÍ APPCE (zobraz pouze pokud jsou data) */}
      {hasAnyData && (
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFD60A' }}></div>
            <span>Korunka</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4E73DF' }}></div>
            <span>Výplň</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E879F9' }}></div>
            <span>Ošetřený kořen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#72E4AD' }}></div>
            <span>Implantát</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
            <span>Můstek</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E5E5EA' }}></div>
            <span>Chybí</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6B6B' }}></div>
            <span>Kaz</span>
          </div>
        </div>
      )}
      
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
      <div className="bg-white rounded-lg shadow-sm">
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

