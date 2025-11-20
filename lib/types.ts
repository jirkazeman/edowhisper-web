export interface ParoRecord {
  id: string;
  user_id: string;
  form_data: RecordFormData;
  protocol: any;
  appointment_at: string | null;
  created_at: string;
  updated_at: string;
  deleted: boolean;
  deleted_at: string | null;
  examination_summary: string;
  llm_original?: any; // Původní výstup z LLM před úpravami
  quality_rating?: number; // 1-5 hodnocení kvality LLM výstupu
  hygienist_feedback?: string; // Textová zpětná vazba od hygienistky
  rated_at?: string; // Datum hodnocení
  rated_by?: string; // ID hygienistky, která ohodnotila
  
  // Dual-LLM Validation
  validationStatus?: 'pending' | 'validated' | 'issues_found' | 'skipped';
  validationConfidence?: number; // 0.0-1.0
  validationTimestamp?: string;
  fullTranscript?: string; // Pro validaci potřebujeme přepis
  
  // Confidence Scoring & Multi-Layer Validation
  confidence_scores?: ConfidenceScores; // Confidence score pro každé pole
  low_confidence_fields?: string[]; // Pole s confidence < 20%
  gemini_corrections?: GeminiCorrections; // Návrhy oprav od Gemini
  correction_history?: CorrectionHistoryItem[]; // Historie oprav pro fine-tuning
  validation_method?: 'single' | 'dual-llm' | 'human-reviewed'; // Metoda validace
  avg_confidence?: number; // Průměrná confidence (0.0-1.0)
  
  // 🆕 Fine-Tuning: Opravy hygienistky
  human_corrections?: HumanCorrections; // Diff mezi LLM a hygienistkou
  correction_count?: number; // Počet opravených polí
  corrected_at?: string; // Kdy byly provedeny opravy
  
  // 🆕 Hygienist Verification (pro fine-tuning)
  verified_by_hygienist?: boolean; // TRUE = Hygienistka zkontrolovala a ověřila
  verified_at?: string; // Kdy byl záznam ověřen
  verified_by?: string; // User ID hygienistky, která ověřila
}

// Confidence score pro jedno pole
export interface FieldConfidence {
  value: number; // 0.0-1.0 (průměrná confidence)
  token_confidences?: number[]; // Confidence pro jednotlivé tokeny
  logprobs?: number[]; // Raw logprobs z OpenAI
}

// Confidence scores pro všechna pole
export interface ConfidenceScores {
  [fieldName: string]: FieldConfidence;
}

// Gemini korekce pro jedno pole
export interface GeminiCorrection {
  original: string; // Původní hodnota z OpenAI
  suggested: string; // Navržená oprava od Gemini
  reason: string; // Vysvětlení, proč Gemini navrhuje změnu
  confidence: number; // Confidence Gemini návrhu (0.0-1.0)
  accepted?: boolean; // Zda hygienistka přijala návrh
  accepted_at?: string; // Timestamp přijetí
  accepted_by?: string; // ID hygienistky
}

// Gemini korekce pro všechna low-confidence pole
export interface GeminiCorrections {
  [fieldName: string]: GeminiCorrection;
}

// Jedna položka v historii oprav
export interface CorrectionHistoryItem {
  field: string; // Název pole
  original: string; // Původní hodnota z OpenAI
  gemini_suggested?: string; // Návrh od Gemini (pokud byl)
  final: string; // Finální hodnota po korekci hygienistkou
  timestamp: string; // Kdy byla oprava provedena
  corrected_by: string; // ID hygienistky
  confidence_before: number; // Confidence před opravou
  reason?: string; // Důvod opravy od hygienistky
}

// 🆕 Human Corrections - Opravy hygienistek pro fine-tuning
export interface HumanCorrections {
  [fieldName: string]: {
    llm: any;  // Původní hodnota z LLM
    human: any;  // Opravená hodnota od hygienistky
    action: 'added' | 'removed' | 'corrected';
    fieldType?: string;
  };
}

export interface RecordFormData {
  // Základní info
  firstName?: string;
  lastName: string;
  personalIdNumber: string;

  // Anamnéza
  isSmoker: "yes" | "no" | null;
  generalAnamnesis?: string;
  allergies?: string;
  stomatologicalAnamnesis?: string;
  permanentMedication?: string;

  // Vyšetření
  hygiene?: string;
  gingiva?: string;
  tartar?: string;
  tools?: string;
  caries?: string;
  mucosa?: string;
  tongue?: string;
  frenulum?: string;
  occlusion?: string;
  orthodonticAnomaly?: string;

  // BOB (Bleeding on Brushing)
  bob?: string; // Příklad: "31%", "45%"

  // PBI (Papillary Bleeding Index)
  pbiDate?: string;
  pbiResult?: string;
  pbiValues?: string; // Příklad: "0123/2341/1234/0123"
  pbiTools?: string;

  // Zubní kříž
  dentalCross?: {
    [toothId: string]: {
      id: string;
      status: "healthy" | "missing" | "crown" | "filling" | "root_canal" | "implant" | "bridge" | null;
      hasNote?: boolean;
      note?: string;
      hasCaries?: boolean;
    };
  };

  // CPITN (6 sextantů)
  cpitn?: string; // Příklad: "222/222", "234/321"

  // Parodontální protokol (hloubky kapes, krvácení)
  periodontalProtocol?: {
    [toothNumber: string]: {
      bleeding?: boolean;
      depth?: number[]; // [MB, B, DB, ML, L, DL] - 6 hodnot
    };
  };

  // Záznamy
  treatmentRecord?: string;
  examinationSummary?: string;
  userNotes?: string;
  fullTranscript?: string;
  dentalCrossNotes?: string;
  
  // 📷 FOTOGRAFIE (lokální URI na mobilu)
  photos?: string[];
}

export interface AIRole {
  id: string;
  user_id: string;
  name: string;
  system_prompt: string;
  created_at: string;
}
