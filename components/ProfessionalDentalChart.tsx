"use client";

import { useState } from "react";
import { Maximize2, X } from "lucide-react";

interface ToothData {
  // Horní tabulka
  mobility?: number; // 0-3
  implant?: boolean;
  furcation?: number; // 0-3
  bleedingOnProbing?: boolean;
  plaque?: boolean;
  
  // Gingival Margin (3 měření na zub - buccal)
  gingivalMargin?: [number, number, number]; // mm
  
  // Probing Depth (3 měření na zub - buccal)
  probingDepth?: [number, number, number]; // mm
  
  // Palatal measurements (stejné jako buccal)
  gingivalMarginPalatal?: [number, number, number];
  probingDepthPalatal?: [number, number, number];
  
  // Dolní tabulka
  note?: string;
}

interface DentalChartData {
  teeth: { [key: string]: ToothData };
  date?: string;
}

interface Props {
  data?: DentalChartData;
  onUpdate?: (data: DentalChartData) => void;
  readOnly?: boolean;
}

export default function ProfessionalDentalChart({ data, onUpdate, readOnly = true }: Props) {
  const [chartData, setChartData] = useState<DentalChartData>(data || { teeth: {} });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChildTeeth, setIsChildTeeth] = useState(false); // Přepínač: Dospělí / Děti
  
  // FDI notation
  // Dospělí (permanentní zuby)
  const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
  const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];
  
  // Děti (dočasné/mléčné zuby)
  const upperChildTeeth = ["55", "54", "53", "52", "51", "61", "62", "63", "64", "65"];
  const lowerChildTeeth = ["85", "84", "83", "82", "81", "71", "72", "73", "74", "75"];
  
  // Aktivní sada zubů podle přepínače
  const activeUpperTeeth = isChildTeeth ? upperChildTeeth : upperTeeth;
  const activeLowerTeeth = isChildTeeth ? lowerChildTeeth : lowerTeeth;
  
  // Výpočet statistik
  const calculateStats = () => {
    let totalProbing = 0;
    let probingCount = 0;
    let totalPlaque = 0;
    let plaqueCount = 0;
    let totalBleeding = 0;
    let bleedingCount = 0;
    
    Object.values(chartData.teeth).forEach(tooth => {
      if (tooth.probingDepth) {
        tooth.probingDepth.forEach(val => {
          if (val > 0) {
            totalProbing += val;
            probingCount++;
          }
        });
      }
      if (tooth.probingDepthPalatal) {
        tooth.probingDepthPalatal.forEach(val => {
          if (val > 0) {
            totalProbing += val;
            probingCount++;
          }
        });
      }
      if (tooth.plaque !== undefined) {
        plaqueCount++;
        if (tooth.plaque) totalPlaque++;
      }
      if (tooth.bleedingOnProbing !== undefined) {
        bleedingCount++;
        if (tooth.bleedingOnProbing) totalBleeding++;
      }
    });
    
    return {
      meanProbingDepth: probingCount > 0 ? (totalProbing / probingCount).toFixed(1) : "0.0",
      plaquePercent: plaqueCount > 0 ? Math.round((totalPlaque / plaqueCount) * 100) : 0,
      bleedingPercent: bleedingCount > 0 ? Math.round((totalBleeding / bleedingCount) * 100) : 0,
    };
  };
  
  const stats = calculateStats();
  
  // Render jednoho políčka v tabulce
  const TableCell = ({ value, center = true }: { value?: string | number | boolean; center?: boolean }) => (
    <div className={`border border-gray-300 h-6 flex items-center ${center ? 'justify-center' : 'px-1'} text-[10px]`}>
      {typeof value === 'boolean' ? (value ? '✓' : '') : (value || '')}
    </div>
  );
  
  // Render řady pro 3 měření (Gingival Margin / Probing Depth)
  const MeasurementRow = ({ values }: { values?: [number, number, number] }) => (
    <div className="grid grid-cols-3 gap-px">
      {[0, 1, 2].map(i => (
        <TableCell key={i} value={values?.[i] || 0} />
      ))}
    </div>
  );
  
  const chartContent = (
    <div className="text-xs font-mono">
        {/* HORNÍ ČELIST */}
        <div className="mb-6">
          {/* Horní tabulka */}
          <div className="mb-2">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
              {/* Čísla zubů */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
                {activeUpperTeeth.map(tooth => (
                  <div key={tooth} className="border border-gray-400 bg-gray-100 h-6 flex items-center justify-center text-[11px] font-semibold">
                    {tooth}
                  </div>
                ))}
              </div>
              
              {/* Mobility */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
                {activeUpperTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.mobility} />
                ))}
              </div>
              
              {/* Implant */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
                {activeUpperTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.implant} />
                ))}
              </div>
              
              {/* Furcation */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
                {activeUpperTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.furcation} />
                ))}
              </div>
              
              {/* Bleeding on Probing */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
                {activeUpperTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.bleedingOnProbing} />
                ))}
              </div>
              
              {/* Plaque */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
                {activeUpperTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.plaque} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Gingival Margin */}
          <div className="mb-1">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
              {activeUpperTeeth.map(tooth => (
                <MeasurementRow key={tooth} values={chartData.teeth[tooth]?.gingivalMargin} />
              ))}
            </div>
          </div>
          
          {/* Probing Depth */}
          <div className="mb-2">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
              {activeUpperTeeth.map(tooth => (
                <MeasurementRow key={tooth} values={chartData.teeth[tooth]?.probingDepth} />
              ))}
            </div>
          </div>
          
          {/* SVG Zuby - PLACEHOLDER */}
          <div className="h-32 bg-gray-50 border border-gray-300 flex items-center justify-center text-gray-400 text-xs">
            [Buccal View - Horní čelist]
          </div>
          
          <div className="h-32 bg-gray-50 border border-gray-300 flex items-center justify-center text-gray-400 text-xs mt-2">
            [Palatal View - Horní čelist]
          </div>
          
          {/* Gingival Margin Palatal */}
          <div className="mt-2 mb-1">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
              {activeUpperTeeth.map(tooth => (
                <MeasurementRow key={tooth} values={chartData.teeth[tooth]?.gingivalMarginPalatal} />
              ))}
            </div>
          </div>
          
          {/* Probing Depth Palatal */}
          <div className="mb-2">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeUpperTeeth.length}, minmax(0, 1fr))` }}>
              {activeUpperTeeth.map(tooth => (
                <MeasurementRow key={tooth} values={chartData.teeth[tooth]?.probingDepthPalatal} />
              ))}
            </div>
          </div>
        </div>
        
        {/* STATISTICS BAR */}
        <div className="my-4 p-2 bg-gray-100 border border-gray-300 flex items-center justify-center gap-6 text-[11px]">
          <span>Mean Probing Depth = <strong>{stats.meanProbingDepth} mm</strong></span>
          <span>Mean Attachment Level = <strong>0 mm</strong></span>
          <span><strong>{stats.plaquePercent} %</strong> Plaque</span>
          <span><strong>{stats.bleedingPercent} %</strong> Bleeding on Probing</span>
        </div>
        
        {/* DOLNÍ ČELIST - pouze když showLowerJaw = true (dětské zuby) */}
        {showLowerJaw && <div className="mt-6">
          {/* Gingival Margin Palatal */}
          <div className="mb-1">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
              {activeLowerTeeth.map(tooth => (
                <MeasurementRow key={tooth} values={chartData.teeth[tooth]?.gingivalMarginPalatal} />
              ))}
            </div>
          </div>
          
          {/* Probing Depth Palatal */}
          <div className="mb-2">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
              {activeLowerTeeth.map(tooth => (
                <MeasurementRow key={tooth} values={chartData.teeth[tooth]?.probingDepthPalatal} />
              ))}
            </div>
          </div>
          
          {/* SVG Zuby - PLACEHOLDER */}
          <div className="h-32 bg-gray-50 border border-gray-300 flex items-center justify-center text-gray-400 text-xs">
            [Palatal View - Dolní čelist]
          </div>
          
          <div className="h-32 bg-gray-50 border border-gray-300 flex items-center justify-center text-gray-400 text-xs mt-2">
            [Buccal View - Dolní čelist]
          </div>
          
          {/* Gingival Margin */}
          <div className="mt-2 mb-1">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
              {activeLowerTeeth.map(tooth => (
                <MeasurementRow key={tooth} values={chartData.teeth[tooth]?.gingivalMargin} />
              ))}
            </div>
          </div>
          
          {/* Probing Depth */}
          <div className="mb-2">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
              {activeLowerTeeth.map(tooth => (
                <MeasurementRow key={tooth} values={chartData.teeth[tooth]?.probingDepth} />
              ))}
            </div>
          </div>
          
          {/* Dolní tabulka */}
          <div className="mt-2">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
              {/* Plaque */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
                {activeLowerTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.plaque} />
                ))}
              </div>
              
              {/* Bleeding on Probing */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
                {activeLowerTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.bleedingOnProbing} />
                ))}
              </div>
              
              {/* Furcation */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
                {activeLowerTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.furcation} />
                ))}
              </div>
              
              {/* Note */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
                {activeLowerTeeth.map(tooth => (
                  <TableCell key={tooth} value={chartData.teeth[tooth]?.note} center={false} />
                ))}
              </div>
              
              {/* Čísla zubů */}
              <div className="col-span-full grid gap-px" style={{ gridTemplateColumns: `repeat(${activeLowerTeeth.length}, minmax(0, 1fr))` }}>
                {activeLowerTeeth.map(tooth => (
                  <div key={tooth} className="border border-gray-400 bg-gray-100 h-6 flex items-center justify-center text-[11px] font-semibold">
                    {tooth}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>}
      </div>
  );
  
  return (
    <>
      {/* Normal view */}
      <div className="bg-white p-4 rounded-lg shadow-sm relative">
        {/* Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {/* Toggle: Dospělí / Děti */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsChildTeeth(false)}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                !isChildTeeth ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dospělí
            </button>
            <button
              onClick={() => setIsChildTeeth(true)}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                isChildTeeth ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Děti
            </button>
          </div>
          
          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Zobrazit na celou obrazovku"
          >
            <Maximize2 size={20} className="text-gray-600" />
          </button>
        </div>
        
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
          
          <div className="max-w-[95vw] mx-auto">
            {chartContent}
          </div>
        </div>
      )}
    </>
  );
}

