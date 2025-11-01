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

  // PBI
  pbiDate?: string;
  pbiResult?: string;
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

  // CPITN
  cpitnUpperRight?: string | null;
  cpitnUpperLeft?: string | null;
  cpitnLowerLeft?: string | null;
  cpitnLowerRight?: string | null;

  // Záznamy
  treatmentRecord?: string;
  examinationSummary?: string;
  userNotes?: string;
  fullTranscript?: string;
  dentalCrossNotes?: string;
  periodontalProtocol?: any;
}

export interface AIRole {
  id: string;
  user_id: string;
  name: string;
  system_prompt: string;
  created_at: string;
}
