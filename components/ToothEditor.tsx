"use client";

import { useState } from "react";
import { X, CheckCircle2, Circle, Award, Droplet, Activity, Wrench, Link } from "lucide-react";

interface ToothState {
  id: string;
  status?: 'healthy' | 'missing' | 'crown' | 'filling' | 'root_canal' | 'implant' | 'bridge' | null;
  note?: string;
  hasCaries?: boolean;
  hasNote?: boolean;
}

type ToothStatus = 'healthy' | 'missing' | 'crown' | 'filling' | 'root_canal' | 'implant' | 'bridge' | null;

interface ToothEditorProps {
  toothId: string;
  toothState?: ToothState;
  onSave: (state: ToothState) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: ToothStatus; label: string; icon: any }[] = [
  { value: 'healthy', label: 'Zdravý', icon: CheckCircle2 },
  { value: 'missing', label: 'Chybí', icon: Circle },
  { value: 'crown', label: 'Korunka', icon: Award },
  { value: 'filling', label: 'Výplň', icon: Droplet },
  { value: 'root_canal', label: 'Ošetřený kořen', icon: Activity },
  { value: 'implant', label: 'Implantát', icon: Wrench },
  { value: 'bridge', label: 'Můstek', icon: Link },
];

export default function ToothEditor({ toothId, toothState, onSave, onClose }: ToothEditorProps) {
  const [status, setStatus] = useState<ToothStatus>(toothState?.status || 'healthy');
  const [hasCaries, setHasCaries] = useState(toothState?.hasCaries || false);
  const [note, setNote] = useState(toothState?.note || '');

  const handleSave = () => {
    onSave({
      id: toothId,
      status,
      hasCaries,
      hasNote: note.trim().length > 0,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            Zub {toothId}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stav zubu */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Stav zubu
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = status === option.value;
              
              return (
                <button
                  key={option.value || 'healthy'}
                  onClick={() => setStatus(option.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Kaz */}
          <button
            onClick={() => setHasCaries(!hasCaries)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all mb-6 ${
              hasCaries
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300'
            }`}
          >
            {hasCaries ? (
              <CheckCircle2 size={24} className="text-red-500" />
            ) : (
              <Circle size={24} className="text-gray-400" />
            )}
            <span className="font-medium text-lg">Kaz</span>
          </button>

          {/* Poznámka */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Poznámka
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Dodatečné informace o zubu..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            Uložit
          </button>
        </div>
      </div>
    </>
  );
}




