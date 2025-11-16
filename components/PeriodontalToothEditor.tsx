"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PeriodontalToothEditorProps {
  toothId: string;
  initialData?: {
    bleeding?: boolean;
    depth?: number[]; // [MB, B, DB, ML, L, DL]
  };
  onSave: (toothId: string, data: { bleeding?: boolean; depth?: number[] }) => void;
  onClose: () => void;
}

export default function PeriodontalToothEditor({
  toothId,
  initialData,
  onSave,
  onClose,
}: PeriodontalToothEditorProps) {
  const [bleeding, setBleeding] = useState(initialData?.bleeding || false);
  const [depths, setDepths] = useState<number[]>(
    initialData?.depth || [0, 0, 0, 0, 0, 0]
  );

  const handleDepthChange = (index: number, value: string) => {
    // Povolit prázdnou hodnotu nebo číslo
    if (value === '') {
      const newDepths = [...depths];
      newDepths[index] = 0;
      setDepths(newDepths);
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 16) return;
    
    const newDepths = [...depths];
    newDepths[index] = numValue;
    setDepths(newDepths);
  };

  const handleSave = () => {
    onSave(toothId, {
      bleeding,
      depth: depths,
    });
    onClose();
  };

  const getDepthColor = (depth: number): string => {
    if (depth >= 6) return 'bg-red-100 border-red-300 text-red-700';
    if (depth >= 4) return 'bg-orange-100 border-orange-300 text-orange-700';
    return 'bg-gray-50 border-gray-300 text-gray-700';
  };

  const isLowerTooth = /^[34]/.test(toothId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Parodontální status - zub {toothId}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLowerTooth ? 'Dolní čelist' : 'Horní čelist'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vizualizace zubu - editovatelná pole */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Vizualizace</h3>
            
            {/* Zub rozdělený vodorovně - vnější a vnitřní */}
            <div className="flex flex-col items-center gap-2">
              {/* Vnější plocha (bukální) - MB, B, DB */}
              <div className="flex gap-1">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">MB</div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="16"
                    value={depths[0] === 0 ? '' : depths[0]}
                    onChange={(e) => handleDepthChange(0, e.target.value)}
                    className={`w-16 h-12 border-2 rounded text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${getDepthColor(depths[0])}`}
                    placeholder="0"
                    autoFocus
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">B</div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="16"
                    value={depths[1] === 0 ? '' : depths[1]}
                    onChange={(e) => handleDepthChange(1, e.target.value)}
                    className={`w-16 h-12 border-2 rounded text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${getDepthColor(depths[1])}`}
                    placeholder="0"
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">DB</div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="16"
                    value={depths[2] === 0 ? '' : depths[2]}
                    onChange={(e) => handleDepthChange(2, e.target.value)}
                    className={`w-16 h-12 border-2 rounded text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${getDepthColor(depths[2])}`}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Dělící čára */}
              <div className="w-full border-t-2 border-gray-300"></div>

              {/* Vnitřní plocha (lingvální/palatinální) - ML, L, DL */}
              <div className="flex gap-1">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">ML</div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="16"
                    value={depths[3] === 0 ? '' : depths[3]}
                    onChange={(e) => handleDepthChange(3, e.target.value)}
                    className={`w-16 h-12 border-2 rounded text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${getDepthColor(depths[3])}`}
                    placeholder="0"
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">L</div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="16"
                    value={depths[4] === 0 ? '' : depths[4]}
                    onChange={(e) => handleDepthChange(4, e.target.value)}
                    className={`w-16 h-12 border-2 rounded text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${getDepthColor(depths[4])}`}
                    placeholder="0"
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">DL</div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="16"
                    value={depths[5] === 0 ? '' : depths[5]}
                    onChange={(e) => handleDepthChange(5, e.target.value)}
                    className={`w-16 h-12 border-2 rounded text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${getDepthColor(depths[5])}`}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center">
              <strong>Vnější plocha:</strong> Bukální (MB, B, DB) | <strong>Vnitřní plocha:</strong> Lingvální/palatinální (ML, L, DL)
            </div>
          </div>

          {/* Grafická reprezentace hloubky kapes */}
          <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Vizuální graf hloubky kapes</h3>
            
            <div className="relative">
              {/* Grid pro zuby - 3 sloupce pro MB, B, DB */}
              <div className="grid grid-cols-6 gap-0 border-2 border-gray-400 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                {/* MB - vnější */}
                <div className="relative bg-orange-50 border-r border-gray-300">
                  <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-semibold text-gray-600 mt-1">MB</div>
                  {/* Hloubková výplň */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all ${
                      depths[0] >= 6 ? 'bg-red-300' : depths[0] >= 4 ? 'bg-orange-300' : 'bg-green-200'
                    }`}
                    style={{ height: `${Math.min((depths[0] / 12) * 100, 100)}%` }}
                  >
                    <div className="absolute top-1 left-0 right-0 text-center font-bold text-sm">
                      {depths[0] > 0 ? depths[0] : ''}
                    </div>
                  </div>
                </div>

                {/* B - vnější */}
                <div className="relative bg-orange-50 border-r border-gray-300">
                  <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-semibold text-gray-600 mt-1">B</div>
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all ${
                      depths[1] >= 6 ? 'bg-red-300' : depths[1] >= 4 ? 'bg-orange-300' : 'bg-green-200'
                    }`}
                    style={{ height: `${Math.min((depths[1] / 12) * 100, 100)}%` }}
                  >
                    <div className="absolute top-1 left-0 right-0 text-center font-bold text-sm">
                      {depths[1] > 0 ? depths[1] : ''}
                    </div>
                  </div>
                </div>

                {/* DB - vnější */}
                <div className="relative bg-orange-50 border-r-2 border-gray-500">
                  <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-semibold text-gray-600 mt-1">DB</div>
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all ${
                      depths[2] >= 6 ? 'bg-red-300' : depths[2] >= 4 ? 'bg-orange-300' : 'bg-green-200'
                    }`}
                    style={{ height: `${Math.min((depths[2] / 12) * 100, 100)}%` }}
                  >
                    <div className="absolute top-1 left-0 right-0 text-center font-bold text-sm">
                      {depths[2] > 0 ? depths[2] : ''}
                    </div>
                  </div>
                </div>

                {/* ML - vnitřní */}
                <div className="relative bg-blue-50 border-r border-gray-300">
                  <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-semibold text-gray-600 mt-1">ML</div>
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all ${
                      depths[3] >= 6 ? 'bg-red-300' : depths[3] >= 4 ? 'bg-orange-300' : 'bg-green-200'
                    }`}
                    style={{ height: `${Math.min((depths[3] / 12) * 100, 100)}%` }}
                  >
                    <div className="absolute top-1 left-0 right-0 text-center font-bold text-sm">
                      {depths[3] > 0 ? depths[3] : ''}
                    </div>
                  </div>
                </div>

                {/* L - vnitřní */}
                <div className="relative bg-blue-50 border-r border-gray-300">
                  <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-semibold text-gray-600 mt-1">L</div>
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all ${
                      depths[4] >= 6 ? 'bg-red-300' : depths[4] >= 4 ? 'bg-orange-300' : 'bg-green-200'
                    }`}
                    style={{ height: `${Math.min((depths[4] / 12) * 100, 100)}%` }}
                  >
                    <div className="absolute top-1 left-0 right-0 text-center font-bold text-sm">
                      {depths[4] > 0 ? depths[4] : ''}
                    </div>
                  </div>
                </div>

                {/* DL - vnitřní */}
                <div className="relative bg-blue-50">
                  <div className="absolute top-0 left-0 right-0 text-center text-[10px] font-semibold text-gray-600 mt-1">DL</div>
                  <div 
                    className={`absolute bottom-0 left-0 right-0 transition-all ${
                      depths[5] >= 6 ? 'bg-red-300' : depths[5] >= 4 ? 'bg-orange-300' : 'bg-green-200'
                    }`}
                    style={{ height: `${Math.min((depths[5] / 12) * 100, 100)}%` }}
                  >
                    <div className="absolute top-1 left-0 right-0 text-center font-bold text-sm">
                      {depths[5] > 0 ? depths[5] : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legenda pro graf */}
              <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-50 border border-gray-400"></div>
                  <span className="text-gray-600">Vnější (bukální)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-50 border border-gray-400"></div>
                  <span className="text-gray-600">Vnitřní (lingvální)</span>
                </div>
              </div>
            </div>
          </div>


          {/* Krvácení */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="bleeding"
              checked={bleeding}
              onChange={(e) => setBleeding(e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
            />
            <label htmlFor="bleeding" className="text-sm font-medium text-gray-700 cursor-pointer">
              Krvácení při sondáži
            </label>
          </div>

          {/* Legenda */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
            <div className="font-semibold text-blue-900 mb-2">Hodnocení hloubky:</div>
            <div className="space-y-1 text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-200 border border-gray-400"></div>
                <span><strong>0-3mm:</strong> Zdravé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-200 border border-orange-400"></div>
                <span><strong>4-5mm:</strong> Mírné onemocnění parodontu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-200 border border-red-400"></div>
                <span><strong>6+mm:</strong> Závažné onemocnění parodontu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - výrazná tlačítka */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-300 px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-semibold text-base"
          >
            ❌ Zrušit
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition font-semibold text-base shadow-lg"
          >
            ✅ Uložit změny
          </button>
        </div>
      </div>
    </div>
  );
}

