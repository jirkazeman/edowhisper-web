/**
 * Gemini Validation Service
 * 
 * Druhá vrstva validace pro low-confidence pole
 * Používá Gemini 2.0 Flash pro rychlou a levnou opravu potenciálních chyb
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiCorrection } from '../types';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

/**
 * Validuje a opravuje jedno low-confidence pole pomocí Gemini
 */
export async function validateField(
  fieldName: string,
  currentValue: string,
  originalTranscript: string,
  contextFields?: Record<string, any>
): Promise<GeminiCorrection> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Vytvoř prompt pro Gemini
    const prompt = createValidationPrompt(fieldName, currentValue, originalTranscript, contextFields);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON odpovědi
    const correction = parseGeminiResponse(text, fieldName, currentValue);

    return correction;

  } catch (error) {
    console.error(`Gemini validation error for field ${fieldName}:`, error);
    
    // Fallback - pokud Gemini selže, vrátíme původní hodnotu
    return {
      original: currentValue,
      suggested: currentValue,
      reason: `Gemini validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence: 0.5,
      accepted: false
    };
  }
}

/**
 * Vytvoří prompt pro Gemini validaci
 */
function createValidationPrompt(
  fieldName: string,
  currentValue: string,
  originalTranscript: string,
  contextFields?: Record<string, any>
): string {
  const fieldDescriptions: Record<string, string> = {
    lastName: 'příjmení pacienta',
    personalIdNumber: 'rodné číslo pacienta (formát XXXXXX/XXXX)',
    generalAnamnesis: 'všeobecná anamnéza',
    allergies: 'alergie',
    stomatologicalAnamnesis: 'stomatologická anamnéza',
    hygiene: 'hygiena dutiny ústní',
    gingiva: 'stav dásní',
    pbiValues: 'PBI hodnoty (formát: XXXX/XXXX/XXXX/XXXX)',
    cpitn: 'CPITN hodnoty (formát: XXX/XXX)',
  };

  const fieldDesc = fieldDescriptions[fieldName] || fieldName;

  return `Jsi expertn\u00ed parodont\u00e1ln\u00ed asistentka. Tv\u00fdm \u00fakolem je zkontrolovat a opravit potenci\u00e1ln\u011b chybn\u011b extrahovan\u00e9 pole z audio transkriptu.

**P\u016fvodn\u00ed transkript:**
${originalTranscript}

**Pole k validaci:** ${fieldDesc}
**Aktu\u00e1ln\u00ed hodnota:** "${currentValue}"

${contextFields ? `**Kontext (ostatn\u00ed pole):**
${JSON.stringify(contextFields, null, 2)}` : ''}

**\u00dakolem je:**
1. Zkontrolovat, zda aktu\u00e1ln\u00ed hodnota odpov\u00edd\u00e1 p\u016fvodn\u00edmu transkriptu
2. Pokud je chyba (p\u0159eklep, \u0161patn\u011b interpretovan\u00e9 Whisperem, halucinace), navrhni opravu
3. Pokud je v\u0161e v po\u0159\u00e1dku, potvrď p\u016fvodn\u00ed hodnotu

**Odpov\u011bz ve form\u00e1tu JSON:**
{
  "is_correct": true/false,
  "suggested_value": "opravená hodnota nebo původní",
  "reason": "stručné vysvětlení (česky)",
  "confidence": 0.0-1.0
}

**Pravidla:**
- Buď velmi p\u0159esn\u00e1 a konzervativn\u00ed
- Opravuj pouze zjevn\u00e9 chyby
- Pokud nejsi jist\u00e1, nech p\u016fvodn\u00ed hodnotu
- V\u011bnuj pozornost form\u00e1t\u016fm (rodn\u00e9 \u010d\u00edslo, PBI, CPITN)
- Nepřidávej informace, které nejsou v transkriptu

Odpověď (pouze JSON, bez dalšího textu):`;
}

/**
 * Parsuje Gemini odpověď a vytvoří GeminiCorrection objekt
 */
function parseGeminiResponse(
  responseText: string,
  fieldName: string,
  originalValue: string
): GeminiCorrection {
  try {
    // Pokus se extrahovat JSON z odpovědi
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      original: originalValue,
      suggested: parsed.suggested_value || originalValue,
      reason: parsed.reason || 'No reason provided',
      confidence: parsed.confidence || 0.5,
      accepted: false
    };

  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    
    return {
      original: originalValue,
      suggested: originalValue,
      reason: 'Failed to parse Gemini response',
      confidence: 0.5,
      accepted: false
    };
  }
}

/**
 * Validuje více polí najednou (batch validation)
 */
export async function validateFields(
  fields: Array<{ name: string; value: string }>,
  originalTranscript: string,
  contextFields?: Record<string, any>
): Promise<Record<string, GeminiCorrection>> {
  const corrections: Record<string, GeminiCorrection> = {};

  // Validujeme pole sekvenčně (aby jsme nepřetížili API)
  for (const field of fields) {
    corrections[field.name] = await validateField(
      field.name,
      field.value,
      originalTranscript,
      contextFields
    );
    
    // Malá pauza mezi requesty
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return corrections;
}

/**
 * Zkontroluje, zda field potřebuje validaci (confidence < threshold)
 */
export function needsValidation(confidence: number, threshold: number = 0.2): boolean {
  return confidence < threshold;
}

