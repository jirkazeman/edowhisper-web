"use client";

import React from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { ValidationResult } from '@/lib/services/llmValidationService';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: ValidationResult | null;
  onApplyFix?: (field: string, value: any) => void;
}

export default function ValidationModal({
  isOpen,
  onClose,
  validation,
  onApplyFix,
}: ValidationModalProps) {
  if (!isOpen || !validation) return null;

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-300';
      case 'medium':
        return 'bg-orange-50 border-orange-300';
      case 'low':
        return 'bg-yellow-50 border-yellow-300';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <XCircle className="text-red-500" size={20} />;
      case 'medium':
        return <AlertTriangle className="text-orange-500" size={20} />;
      case 'low':
        return <Info className="text-yellow-500" size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🔍 Validační report
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {validation.validator_llm} • {validation.validation_timestamp && new Date(validation.validation_timestamp).toLocaleString('cs-CZ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title="Zavřít"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overall Summary */}
          <div className={`p-6 rounded-lg border-2 ${validation.is_valid ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-start gap-4">
              {validation.is_valid ? (
                <CheckCircle className="text-green-600 mt-1" size={32} />
              ) : (
                <AlertTriangle className="text-red-600 mt-1" size={32} />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {validation.is_valid ? '✅ Extrakce je validní' : '⚠️ Nalezeny nesrovnalosti'}
                </h3>
                <p className="text-gray-700 mb-4">{validation.overall_assessment}</p>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Důvěra validátora:</span>
                    <div className="text-2xl font-bold mt-1">{(validation.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <span className="font-medium">Shoda s primárním LLM:</span>
                    <div className="text-2xl font-bold mt-1">{validation.agreement_percentage}%</div>
                  </div>
                  <div>
                    <span className="font-medium">Celkem problémů:</span>
                    <div className="text-2xl font-bold mt-1">
                      {validation.hallucinations.length + validation.missing_data.length + validation.negation_errors.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hallucinations */}
          {validation.hallucinations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <XCircle className="text-red-500" size={20} />
                Možné halucinace ({validation.hallucinations.length})
              </h3>
              <div className="space-y-3">
                {validation.hallucinations.map((h, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-2 ${getSeverityColor(h.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(h.severity)}
                      <div className="flex-1">
                        <div className="font-mono text-sm text-blue-600 font-semibold mb-2">
                          {h.field}
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-600">Primární LLM extrahovalo:</span>
                            <div className="bg-white p-2 rounded mt-1 text-sm">
                              {h.primary_value || <span className="text-gray-400 italic">(prázdné)</span>}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-xs font-medium text-gray-600">Očekávaná hodnota:</span>
                            <div className="bg-green-100 p-2 rounded mt-1 text-sm font-medium">
                              {h.expected_value || <span className="text-gray-400 italic">(prázdné)</span>}
                            </div>
                          </div>

                          {h.transcript_quote && (
                            <div>
                              <span className="text-xs font-medium text-gray-600">Citace z přepisu:</span>
                              <div className="bg-gray-100 p-2 rounded mt-1 text-sm italic">
                                "{h.transcript_quote}"
                              </div>
                            </div>
                          )}
                          
                          <div className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">Důvod:</span> {h.reason}
                          </div>
                        </div>

                        {onApplyFix && (
                          <button
                            onClick={() => onApplyFix(h.field, h.expected_value)}
                            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            ✅ Opravit na očekávanou hodnotu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Data */}
          {validation.missing_data.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="text-orange-500" size={20} />
                Možná chybějící data ({validation.missing_data.length})
              </h3>
              <div className="space-y-3">
                {validation.missing_data.map((m, i) => (
                  <div key={i} className="p-4 rounded-lg border-2 bg-orange-50 border-orange-300">
                    <div className="font-mono text-sm text-blue-600 font-semibold mb-2">
                      {m.field}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-600">V přepisu zmíněno:</span>
                        <div className="bg-white p-2 rounded mt-1 text-sm italic">
                          "{m.transcript_mentions}"
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-600">Primární LLM extrahovalo:</span>
                        <div className="bg-gray-100 p-2 rounded mt-1 text-sm">
                          {m.primary_value || <span className="text-gray-400 italic">(prázdné)</span>}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Důvod:</span> {m.reason}
                      </div>
                    </div>

                    {onApplyFix && (
                      <button
                        onClick={() => onApplyFix(m.field, m.transcript_mentions)}
                        className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                      >
                        ➕ Doplnit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Negation Errors */}
          {validation.negation_errors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <XCircle className="text-red-500" size={20} />
                Chyby v negaci ({validation.negation_errors.length})
              </h3>
              <div className="space-y-3">
                {validation.negation_errors.map((n, i) => (
                  <div key={i} className="p-4 rounded-lg border-2 bg-red-50 border-red-300">
                    <div className="font-mono text-sm text-blue-600 font-semibold mb-2">
                      {n.field}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-600">Přepis říká:</span>
                        <div className="bg-white p-2 rounded mt-1 text-sm italic">
                          "{n.transcript_says}"
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-600">Primární LLM extrahovalo:</span>
                        <div className="bg-red-100 p-2 rounded mt-1 text-sm font-medium">
                          {n.primary_value}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-600">Správná hodnota:</span>
                        <div className="bg-green-100 p-2 rounded mt-1 text-sm font-medium">
                          {n.correct_value}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Důvod:</span> {n.reason}
                      </div>
                    </div>

                    {onApplyFix && (
                      <button
                        onClick={() => onApplyFix(n.field, n.correct_value)}
                        className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        ✅ Opravit na správnou hodnotu
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Fields */}
          {validation.correct_fields.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Správně extrahovaná pole ({validation.correct_fields.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {validation.correct_fields.map((field, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-mono"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}

