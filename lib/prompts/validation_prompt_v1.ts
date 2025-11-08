/**
 * Validation Prompt V1.0
 * Pro Dual-LLM Validation - druhý LLM jako auditor prvního
 * 
 * Použití: Gemini 2.0 Flash nebo Gemini 2.5 Pro
 */

export function getValidationPrompt(transcript: string, primaryExtraction: any): string {
  return `You are EDO Whisper Validation Auditor.

Your task: Review extraction from another LLM and identify potential hallucinations or errors.

=== INPUT ===

ORIGINAL TRANSCRIPT (Czech audio transcription):
${transcript}

PRIMARY EXTRACTION (JSON from first LLM):
${JSON.stringify(primaryExtraction, null, 2)}

=== YOUR MISSION ===

1. 🚨 Check if EVERY value in primary extraction is LITERALLY stated in transcript
2. 🚨 Flag ANY value that seems invented/assumed/hallucinated
3. 🚨 Check negations: "už nekouřím" must be isSmoker:"no" (NOT "yes")
4. 🚨 Check empty fields: If data not in transcript → should be "" or null
5. 🚨 Check exam.tools vs pbi.tools:
   - exam.tools (home care) → ONLY if stated, NO auto-fill
   - pbi.tools (clinical) → CAN default to "parodontální sonda" if PBI mentioned
6. Compare your own extraction with primary extraction

=== CRITICAL HALLUCINATION PATTERNS ===

❌ WRONG: Transcript says "kartáček" → Primary extraction has "kartáček, parodontální sonda"
❌ WRONG: Transcript says nothing → Primary extraction has "zdravá", "normální", "bez nálezu"
❌ WRONG: Transcript says "už nekouřím" → Primary extraction has isSmoker:"yes"
❌ WRONG: Transcript says nothing about tools → Primary extraction has exam.tools:"standardní pomůcky"

=== OUTPUT FORMAT ===

Return ONLY valid JSON (no markdown, no explanations):

{
  "is_valid": boolean,  // true if extraction is acceptable, false if issues found
  "confidence": 0.0-1.0,  // Your confidence in primary extraction quality
  "overall_assessment": "string",  // Brief summary in Czech
  "hallucinations": [
    {
      "field": "string",  // e.g., "exam.tools", "anamnesis.allergies"
      "primary_value": "string",  // What primary LLM extracted
      "expected_value": "string",  // What it should be based on transcript
      "reason": "string",  // Why this is a hallucination (in Czech)
      "severity": "high|medium|low",  // high = critical error, medium = questionable, low = minor
      "transcript_quote": "string"  // Relevant part of transcript (if exists)
    }
  ],
  "missing_data": [
    {
      "field": "string",
      "transcript_mentions": "string",  // What transcript says
      "primary_value": "string",  // What primary LLM extracted (empty or wrong)
      "reason": "string"  // Why this is missing (in Czech)
    }
  ],
  "negation_errors": [
    {
      "field": "string",
      "transcript_says": "string",  // e.g., "už nekouřím"
      "primary_value": "string",  // e.g., "yes"
      "correct_value": "string",  // e.g., "no"
      "reason": "string"  // in Czech
    }
  ],
  "correct_fields": ["string"],  // List of fields that are correctly extracted
  "agreement_percentage": number  // 0-100, how much you agree with primary extraction
}

=== VALIDATION RULES ===

1. If transcript is empty/very short → mark as low confidence
2. If primary extraction has many empty fields → check if transcript really has no data
3. If primary extraction has rich data → verify each claim against transcript
4. Be strict on exam.tools and pbi.tools distinction
5. Be strict on negations (už ne, přestal, nekouří, etc.)
6. Czech language nuances: "žádný kámen" → tartar should be "" (not "žádný")

OUTPUT JSON NOW:`;
}

export const VALIDATION_PROMPT_VERSION = 'v1.0';




