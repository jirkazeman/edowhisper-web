// lib/transcriptDiff.ts
// Utility pro porovnání přepisu s extrahovanými daty
// Označí slova, která LLM nepoužilo (žlutě)

import { RecordFormData } from './types';

export interface WordMatch {
  word: string;
  used: boolean; // true = použito LLM, false = ignorováno
  fieldName?: string; // Ve kterém poli bylo použito
}

/**
 * Porovná originální přepis s extrahovanými daty
 * Vrátí pole slov s informací, zda byly použity
 */
export function matchTranscriptToExtractedData(
  transcript: string,
  extractedData: RecordFormData
): WordMatch[] {
  // Rozdělit přepis na slova (ignore interpunkci)
  const words = transcript
    .split(/\s+/)
    .filter(w => w.trim().length > 0);

  // Získat všechny textové hodnoty z extrahovaných dat
  const extractedTexts = extractTextFieldsFromFormData(extractedData);
  const allExtractedText = Object.values(extractedTexts).join(' ').toLowerCase();

  // Pro každé slovo zkontrolovat, zda je v extrahovaných datech
  return words.map(word => {
    const normalizedWord = normalizeWord(word);
    const isUsed = allExtractedText.includes(normalizedWord.toLowerCase());

    // Pokud použito, najít v kterém poli
    let fieldName: string | undefined;
    if (isUsed) {
      for (const [field, text] of Object.entries(extractedTexts)) {
        if (text && text.toLowerCase().includes(normalizedWord.toLowerCase())) {
          fieldName = field;
          break;
        }
      }
    }

    return {
      word,
      used: isUsed,
      fieldName,
    };
  });
}

/**
 * Normalizuje slovo (odstraní interpunkci, lowercase)
 */
function normalizeWord(word: string): string {
  return word
    .replace(/[.,;:!?()"""'']/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Extrahuje všechny textové fieldy z form data
 */
function extractTextFieldsFromFormData(data: RecordFormData): Record<string, string> {
  const textFields: Record<string, string> = {};

  // Základní textová pole
  const simpleFields: (keyof RecordFormData)[] = [
    'lastName',
    'personalIdNumber',
    'generalAnamnesis',
    'allergies',
    'stomatologicalAnamnesis',
    'permanentMedication',
    'hygiene',
    'gingiva',
    'tartar',
    'tools',
    'caries',
    'mucosa',
    'tongue',
    'frenulum',
    'occlusion',
    'orthodonticAnomaly',
    'bob',
    'pbiValues',
    'pbiTools',
    'cpitn',
    'fullTranscript',
  ];

  for (const field of simpleFields) {
    const value = data[field];
    if (value && typeof value === 'string' && value.trim()) {
      textFields[field] = value;
    }
  }

  // BOP je string, ne pole
  // PBI hodnoty jsou už v pbiValues

  return textFields;
}

/**
 * Vypočítá procentuální využití přepisu
 */
export function calculateTranscriptUsage(matches: WordMatch[]): {
  used: number;
  unused: number;
  percentage: number;
} {
  const used = matches.filter(m => m.used).length;
  const unused = matches.filter(m => !m.used).length;
  const percentage = matches.length > 0 ? (used / matches.length) * 100 : 0;

  return { used, unused, percentage };
}

/**
 * Seskupí slova do segmentů (použité/nepoužité)
 */
export interface TextSegment {
  text: string;
  used: boolean;
  fieldName?: string;
}

export function groupWordsIntoSegments(matches: WordMatch[]): TextSegment[] {
  const segments: TextSegment[] = [];
  let currentSegment: TextSegment | null = null;

  for (const match of matches) {
    if (!currentSegment) {
      currentSegment = {
        text: match.word,
        used: match.used,
        fieldName: match.fieldName,
      };
    } else if (currentSegment.used === match.used && currentSegment.fieldName === match.fieldName) {
      // Pokračovat v aktuálním segmentu
      currentSegment.text += ' ' + match.word;
    } else {
      // Začít nový segment
      segments.push(currentSegment);
      currentSegment = {
        text: match.word,
        used: match.used,
        fieldName: match.fieldName,
      };
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

