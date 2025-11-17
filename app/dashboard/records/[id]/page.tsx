"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ZoomIn, ZoomOut, Eye, EyeOff, Sparkles, UserCheck, Smartphone, Copy, Check, Shield, Edit, Save, X as XIcon, AlertTriangle } from "lucide-react";
import type { ParoRecord, ConfidenceScores, GeminiCorrections } from "@/lib/types";
import SimpleDentalChart from "@/components/SimpleDentalChart";
import PeriodontalStatusChart from "@/components/PeriodontalStatusChart";
import ToothEditor from "@/components/ToothEditor";
import ValidationModal from "@/components/ValidationModal";
import TranscriptHighlight from "@/components/TranscriptHighlight";
import CorrectionsModal from "@/components/CorrectionsModal";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { ValidationResult } from "@/lib/services/llmValidationService";
import { recordsAPI } from "@/lib/api";
import { getConfidenceColorClass, formatConfidence, getConfidenceEmoji } from "@/lib/confidenceCalculator";

// Typy pro zubní kříž
interface ToothState {
  id: string;
  status?: 'healthy' | 'missing' | 'crown' | 'filling' | 'root_canal' | 'implant' | 'bridge' | null;
  note?: string;
  hasCaries?: boolean;
  hasNote?: boolean;
}

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [record, setRecord] = useState<ParoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFieldStatus, setShowFieldStatus] = useState(true); // Zelené/korálové ohraničení
  const [sendingToPhone, setSendingToPhone] = useState(false);
  
  // Načíst fontSize z localStorage při načtení
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edowhisper_zoom_level');
      return saved ? parseInt(saved, 10) : 100;
    }
    return 100;
  });
  
  // Editace zubního kříže
  const [editingToothId, setEditingToothId] = useState<string | null>(null);
  const [dentalCross, setDentalCross] = useState<{ [key: string]: ToothState }>({});
  const [isSavingDentalCross, setIsSavingDentalCross] = useState(false);
  
  // Editace parodontálního protokolu
  const [periodontalProtocol, setPeriodontalProtocol] = useState<any>({});
  const [isSavingPeriodontal, setIsSavingPeriodontal] = useState(false);
  
  // Confidence scoring & Gemini validace
  const [confidenceScores, setConfidenceScores] = useState<ConfidenceScores>({});
  const [lowConfidenceFields, setLowConfidenceFields] = useState<string[]>([]);
  const [geminiCorrections, setGeminiCorrections] = useState<GeminiCorrections>({});
  const [validatingFields, setValidatingFields] = useState<Set<string>>(new Set());
  
  // Corrections Modal pro zobrazení oprav hygienistky
  const [showCorrectionsModal, setShowCorrectionsModal] = useState(false);
  
  // Copy funkce pro treatmentRecord
  const [isCopied, setIsCopied] = useState(false);
  const [isSummaryCopied, setIsSummaryCopied] = useState(false); // 🆕 Pro Přehled o ošetření
  
  // 🆕 Edit Mode workflow
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalFormData, setOriginalFormData] = useState<any>(null);
  
  // 🆕 Editace Přehledu o ošetření
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState<string>('');
  const [originalSummary, setOriginalSummary] = useState<string>('');
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Nepodařilo se zkopírovat:', err);
      alert('❌ Nepodařilo se zkopírovat text');
    }
  };
  
  const copySummaryToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsSummaryCopied(true);
      setTimeout(() => setIsSummaryCopied(false), 2000);
    } catch (err) {
      console.error('Nepodařilo se zkopírovat:', err);
      alert('❌ Nepodařilo se zkopírovat text');
    }
  };
  
  // 🆕 Editace Přehledu o ošetření
  const handleEditSummary = () => {
    if (!record) return;
    setOriginalSummary(record.form_data.examinationSummary || '');
    setEditedSummary(record.form_data.examinationSummary || '');
    setIsEditingSummary(true);
  };
  
  const handleCancelEditSummary = () => {
    setEditedSummary(originalSummary);
    setIsEditingSummary(false);
  };
  
  const handleSaveSummary = async () => {
    if (!record || !user) return;
    
    setIsSavingSummary(true);
    try {
      const updatedFormData = {
        ...record.form_data,
        examinationSummary: editedSummary
      };
      
      const { data, error } = await supabase
        .from('paro_records')
        .update({ form_data: updatedFormData })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Záznam nenalezen nebo nemáte oprávnění k úpravě');
      }

      // Refresh record
      await loadRecord();
      setIsEditingSummary(false);
      console.log('✅ Přehled o ošetření uložen');
    } catch (err: any) {
      console.error('❌ Chyba při ukládání:', err);
      alert(`❌ Nepodařilo se uložit: ${err.message || err}`);
    } finally {
      setIsSavingSummary(false);
    }
  };
  
  // 🆕 Zapnout Edit Mode
  const handleEnterEditMode = () => {
    if (!record) return;
    setOriginalFormData(JSON.parse(JSON.stringify(record.form_data))); // Deep copy
    setIsEditMode(true);
    console.log('✏️ Edit Mode zapnut');
  };
  
  // 🆕 Zrušit Edit Mode
  const handleCancelEditMode = () => {
    if (originalFormData) {
      setRecord(prev => prev ? { ...prev, form_data: originalFormData } : null);
    }
    setIsEditMode(false);
    setOriginalFormData(null);
    console.log('❌ Edit Mode zrušen');
  };
  
  // 🆕 Uložit a ověřit
  const handleSaveAndVerify = async () => {
    if (!record || !user) return;
    
    setIsSaving(true);
    try {
      // 1. Calculate diff (original vs edited)
      const llmOriginal = record.llm_original?.form_data || originalFormData;
      const humanEdited = record.form_data;
      
      const humanCorrections: any = {};
      let correctionCount = 0;
      
      if (llmOriginal) {
        Object.keys(humanEdited).forEach(fieldName => {
          const llmValue = (llmOriginal as any)[fieldName];
          const humanValue = (humanEdited as any)[fieldName];
          
          // Porovnat hodnoty (ignorovat dentalCross a periodontalProtocol)
          if (fieldName !== 'dentalCross' && fieldName !== 'periodontalProtocol') {
            if (JSON.stringify(llmValue) !== JSON.stringify(humanValue)) {
              humanCorrections[fieldName] = {
                llm: llmValue,
                human: humanValue,
                action: !llmValue ? 'added' : !humanValue ? 'removed' : 'corrected'
              };
              correctionCount++;
            }
          }
        });
      }
      
      console.log(`📊 Diff: ${correctionCount} corrections`, humanCorrections);
      
      // 2. Save to DB
      const { error } = await supabase
        .from('paro_records')
        .update({
          form_data: humanEdited,
          human_corrections: humanCorrections,
          correction_count: correctionCount,
          corrected_at: new Date().toISOString(),
          verified_by_hygienist: true,
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // 3. Success
      console.log('✅ Záznam uložen a ověřen');
      alert(`✅ Záznam úspěšně uložen a ověřen!\n\n📊 Opraveno polí: ${correctionCount}\n\n✨ Záznam je připraven pro učení AI.`);
      
      // 4. Reload record
      await loadRecord();
      
      // 5. Exit edit mode
      setIsEditMode(false);
      setOriginalFormData(null);
      
    } catch (error: any) {
      console.error('❌ Chyba při ukládání:', error);
      alert(`❌ Nepodařilo se uložit záznam:\n\n${error.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Trigger Gemini validation pro jedno pole
  const triggerGeminiValidation = async (fieldName: string) => {
    if (!record || validatingFields.has(fieldName)) return;
    
    setValidatingFields(prev => new Set(prev).add(fieldName));
    
    try {
      const response = await fetch(`/api/records/${params.id}/validate-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldName,
          fieldValue: (record.form_data as any)[fieldName]
        })
      });
      
      if (response.ok) {
        const { correction } = await response.json();
        setGeminiCorrections(prev => ({
          ...prev,
          [fieldName]: correction
        }));
        console.log(`✅ Gemini validace pro ${fieldName} dokončena`);
      } else {
        const errorData = await response.json();
        console.error('Gemini validation error:', errorData);
      }
    } catch (error) {
      console.error('Error triggering Gemini validation:', error);
    } finally {
      setValidatingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };
  
  // Trigger Gemini validation pro všechna low-confidence pole
  const triggerBatchValidation = async () => {
    if (!record || lowConfidenceFields.length === 0) return;
    
    const fieldsToValidate = lowConfidenceFields.filter(
      field => !geminiCorrections[field] && !validatingFields.has(field)
    );
    
    if (fieldsToValidate.length === 0) return;
    
    console.log(`🤖 Spouštím batch validaci pro ${fieldsToValidate.length} polí...`);
    
    // Set all as validating
    setValidatingFields(prev => {
      const newSet = new Set(prev);
      fieldsToValidate.forEach(f => newSet.add(f));
      return newSet;
    });
    
    try {
      const response = await fetch(`/api/records/${params.id}/validate-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: fieldsToValidate.map(fieldName => ({
            name: fieldName,
            value: (record.form_data as any)[fieldName]
          }))
        })
      });
      
      if (response.ok) {
        const { corrections } = await response.json();
        setGeminiCorrections(prev => ({
          ...prev,
          ...corrections
        }));
        console.log(`✅ Batch validace dokončena pro ${Object.keys(corrections).length} polí`);
      }
    } catch (error) {
      console.error('Error in batch validation:', error);
    } finally {
      // Remove all from validating
      setValidatingFields(prev => {
        const newSet = new Set(prev);
        fieldsToValidate.forEach(f => newSet.delete(f));
        return newSet;
      });
    }
  };

  // Edit treatmentRecord
  const [isEditingTreatment, setIsEditingTreatment] = useState(false);
  const [editedTreatmentRecord, setEditedTreatmentRecord] = useState('');
  const [originalTreatmentRecord, setOriginalTreatmentRecord] = useState('');
  const [isSavingTreatment, setIsSavingTreatment] = useState(false);

  const handleEditTreatment = () => {
    setOriginalTreatmentRecord(record?.form_data.treatmentRecord || '');
    setEditedTreatmentRecord(record?.form_data.treatmentRecord || '');
    setIsEditingTreatment(true);
  };

  const handleCancelEditTreatment = () => {
    setIsEditingTreatment(false);
    setEditedTreatmentRecord('');
  };

  const handleSaveTreatment = async () => {
    if (!user || !record) return;

    setIsSavingTreatment(true);
    try {
      // Aktualizuj form_data v DB
      const updatedFormData = {
        ...record.form_data,
        treatmentRecord: editedTreatmentRecord,
      };

      const { data, error } = await supabase
        .from('paro_records')
        .update({ form_data: updatedFormData })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Záznam nenalezen nebo nemáte oprávnění k úpravě');
      }

      // Refresh record
      await loadRecord();
      setIsEditingTreatment(false);
      console.log('✅ Záznam o ošetření uložen');
    } catch (err: any) {
      console.error('❌ Chyba při ukládání:', err);
      alert(`❌ Nepodařilo se uložit: ${err.message || err}`);
    } finally {
      setIsSavingTreatment(false);
    }
  };

  // Dual-LLM Validation
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handleValidateExtraction = async () => {
    if (!record) return;

    setIsValidating(true);
    try {
      const response = await fetch(`/api/records/${record.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validatorModel: 'gemini-2.0-flash-exp' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Validace selhala');
      }

      const data = await response.json();
      setValidationResult(data.validation);
      setShowValidationModal(true);

      // Refresh record to get updated validation status
      await loadRecord();
    } catch (err: any) {
      console.error('Validation error:', err);
      alert(`❌ Chyba validace: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyFix = async (field: string, value: any) => {
    if (!record) return;

    // TODO: Implementovat aplikaci opravy
    console.log('Apply fix:', field, value);
    alert(`Oprava pole ${field} zatím není implementována. Hodnota: ${value}`);
  };

  // Načíst záznam z DB
  const loadRecord = async () => {
    try {
      console.log("🔍 Fetching record:", params.id);
      
      // Přímý Supabase dotaz s RLS
      const { data, error } = await supabase
        .from("paro_records")
        .select("*")
        .eq("id", params.id)
        .eq("deleted", false)
        .single();
      
      if (error) {
        console.error("❌ Supabase error:", error);
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error("Záznam nenalezen");
      }
      
      console.log("✅ Found record:", data);
      setRecord(data as ParoRecord);
      
      // Načíst zubní kříž (pokud existuje) z form_data
      if (data.form_data?.dentalCross) {
        setDentalCross(data.form_data.dentalCross as { [key: string]: ToothState });
      }
      
      // Načíst parodontální protokol
      if (data.form_data?.periodontalProtocol) {
        setPeriodontalProtocol(data.form_data.periodontalProtocol);
      }
      
      // Načíst confidence scores & Gemini corrections
      const scores = data.confidence_scores || {};
      const lowFields = data.low_confidence_fields || [];
      const corrections = data.gemini_corrections || {};
      
      // 🎯 DEMO: Pokud nejsou confidence scores, vytvoř mock data pro testování
      if (Object.keys(scores).length === 0 && data.form_data) {
        const mockScores: ConfidenceScores = {};
        const mockLowFields: string[] = [];
        
        // Simuluj confidence pro vyplněná pole
        Object.entries(data.form_data).forEach(([key, value]) => {
          if (value && typeof value === 'string' && value.length > 0) {
            // Náhodná confidence mezi 0.3 a 0.95
            const randomConfidence = 0.3 + Math.random() * 0.65;
            mockScores[key] = {
              value: randomConfidence,
              token_confidences: [],
              logprobs: []
            };
            
            // Pokud je confidence < 0.5, přidej do low confidence
            if (randomConfidence < 0.5) {
              mockLowFields.push(key);
            }
          }
        });
        
        setConfidenceScores(mockScores);
        setLowConfidenceFields(mockLowFields);
        console.log(`📊 MOCK Confidence: ${Object.keys(mockScores).length} fields, ${mockLowFields.length} low confidence`);
      } else {
        setConfidenceScores(scores);
        setLowConfidenceFields(lowFields);
        console.log(`📊 Confidence: avg=${data.avg_confidence}, low fields=${lowFields.length}`);
      }
      
      setGeminiCorrections(corrections);
    } catch (err) {
      console.error("❌ Failed to load record:", err);
      setError(err instanceof Error ? err.message : "Neznámá chyba");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, [params.id]);

  // Uložit fontSize do localStorage při změně
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edowhisper_zoom_level', fontSize.toString());
    }
  }, [fontSize]);

  // Uložit zub do zubního kříže
  const handleSaveTooth = async (toothState: ToothState) => {
    if (!user || !record) {
      alert('❌ Nejste přihlášeni nebo záznam není načten');
      return;
    }

    setIsSavingDentalCross(true);
    
    try {
      // Aktualizuj local state
      const updatedDentalCross = {
        ...dentalCross,
        [toothState.id]: toothState,
      };
      setDentalCross(updatedDentalCross);
      
      console.log('💾 Ukládám zubní kříž:', {
        recordId: params.id,
        userId: user.id,
        toothId: toothState.id,
        dentalCrossSize: Object.keys(updatedDentalCross).length
      });
      
      // Ulož přes API - aktualizuj form_data.dentalCross
      // Normalize undefined status to null for API
      const normalizedDentalCross = Object.fromEntries(
        Object.entries(updatedDentalCross).map(([key, tooth]) => [
          key,
          { ...tooth, status: tooth.status ?? null }
        ])
      );
      
      await recordsAPI.update(params.id as string, {
        dentalCross: normalizedDentalCross,
      });
      
      console.log('✅ Zubní kříž uložen:', toothState);
      
      // Aktualizuj record pro jistotu
      await loadRecord();
    } catch (err: any) {
      console.error('❌ Chyba při ukládání zubního kříže:', err);
      alert(`❌ Nepodařilo se uložit změny: ${err.message || err}`);
      
      // Rollback local state
      if (record?.form_data?.dentalCross) {
        setDentalCross(record.form_data.dentalCross as { [key: string]: ToothState });
      }
    } finally {
      setIsSavingDentalCross(false);
    }
  };

  // Uložit parodontální protokol
  const handleSavePeriodontalProtocol = async () => {
    if (!user || !record) return;

    setIsSavingPeriodontal(true);
    try {
      const updatedFormData = {
        ...record.form_data,
        periodontalProtocol: periodontalProtocol,
      };

      const { data, error } = await supabase
        .from('paro_records')
        .update({ form_data: updatedFormData })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Záznam nenalezen nebo nemáte oprávnění k úpravě');
      }

      console.log('✅ Parodontální protokol uložen:', data);
      setRecord(data[0] as ParoRecord);
      alert('✅ Parodontální protokol úspěšně uložen');
    } catch (err: any) {
      console.error('❌ Chyba při ukládání parodontálního protokolu:', err);
      alert(`❌ Nepodařilo se uložit změny: ${err.message || err}`);
    } finally {
      setIsSavingPeriodontal(false);
    }
  };

  const sendToPhone = async () => {
    if (!user || !record) return;
    
    setSendingToPhone(true);
    
    try {
      const { data, error } = await supabase
        .from('record_notifications')
        .insert({
          user_id: user.id,
          record_id: record.id,
          action: 'open_record'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Notifikace odeslána do telefonu:', data);
      
      // Zobraz success feedback (můžeš přidat toast později)
      alert('✅ Záznam odeslán do telefonu!');
    } catch (err) {
      console.error('❌ Chyba při odesílání do telefonu:', err);
      alert('❌ Nepodařilo se odeslat záznam do telefonu');
    } finally {
      setSendingToPhone(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Načítání záznamu...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Chyba: {error || "Záznam nenalezen"}</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            ← Zpět na záznamy
          </button>
        </div>
      </div>
    );
  }

  const fd = record.form_data;
  
  // Helper pro kontrolu jestli je pole vyplněné
  const isFieldFilled = (value: any) => {
    return value !== null && value !== undefined && value !== '' && value !== 'N/A';
  };

  
  // Helper pro získání input classy s korálově ohraničením prázdných polí
  const getInputClass = (value: any, fieldName?: string, baseClass: string = "w-full px-3 py-2 border border-gray-300 rounded text-sm") => {
    let classes = baseClass;
    
    // Add disabled styles if not in edit mode
    if (!isEditMode) {
      classes += ' bg-gray-50 cursor-not-allowed';
    }
    
    if (!showFieldStatus) return classes;
    
    // Confidence scoring má prioritu
    if (fieldName && confidenceScores[fieldName]?.value !== undefined) {
      const confidence = confidenceScores[fieldName].value;
      const confidenceClass = getConfidenceColorClass(confidence);
      return `${classes.replace('border-gray-300', '')} ${confidenceClass}`;
    }
    
    // Fallback na původní logiku
    if (isFieldFilled(value)) return classes;
    // Korálová červená z mobilní app (#FF6B6B)
    return classes.replace('border-gray-300', 'border-[#FF6B6B]');
  };
  
  // Komponenta pro status ikonu u labelu - inverzní (kruh barevný, symbol bílý)
  const FieldStatusIcon = ({ value }: { value: any }) => {
    if (!showFieldStatus) return null;
    
    return isFieldFilled(value) ? (
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500 ml-1">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
          <path d="M8.5 2.5L3.75 7.25L1.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full ml-1" style={{ backgroundColor: '#FF6B6B' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
          <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>
    );
  };
  
  // Confidence Badge - zobrazí emoji + procenta podle confidence score
  const ConfidenceBadge = ({ fieldName }: { fieldName: string }) => {
    if (!showFieldStatus) return null;
    const confidence = confidenceScores[fieldName]?.value;
    if (confidence === undefined) return null;
    
    const emoji = getConfidenceEmoji(confidence);
    const percent = formatConfidence(confidence);
    const isLow = confidence < 0.2;
    
    return (
      <span 
        className={`inline-flex items-center gap-1 text-xs ml-2 px-1.5 py-0.5 rounded ${
          isLow ? 'bg-red-100 text-red-700' : 
          confidence < 0.5 ? 'bg-yellow-100 text-yellow-700' : 
          'bg-green-100 text-green-700'
        }`}
        title={`Confidence score: ${percent}`}
      >
        {emoji} {percent}
      </span>
    );
  };
  
  // Gemini Suggestion - návrh opravy s tlačítky
  const GeminiSuggestion = ({ fieldName }: { fieldName: string }) => {
    const correction = geminiCorrections[fieldName];
    if (!correction) return null;
    
    const handleAccept = async () => {
      if (!record) return;
      
      try {
        // Update form_data with Gemini suggestion
        const updatedFormData = {
          ...record.form_data,
          [fieldName]: correction.suggested
        };
        
        // Create correction history entry
        const historyEntry: any = {
          field: fieldName,
          original: correction.original,
          gemini_suggested: correction.suggested,
          final: correction.suggested,
          timestamp: new Date().toISOString(),
          corrected_by: user?.id || 'unknown',
          confidence_before: confidenceScores[fieldName]?.value || 0,
          reason: 'Gemini suggestion accepted'
        };
        
        // Update in database
        const { error } = await supabase
          .from("paro_records")
          .update({
            form_data: updatedFormData,
            gemini_corrections: {
              ...geminiCorrections,
              [fieldName]: { ...correction, accepted: true }
            },
            correction_history: [
              ...(record.correction_history || []),
              historyEntry
            ]
          })
          .eq("id", params.id);
        
        if (error) {
          console.error('Error accepting Gemini suggestion:', error);
          alert('Chyba při ukládání návrhu');
          return;
        }
        
        // Update local state
        setRecord(prev => prev ? {
          ...prev,
          form_data: updatedFormData,
          correction_history: [
            ...(prev.correction_history || []),
            historyEntry
          ]
        } : null);
        
        // Remove from corrections UI
        setGeminiCorrections(prev => {
          const newCorrections = { ...prev };
          delete newCorrections[fieldName];
          return newCorrections;
        });
        
        console.log('✅ Gemini návrh přijat pro', fieldName);
      } catch (error) {
        console.error('Error accepting suggestion:', error);
      }
    };
    
    const handleReject = () => {
      setGeminiCorrections(prev => {
        const newCorrections = { ...prev };
        delete newCorrections[fieldName];
        return newCorrections;
      });
    };
    
    return (
      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
          <div className="flex-1">
            <div className="text-xs font-semibold text-blue-900 mb-1">
              🤖 Gemini navrhuje opravu
            </div>
            <div className="text-xs text-gray-700 space-y-1">
              <div>
                <span className="font-medium">Původní:</span> 
                <span className="ml-1 line-through">{correction.original}</span>
              </div>
              <div>
                <span className="font-medium">Navrženo:</span> 
                <span className="ml-1 font-semibold text-blue-700">{correction.suggested}</span>
              </div>
              <div className="text-gray-600 italic">
                {correction.reason}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAccept}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
              >
                ✅ Přijmout
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition"
              >
                ❌ Zamítnout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Funkce pro update pole v DB
  // 🆕 Field update handler - POUZE pro local state, NEUKLÁ DO DB!
  // DB update se provede až v handleSaveAndVerify
  const handleFieldUpdate = (fieldName: string, newValue: string) => {
    if (!record || !isEditMode) return; // Pouze v Edit Mode
    
    setRecord(prev => prev ? {
      ...prev,
      form_data: { ...prev.form_data, [fieldName]: newValue }
    } : null);
    
    console.log(`✏️ Pole ${fieldName} změněno (local)`);
  };

  // Verification workflow handler - DOČASNĚ VYPNUTO!
  // 🗑️ SMAZÁNO - nahrazeno handleSaveAndVerify

  return (
    <>
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-2 py-1.5 flex items-center gap-2 shrink-0">
        <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-gray-900">{fd.lastName || "Bez jména"}</h1>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-1.5 border-l pl-2">
          {/* 🆕 NEW WORKFLOW: Edit Mode & Verification */}
          {!isEditMode ? (
            <>
              {/* Not in edit mode - show status and edit button */}
              {!record.verified_by_hygienist ? (
                <button
                  onClick={handleEnterEditMode}
                  className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1"
                  title="Zapnout editační mód - všechna pole budou editovatelná"
                >
                  <Edit size={14} />
                  ✏️ Opravit záznam
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1">
                    <Shield size={14} />
                    ✅ Ověřeno
                    <span className="text-[10px] opacity-70">
                      {new Date(record.verified_at!).toLocaleDateString('cs-CZ')}
                    </span>
                  </div>
                  <button
                    onClick={handleEnterEditMode}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition text-xs"
                    title="Upravit a znovu ověřit"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* In edit mode - show save and cancel buttons */}
              <button
                onClick={handleCancelEditMode}
                className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition flex items-center gap-1"
                title="Zrušit změny a vrátit se"
              >
                <XIcon size={14} />
                ❌ Zrušit
              </button>
              <button
                onClick={handleSaveAndVerify}
                disabled={isSaving}
                className={`px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                  isSaving
                    ? 'bg-gray-200 text-gray-500 cursor-wait'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title="Uložit všechny změny a ověřit záznam jako 100% správný (pro fine-tuning LLM)"
              >
                <Shield size={14} />
                {isSaving ? '⏳ Ukládám...' : '🛡️ Uložit a ověřit'}
              </button>
            </>
          )}
          
          {/* Validovat extrakci (Dual-LLM) */}
          <button
            onClick={handleValidateExtraction}
            disabled={isValidating || !record.fullTranscript}
            className={`p-1 rounded transition ${
              isValidating 
                ? 'opacity-50 cursor-wait' 
                : !record.fullTranscript
                ? 'opacity-30 cursor-not-allowed'
                : record.validationStatus === 'validated'
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : record.validationStatus === 'issues_found'
                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                : 'hover:bg-indigo-50 text-indigo-600'
            }`}
            title={
              !record.fullTranscript
                ? 'Záznam nemá přepis pro validaci'
                : isValidating
                ? 'Validuji...'
                : record.validationStatus === 'validated'
                ? `✅ Validováno (${((record.validationConfidence || 0) * 100).toFixed(0)}%)`
                : record.validationStatus === 'issues_found'
                ? '⚠️ Nalezeny nesrovnalosti - klikni pro detail'
                : 'Validovat extrakci (Gemini 2.0 Flash)'
            }
          >
            <Shield size={16} />
          </button>

          {/* Odeslat do telefonu */}
          <button
            onClick={sendToPhone}
            disabled={sendingToPhone}
            className={`p-1 rounded transition ${sendingToPhone ? 'opacity-50 cursor-wait' : 'hover:bg-blue-50'} text-blue-600`}
            title="Odeslat záznam do telefonu"
          >
            <Smartphone size={16} />
          </button>
          
          {/* LLM tuning - Export pro fine-tuning */}
          <button
            onClick={() => router.push('/dashboard/fine-tuning')}
            className={`p-1 rounded transition hover:bg-purple-50 text-purple-600 ${record?.correction_count ? '' : 'opacity-50'}`}
            title={record?.correction_count ? `Exportovat do fine-tuning (${record.correction_count} oprav)` : 'Žádné opravy k exportu'}
          >
            <Sparkles size={16} />
          </button>
          
          {/* Hygienist correction - Zobrazit opravy */}
          <button
            onClick={() => setShowCorrectionsModal(true)}
            className={`p-1 rounded transition hover:bg-blue-50 text-blue-600 ${record?.correction_count ? '' : 'opacity-50'}`}
            title={record?.correction_count ? `Zobrazit opravy (${record.correction_count})` : 'Žádné opravy'}
          >
            <UserCheck size={16} />
          </button>
          
          {/* Field status toggle */}
          <button
            onClick={() => setShowFieldStatus(!showFieldStatus)}
            className={`p-1 rounded transition ${showFieldStatus ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100 text-gray-600'}`}
            title={showFieldStatus ? "Skrýt status polí" : "Zobrazit status polí"}
          >
            {showFieldStatus ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          
          {/* Auto-validation button - zobrazit pouze pokud jsou low-confidence pole */}
          {lowConfidenceFields.length > 0 && (
            <button
              onClick={triggerBatchValidation}
              disabled={validatingFields.size > 0}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                validatingFields.size > 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
              title={`Automaticky validovat ${lowConfidenceFields.length} low-confidence polí pomocí Gemini`}
            >
              {validatingFields.size > 0 ? (
                <>⏳ Validuji...</>
              ) : (
                <>🤖 Validovat ({lowConfidenceFields.length})</>
              )}
            </button>
          )}
          
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 border-l pl-1.5">
            <button 
              onClick={() => setFontSize(Math.max(70, fontSize - 10))}
              className="p-1 hover:bg-gray-100 rounded"
              title="Zmenšit text"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] text-gray-600 w-8 text-center">{fontSize}%</span>
            <button 
              onClick={() => setFontSize(Math.min(150, fontSize + 10))}
              className="p-1 hover:bg-gray-100 rounded"
              title="Zvětšit text"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
        
        <div className="text-[10px] text-gray-500">{new Date(record.created_at).toLocaleDateString("cs-CZ")}</div>
      </div>

      {/* Main content wrapper with scroll */}
      <div className="flex-1 overflow-y-auto">
        {/* Grid: 2 boční sloupce + prostřední na celou šířku */}
        <div 
          className="grid grid-cols-[280px_1fr_320px] gap-1.5 p-1.5"
          style={{ transform: `scale(${fontSize / 100})`, transformOrigin: 'top left', width: `${100 / (fontSize / 100)}%` }}
        >
        {/* LEFT COLUMN - beze změny */}
        
        {/* LEFT COLUMN */}
        <div className="space-y-2">
          {/* Základní informace */}
          <div className="bg-white rounded shadow-sm p-2">
            <h3 className="font-semibold text-xs mb-2">Základní informace</h3>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Příjmení
                  <FieldStatusIcon value={fd.lastName} />
                  <ConfidenceBadge fieldName="lastName" />
                </label>
                <input 
                  type="text" 
                  value={fd.lastName || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, lastName: newValue }
                    } : null);
                  }}
                  onBlur={(e) => handleFieldUpdate('lastName', e.target.value)}
                  disabled={!isEditMode}
                  className={getInputClass(fd.lastName, "lastName", "w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium")} 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Rodné číslo (RČ)
                  <FieldStatusIcon value={fd.personalIdNumber} />
                  <ConfidenceBadge fieldName="personalIdNumber" />
                </label>
                <input 
                  type="text" 
                  value={fd.personalIdNumber || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, personalIdNumber: newValue }
                    } : null);
                  }}
                  onBlur={(e) => handleFieldUpdate('personalIdNumber', e.target.value)}
                  disabled={!isEditMode}
                  className={getInputClass(fd.personalIdNumber, "personalIdNumber", "w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium")} 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kuřák</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1">
                    <input 
                      type="radio" 
                      checked={fd.isSmoker === "yes"} 
                      onChange={() => {
                        setRecord(prev => prev ? {
                          ...prev,
                          form_data: { ...prev.form_data, isSmoker: "yes" }
                        } : null);
                      }}
                      disabled={!isEditMode}
                      className="w-4 h-4" 
                    />
                    <span className="text-sm font-medium">Ano</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input 
                      type="radio" 
                      checked={fd.isSmoker === "no"} 
                      onChange={() => {
                        setRecord(prev => prev ? {
                          ...prev,
                          form_data: { ...prev.form_data, isSmoker: "no" }
                        } : null);
                      }}
                      disabled={!isEditMode}
                      className="w-4 h-4" 
                    />
                    <span className="text-sm font-medium">Ne</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Anamnéza */}
          <div className="bg-white rounded shadow-sm p-2">
            <h3 className="font-semibold text-xs mb-2">Anamnéza</h3>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Všeobecná anamnéza
                  <FieldStatusIcon value={fd.generalAnamnesis} />
                </label>
                <textarea 
                  value={fd.generalAnamnesis || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, generalAnamnesis: newValue }
                    } : null);
                  }}
                  disabled={!isEditMode}
                  rows={2} 
                  className={getInputClass(fd.generalAnamnesis, "w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none leading-relaxed")} 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Alergie
                  <FieldStatusIcon value={fd.allergies} />
                </label>
                <textarea 
                  value={fd.allergies || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, allergies: newValue }
                    } : null);
                  }}
                  disabled={!isEditMode}
                  rows={2} 
                  className={getInputClass(fd.allergies, "w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none leading-relaxed")} 
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Stomatologická anamnéza
                  <FieldStatusIcon value={fd.stomatologicalAnamnesis} />
                </label>
                <textarea 
                  value={fd.stomatologicalAnamnesis || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, stomatologicalAnamnesis: newValue }
                    } : null);
                  }}
                  disabled={!isEditMode}
                  rows={2} 
                  className={getInputClass(fd.stomatologicalAnamnesis, "w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none leading-relaxed")} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN - s horizontálním scrollováním */}
        <div className="space-y-1.5 overflow-x-auto">
          <SimpleDentalChart 
            teeth={dentalCross}
            notes={fd.dentalCrossNotes}
            fontSize={fontSize}
            onToothClick={(toothId) => setEditingToothId(toothId)}
            readonly={false}
          />
          
          {/* Parodontální status - samostatný graf pod zubním křížem */}
          <PeriodontalStatusChart 
            protocol={periodontalProtocol}
            readonly={false}
            onChange={(newProtocol) => {
              setPeriodontalProtocol(newProtocol);
              // Automaticky uložit při změně
              handleSavePeriodontalProtocol();
            }}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-2">
          {/* Vyšetření */}
          <div className="bg-white rounded shadow-sm p-2">
            <h3 className="font-semibold text-xs mb-2">Vyšetření</h3>
            
            <div className="space-y-2">
              {[
                { label: "Hygiena", value: fd.hygiene, fieldName: "hygiene" },
                { label: "Gingiva", value: fd.gingiva, fieldName: "gingiva" },
                { label: "Zubní kámen", value: fd.tartar, fieldName: "tartar" },
                { label: "Pomůcky", value: fd.tools, fieldName: "tools" }
              ].map(({ label, value, fieldName }) => (
                <div key={label}>
                  <label className="block text-xs text-gray-600 mb-1">
                    {label}
                    <FieldStatusIcon value={value} />
                  </label>
                  <input 
                    type="text" 
                    value={value || ""} 
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setRecord(prev => prev ? {
                        ...prev,
                        form_data: { ...prev.form_data, [fieldName]: newValue }
                      } : null);
                    }}
                    disabled={!isEditMode}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Indexy (BOB/PBI/CPITN) */}
          <div className="bg-white rounded shadow-sm p-2">
            <h3 className="font-semibold text-xs mb-2">📊 Indexy (BOB/PBI/CPITN)</h3>
            
            <div className="space-y-2">
              {/* BOB */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">BOB</label>
                <input 
                  type="text" 
                  value={fd.bob || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, bob: newValue }
                    } : null);
                  }}
                  disabled={!isEditMode}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium" 
                />
              </div>

              {/* PBI */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">PBI hodnoty</label>
                <input 
                  type="text" 
                  value={fd.pbiValues || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, pbiValues: newValue }
                    } : null);
                  }}
                  disabled={!isEditMode}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium font-mono" 
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">PBI pomůcky</label>
                <input 
                  type="text" 
                  value={fd.pbiTools || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, pbiTools: newValue }
                    } : null);
                  }}
                  disabled={!isEditMode}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium" 
                />
              </div>

              {/* CPITN */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">CPITN</label>
                <input 
                  type="text" 
                  value={fd.cpitn || ""} 
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRecord(prev => prev ? {
                      ...prev,
                      form_data: { ...prev.form_data, cpitn: newValue }
                    } : null);
                  }}
                  disabled={!isEditMode}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium font-mono" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Záznam ošetření + Přehled + Přepis DOLE - ROZTAŽENÉ PŘES CELOU ŠÍŘKU */}
      <div className="grid grid-cols-3 gap-3 px-1.5 pb-1.5">
        {/* Přehled o ošetření - LEVÁ ČÁST */}
        <div className="bg-white rounded shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">📋 Přehled o ošetření</h3>
              {!isEditingSummary && originalSummary && originalSummary !== fd.examinationSummary && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  Upraveno
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isEditingSummary ? (
                <>
                  {/* Edit button */}
                  <button
                    onClick={handleEditSummary}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Upravit přehled"
                  >
                    <Edit size={20} className="text-blue-500" />
                  </button>
                  {/* Copy button */}
                  {fd.examinationSummary && (
                    <button
                      onClick={() => copySummaryToClipboard(fd.examinationSummary || "")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                      title="Zkopírovat do schránky"
                    >
                      {isSummaryCopied ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <Copy size={20} className="text-blue-500" />
                      )}
                      {isSummaryCopied && (
                        <span className="absolute -top-8 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Zkopírováno!
                        </span>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Cancel button */}
                  <button
                    onClick={handleCancelEditSummary}
                    disabled={isSavingSummary}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Zrušit"
                  >
                    <XIcon size={20} className="text-gray-500" />
                  </button>
                  {/* Save button */}
                  <button
                    onClick={handleSaveSummary}
                    disabled={isSavingSummary}
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Uložit"
                  >
                    {isSavingSummary ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                    ) : (
                      <Save size={20} className="text-green-500" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
          
          {!isEditingSummary ? (
            <div 
              className="text-xs font-mono bg-gray-50 p-3 rounded whitespace-pre-wrap h-[calc(100vh-450px)] overflow-y-auto leading-relaxed border border-gray-200"
              style={{ fontSize: `${fontSize}%` }}
            >
              {fd.examinationSummary || "Žádný přehled o ošetření"}
            </div>
          ) : (
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="w-full text-xs font-mono bg-white p-3 rounded h-[calc(100vh-450px)] overflow-y-auto leading-relaxed border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              style={{ fontSize: `${fontSize}%` }}
              placeholder="Strukturovaný přehled pro export..."
            />
          )}
        </div>
        
        {/* Záznam o ošetření - STŘEDNÍ ČÁST */}
        <div className="bg-white rounded shadow-sm p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Záznam o ošetření</h3>
              {/* Indikátor úprav */}
              {!isEditingTreatment && originalTreatmentRecord && originalTreatmentRecord !== fd.treatmentRecord && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  Upraveno
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isEditingTreatment ? (
                <>
                  {/* Edit button */}
                  <button
                    onClick={handleEditTreatment}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Upravit záznam"
                  >
                    <Edit size={20} className="text-blue-500" />
                  </button>
                  {/* Copy button */}
                  {fd.treatmentRecord && (
                    <button
                      onClick={() => copyToClipboard(fd.treatmentRecord || "")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
                      title="Zkopírovat do schránky"
                    >
                      {isCopied ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <Copy size={20} className="text-blue-500" />
                      )}
                      {isCopied && (
                        <span className="absolute -top-8 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          Zkopírováno!
                        </span>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Cancel button */}
                  <button
                    onClick={handleCancelEditTreatment}
                    disabled={isSavingTreatment}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Zrušit"
                  >
                    <XIcon size={20} className="text-gray-500" />
                  </button>
                  {/* Save button */}
                  <button
                    onClick={handleSaveTreatment}
                    disabled={isSavingTreatment}
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Uložit změny"
                  >
                    <Save size={20} className="text-green-600" />
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea 
            value={isEditingTreatment ? editedTreatmentRecord : (fd.treatmentRecord || "")}
            onChange={(e) => isEditingTreatment && setEditedTreatmentRecord(e.target.value)}
            readOnly={!isEditingTreatment}
            rows={6} 
            className={`${getInputClass(fd.treatmentRecord, "w-full px-3 py-2 border-2 rounded text-lg font-medium resize-none leading-relaxed")} ${
              isEditingTreatment ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          />
          {isEditingTreatment && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Upravujete záznam o ošetření. Klikněte na ✅ pro uložení nebo ✕ pro zrušení.
            </p>
          )}
        </div>

        {/* Kompletní přepis - PRAVÁ ČÁST */}
        <div className="bg-white rounded shadow-sm p-3">
          <h3 className="font-semibold text-lg mb-2">
            Kompletní přepis
            <span className="text-xs font-normal text-gray-500 ml-2">(žlutě = nevyužito)</span>
          </h3>
          <div className="h-[calc(100%-3rem)] overflow-y-auto">
            {fd.fullTranscript ? (
              <TranscriptHighlight
                transcript={fd.fullTranscript}
                extractedData={fd}
                showStats={true}
              />
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-500">
                  📝 Přepis není k dispozici
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Přepis se ukládá automaticky po nahrání záznamu z mobilní aplikace.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>

    {/* Tooth Editor Modal */}
    {editingToothId && (
      <ToothEditor
        toothId={editingToothId}
        toothState={dentalCross[editingToothId]}
        onSave={handleSaveTooth}
        onClose={() => setEditingToothId(null)}
      />
    )}

    {/* Validation Modal */}
    <ValidationModal
      isOpen={showValidationModal}
      onClose={() => setShowValidationModal(false)}
      validation={validationResult}
      onApplyFix={handleApplyFix}
    />

    {/* Corrections Modal - Zobrazení oprav hygienistky */}
    <CorrectionsModal
      isOpen={showCorrectionsModal}
      onClose={() => setShowCorrectionsModal(false)}
      corrections={record?.human_corrections}
      correctionCount={record?.correction_count}
      correctedAt={record?.corrected_at}
    />
    </>
  );
}
