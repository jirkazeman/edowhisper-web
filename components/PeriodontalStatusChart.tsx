"use client";

import React, { useState } from 'react';
import PeriodontalToothEditor from './PeriodontalToothEditor';

interface PeriodontalProtocol {
  [toothNumber: string]: {
    bleeding?: boolean;
    depth?: number[]; // [MB, B, DB, ML, L, DL] - 6 hodnot
  };
}

interface PeriodontalStatusChartProps {
  protocol: PeriodontalProtocol;
  readonly?: boolean;
  onChange?: (protocol: PeriodontalProtocol) => void;
}

const getDepthColor = (depth: number): string => {
  if (depth >= 6) return '#DC2626'; // Red
  if (depth >= 4) return '#F97316'; // Orange
  return '#374151'; // Gray
};

const getDepthBgColor = (depth: number): string => {
  if (depth >= 6) return '#FEE2E2'; // Light red
  if (depth >= 4) return '#FFEDD5'; // Light orange
  return '#F3F4F6'; // Light gray
};

export default function PeriodontalStatusChart({
  protocol,
  readonly = true,
  onChange,
}: PeriodontalStatusChartProps) {
  const [editingToothId, setEditingToothId] = useState<string | null>(null);
  
  // Horní a dolní řady zubů
  const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
  const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

  // Uložit data zubu
  const handleSaveTooth = (toothId: string, data: { bleeding?: boolean; depth?: number[] }) => {
    const newProtocol = {
      ...protocol,
      [toothId]: data,
    };
    onChange?.(newProtocol);
    setEditingToothId(null);
  };

  // Renderovat jeden zub - vizuální graf hloubky kapes
  const renderTooth = (toothId: string, index: number, isLower: boolean) => {
    const toothData = protocol[toothId];
    const hasData = toothData && toothData.depth && toothData.depth.length === 6;

    // Získat jednotlivé hodnoty: MB, B, DB (vnější), ML, L, DL (vnitřní)
    const depths = hasData && toothData.depth ? toothData.depth : [0, 0, 0, 0, 0, 0];
    
    // Maximální hloubka pro škálování (např. 12mm = 100% výšky)
    const maxDepth = 12;

    return (
      <div 
        key={toothId} 
        className={`flex flex-col items-center gap-0.5 relative ${!readonly ? 'cursor-pointer hover:opacity-80' : ''}`}
        onClick={() => !readonly && setEditingToothId(toothId)}
        title={!readonly ? `Klikněte pro editaci zubu ${toothId}` : undefined}
      >
        {!isLower && <div className="text-[11px] text-gray-600 font-semibold">{toothId}</div>}
        
        {/* Kontejner zubu s grafem - rozdělený vodorovně */}
        <div className={`w-20 h-14 border rounded bg-white relative overflow-hidden ${
          hasData ? 'border-gray-300' : 'border-dashed border-gray-300 bg-gray-50'
        }`}>
          
          {/* Horní polovina - VNĚJŠÍ plocha (bukální) - MB, B, DB */}
          <div className="absolute top-0 left-0 right-0 h-1/2 grid grid-cols-3 gap-0 border-b border-gray-300">
            {/* MB - vnější */}
            <div className="relative bg-orange-50/30 border-r border-gray-200">
              <div 
                className={`absolute bottom-0 left-0 right-0 transition-all ${
                  depths[0] >= 6 ? 'bg-red-300' : depths[0] >= 4 ? 'bg-orange-300' : depths[0] > 0 ? 'bg-green-200' : ''
                }`}
                style={{ height: `${Math.min((depths[0] / maxDepth) * 200, 100)}%` }}
              >
                {depths[0] > 0 && (
                  <div className="absolute top-0 left-0 right-0 text-center text-[8px] font-bold text-gray-800 leading-tight">
                    {Math.round(depths[0] * 10) / 10}
                  </div>
                )}
              </div>
            </div>

            {/* B - vnější */}
            <div className="relative bg-orange-50/30 border-r border-gray-200">
              <div 
                className={`absolute bottom-0 left-0 right-0 transition-all ${
                  depths[1] >= 6 ? 'bg-red-300' : depths[1] >= 4 ? 'bg-orange-300' : depths[1] > 0 ? 'bg-green-200' : ''
                }`}
                style={{ height: `${Math.min((depths[1] / maxDepth) * 200, 100)}%` }}
              >
                {depths[1] > 0 && (
                  <div className="absolute top-0 left-0 right-0 text-center text-[8px] font-bold text-gray-800 leading-tight">
                    {Math.round(depths[1] * 10) / 10}
                  </div>
                )}
              </div>
            </div>

            {/* DB - vnější */}
            <div className="relative bg-orange-50/30">
              <div 
                className={`absolute bottom-0 left-0 right-0 transition-all ${
                  depths[2] >= 6 ? 'bg-red-300' : depths[2] >= 4 ? 'bg-orange-300' : depths[2] > 0 ? 'bg-green-200' : ''
                }`}
                style={{ height: `${Math.min((depths[2] / maxDepth) * 200, 100)}%` }}
              >
                {depths[2] > 0 && (
                  <div className="absolute top-0 left-0 right-0 text-center text-[8px] font-bold text-gray-800 leading-tight">
                    {Math.round(depths[2] * 10) / 10}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dolní polovina - VNITŘNÍ plocha (lingvální) - ML, L, DL - ZRCADLOVĚ (grafy rostou nahoru) */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 grid grid-cols-3 gap-0">
            {/* ML - vnitřní */}
            <div className="relative bg-blue-50/30 border-r border-gray-200">
              <div 
                className={`absolute top-0 left-0 right-0 transition-all ${
                  depths[3] >= 6 ? 'bg-red-300' : depths[3] >= 4 ? 'bg-orange-300' : depths[3] > 0 ? 'bg-green-200' : ''
                }`}
                style={{ height: `${Math.min((depths[3] / maxDepth) * 200, 100)}%` }}
              >
                {depths[3] > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold text-gray-800 leading-tight">
                    {Math.round(depths[3] * 10) / 10}
                  </div>
                )}
              </div>
            </div>

            {/* L - vnitřní */}
            <div className="relative bg-blue-50/30 border-r border-gray-200">
              <div 
                className={`absolute top-0 left-0 right-0 transition-all ${
                  depths[4] >= 6 ? 'bg-red-300' : depths[4] >= 4 ? 'bg-orange-300' : depths[4] > 0 ? 'bg-green-200' : ''
                }`}
                style={{ height: `${Math.min((depths[4] / maxDepth) * 200, 100)}%` }}
              >
                {depths[4] > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold text-gray-800 leading-tight">
                    {Math.round(depths[4] * 10) / 10}
                  </div>
                )}
              </div>
            </div>

            {/* DL - vnitřní */}
            <div className="relative bg-blue-50/30">
              <div 
                className={`absolute top-0 left-0 right-0 transition-all ${
                  depths[5] >= 6 ? 'bg-red-300' : depths[5] >= 4 ? 'bg-orange-300' : depths[5] > 0 ? 'bg-green-200' : ''
                }`}
                style={{ height: `${Math.min((depths[5] / maxDepth) * 200, 100)}%` }}
              >
                {depths[5] > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold text-gray-800 leading-tight">
                    {Math.round(depths[5] * 10) / 10}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Krvácení indikátor - větší */}
          {toothData?.bleeding && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md" />
          )}
        </div>

        {isLower && <div className="text-[11px] text-gray-600 font-semibold">{toothId}</div>}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-800">Parodontální status</h3>
        </div>

        {!readonly && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <strong>Editace:</strong> Klikněte na zub pro otevření detailního editoru.
          </div>
        )}
        
        {/* Scrollovací kontejner - horizontální scroll */}
        <div className="overflow-x-auto w-full">
          <div className="inline-block min-w-full">
            <div className="space-y-4">
              {/* Horní čelist */}
              <div>
                <div className="text-xs text-gray-500 font-medium mb-2">Horní čelist</div>
                <div className="flex gap-1">
                  {upperTeeth.map((toothId, index) => renderTooth(toothId, index, false))}
                </div>
              </div>

              {/* Dělící čára */}
              <div className="border-t-2 border-gray-300"></div>

              {/* Dolní čelist */}
              <div>
                <div className="text-xs text-gray-500 font-medium mb-2">Dolní čelist</div>
                <div className="flex gap-1">
                  {lowerTeeth.map((toothId, index) => renderTooth(toothId, index, true))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#374151' }}></div>
              <span className="text-gray-600">0-3mm (zdravé)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#F97316' }}></div>
              <span className="text-gray-600">4-5mm (mírné)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#DC2626' }}></div>
              <span className="text-gray-600">6+mm (závažné)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-600 border border-white"></div>
              <span className="text-gray-600">Krvácení</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <strong>Horní řada:</strong> Vnější plocha bukální (MB, B, DB zleva doprava) | <strong>Dolní řada:</strong> Vnitřní plocha lingvální/palatinální (ML, L, DL zleva doprava)
          </p>
        </div>
      </div>

      {/* Modal pro editaci */}
      {editingToothId && (
        <PeriodontalToothEditor
          toothId={editingToothId}
          initialData={protocol[editingToothId]}
          onSave={handleSaveTooth}
          onClose={() => setEditingToothId(null)}
        />
      )}
    </>
  );
}
