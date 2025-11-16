"use client";

import React from 'react';
import { X, CheckCircle, AlertCircle, Plus, Minus, Edit3 } from 'lucide-react';
import type { HumanCorrections } from '@/lib/types';

interface CorrectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  corrections?: HumanCorrections;
  correctionCount?: number;
  correctedAt?: string;
}

export default function CorrectionsModal({
  isOpen,
  onClose,
  corrections = {},
  correctionCount = 0,
  correctedAt,
}: CorrectionsModalProps) {
  
  if (!isOpen) return null;

  const hasCorrections = correctionCount > 0 && Object.keys(corrections).length > 0;

  // Ikona podle typu akce
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'added':
        return <Plus className="text-green-600" size={16} />;
      case 'removed':
        return <Minus className="text-red-600" size={16} />;
      case 'corrected':
        return <Edit3 className="text-blue-600" size={16} />;
      default:
        return <AlertCircle className="text-gray-600" size={16} />;
    }
  };

  // Barva podle typu akce
  const getActionColor = (action: string) => {
    switch (action) {
      case 'added':
        return 'bg-green-50 border-green-200';
      case 'removed':
        return 'bg-red-50 border-red-200';
      case 'corrected':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Popisek akce česky
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'added':
        return 'Přidáno';
      case 'removed':
        return 'Odstraněno';
      case 'corrected':
        return 'Opraveno';
      default:
        return 'Změněno';
    }
  };

  // Formátovat název pole
  const formatFieldName = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
      lastName: 'Příjmení',
      personalIdNumber: 'Rodné číslo',
      generalAnamnesis: 'Obecná anamnéza',
      allergies: 'Alergie',
      stomatologicalAnamnesis: 'Stomatologická anamnéza',
      permanentMedication: 'Trvalá medikace',
      hygiene: 'Hygiena',
      gingiva: 'Dásně',
      tartar: 'Zubní kámen',
      caries: 'Kaz',
      mucosa: 'Sliznice',
      tongue: 'Jazyk',
      bob: 'BOP',
      cpitn: 'CPITN',
      fullTranscript: 'Přepis',
    };
    return fieldLabels[fieldName] || fieldName;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Opravy Hygienistky</h2>
              <p className="text-sm text-gray-500">
                {hasCorrections 
                  ? `${correctionCount} ${correctionCount === 1 ? 'oprava' : correctionCount < 5 ? 'opravy' : 'oprav'}`
                  : 'Žádné opravy'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasCorrections ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Perfektní Extrakce!
              </h3>
              <p className="text-gray-500">
                LLM extrahovalo data správně, hygienistka nemusela nic opravovat.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(corrections).map(([fieldName, correction]) => (
                <div
                  key={fieldName}
                  className={`border rounded-lg p-4 ${getActionColor(correction.action)}`}
                >
                  {/* Field name + action */}
                  <div className="flex items-center gap-2 mb-3">
                    {getActionIcon(correction.action)}
                    <span className="font-semibold text-gray-900">
                      {formatFieldName(fieldName)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600">
                      {getActionLabel(correction.action)}
                    </span>
                  </div>

                  {/* LLM value */}
                  {correction.action !== 'added' && correction.llm && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-600 mb-1">🤖 LLM (original):</div>
                      <div className="bg-white/70 rounded px-3 py-2 text-sm line-through text-gray-600">
                        {String(correction.llm)}
                      </div>
                    </div>
                  )}

                  {/* Human value */}
                  {correction.action !== 'removed' && correction.human && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">✏️ Hygienistka (opraveno):</div>
                      <div className="bg-white rounded px-3 py-2 text-sm font-medium text-gray-900">
                        {String(correction.human)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Timestamp */}
          {correctedAt && hasCorrections && (
            <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
              Opraveno: {new Date(correctedAt).toLocaleString('cs-CZ')}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 Tyto opravy budou použity pro fine-tuning LLM modelu
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

