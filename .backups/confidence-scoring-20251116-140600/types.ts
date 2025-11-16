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
}

export interface RecordFormData {
  // Základní info
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
}

export interface AIRole {
  id: string;
  user_id: string;
  name: string;
  system_prompt: string;
  created_at: string;
}
