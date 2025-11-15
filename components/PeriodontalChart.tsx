"use client";

import React from 'react';

interface PeriodontalProtocol {
  [toothNumber: string]: {
    bleeding?: boolean;
    depth?: number[]; // [MB, B, DB, ML, L, DL]
  };
}

interface PeriodontalChartProps {
  protocol: PeriodontalProtocol;
  readonly?: boolean;
}

// FDI notation
const UPPER_RIGHT: string[] = ['18', '17', '16', '15', '14', '13', '12', '11'];
const UPPER_LEFT: string[] = ['21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_RIGHT: string[] = ['48', '47', '46', '45', '44', '43', '42', '41'];
const LOWER_LEFT: string[] = ['31', '32', '33', '34', '35', '36', '37', '38'];

export default function PeriodontalChart({
  protocol,
  readonly = true,
}: PeriodontalChartProps) {
  const hasAnyData = Object.keys(protocol).some(
    (toothId) => protocol[toothId]?.depth && protocol[toothId].depth!.length === 6
  );

  if (!hasAnyData) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nejsou data pro parodontální vyšetření
      </div>
    );
  }

  const getDepthColor = (depth: number): string => {
    if (depth >= 6) return 'text-red-600 font-bold';
    if (depth >= 4) return 'text-orange-500 font-semibold';
    return 'text-gray-700';
  };

  const renderToothDepth = (toothId: string, isUpper: boolean) => {
    const toothData = protocol[toothId];
    if (!toothData || !toothData.depth || toothData.depth.length !== 6) {
      return null;
    }

    const depths = toothData.depth;
    const hasBleeding = toothData.bleeding === true;

    if (isUpper) {
      // Horní zub: MB(top-left), B(top), DB(top-right), ML(bottom-left), L(bottom), DL(bottom-right)
      return (
        <div className="relative w-full h-full flex flex-col justify-center items-center p-1">
          <div className="flex justify-between w-full px-1">
            <span className={`text-xs ${getDepthColor(depths[0])}`}>{depths[0]}</span>
            <span className={`text-sm font-bold ${getDepthColor(depths[1])}`}>{depths[1]}</span>
            <span className={`text-xs ${getDepthColor(depths[2])}`}>{depths[2]}</span>
          </div>
          <div className="flex justify-between w-full px-1 mt-1">
            <span className={`text-xs ${getDepthColor(depths[3])}`}>{depths[3]}</span>
            <span className={`text-base font-bold ${getDepthColor(depths[4])}`}>{depths[4]}</span>
            <span className={`text-xs ${getDepthColor(depths[5])}`}>{depths[5]}</span>
          </div>
          {hasBleeding && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      );
    } else {
      // Dolní zub: MB(bottom-left), B(bottom), DB(bottom-right), ML(top-left), L(top), DL(top-right)
      return (
        <div className="relative w-full h-full flex flex-col justify-center items-center p-1">
          <div className="flex justify-between w-full px-1">
            <span className={`text-xs ${getDepthColor(depths[3])}`}>{depths[3]}</span>
            <span className={`text-sm font-bold ${getDepthColor(depths[4])}`}>{depths[4]}</span>
            <span className={`text-xs ${getDepthColor(depths[5])}`}>{depths[5]}</span>
          </div>
          <div className="flex justify-between w-full px-1 mt-1">
            <span className={`text-xs ${getDepthColor(depths[0])}`}>{depths[0]}</span>
            <span className={`text-base font-bold ${getDepthColor(depths[1])}`}>{depths[1]}</span>
            <span className={`text-xs ${getDepthColor(depths[2])}`}>{depths[2]}</span>
          </div>
          {hasBleeding && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      );
    }
  };

  const renderTooth = (toothId: string, isUpper: boolean) => {
    const hasData = protocol[toothId] && protocol[toothId].depth;
    
    return (
      <div key={toothId} className="flex flex-col items-center m-1">
        <div className="w-12 h-12 border border-gray-300 rounded bg-white flex items-center justify-center relative">
          {hasData ? (
            renderToothDepth(toothId, isUpper)
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1">{toothId}</span>
      </div>
    );
  };

  const renderJaw = (teeth: string[], isUpper: boolean) => (
    <div className="flex flex-wrap">
      {teeth.map((toothId) => renderTooth(toothId, isUpper))}
    </div>
  );

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] p-4 bg-gray-50 rounded-lg">
        {/* Horní čelist */}
        <div className="flex mb-2">
          <div className="flex-1">
            {renderJaw(UPPER_RIGHT, true)}
          </div>
          <div className="w-5" />
          <div className="flex-1">
            {renderJaw(UPPER_LEFT, true)}
          </div>
        </div>

        {/* Dělící čára */}
        <div className="h-0.5 bg-gray-300 my-2" />

        {/* Dolní čelist */}
        <div className="flex mt-2">
          <div className="flex-1">
            {renderJaw(LOWER_RIGHT, false)}
          </div>
          <div className="w-5" />
          <div className="flex-1">
            {renderJaw(LOWER_LEFT, false)}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500 mb-2 font-mono">
            MB | B | DB | ML | L | DL
          </div>
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-700 rounded-full" />
              <span className="text-gray-600">0-3mm</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-gray-600">4-5mm</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-600 rounded-full" />
              <span className="text-gray-600">6+mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

