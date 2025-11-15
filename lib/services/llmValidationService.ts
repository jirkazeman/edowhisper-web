/**
 * LLM Validation Service
 * Dual-LLM validation: Druhý LLM validuje extrakci prvního
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getValidationPrompt } from '../prompts/validation_prompt_v1';

export interface ValidationResult {
  is_valid: boolean;
  confidence: number;
  overall_assessment: string;
  hallucinations: Array<{
    field: string;
    primary_value: string;
    expected_value: string;
    reason: string;
    severity: 'high' | 'medium' | 'low';
    transcript_quote?: string;
  }>;
  missing_data: Array<{
    field: string;
    transcript_mentions: string;
    primary_value: string;
    reason: string;
  }>;
  negation_errors: Array<{
    field: string;
    transcript_says: string;
    primary_value: string;
    correct_value: string;
    reason: string;
  }>;
  correct_fields: string[];
  agreement_percentage: number;
  validator_llm: string;
  validation_timestamp: string;
}

export class LLMValidationService {
  private geminiApiKey: string;
  
  constructor(apiKey?: string) {
    this.geminiApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key is required for validation');
    }
  }

  /**
   * Validuje extrakci pomocí druhého LLM (Gemini)
   * @param transcript - Originální přepis
   * @param primaryExtraction - Extrakce z prvního LLM
   * @param validatorModel - Model pro validaci (default: gemini-2.0-flash-exp)
   */
  async validateExtraction(
    transcript: string,
    primaryExtraction: any,
    validatorModel: string = 'gemini-2.0-flash-exp'
  ): Promise<ValidationResult> {
    console.log('🔍 Starting dual-LLM validation...');
    console.log(`   Primary LLM: ${primaryExtraction.meta?.llm_engine || 'unknown'}`);
    console.log(`   Validator LLM: ${validatorModel}`);

    try {
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: validatorModel });

      // Sestavit validační prompt
      const prompt = getValidationPrompt(transcript, primaryExtraction);

      // Volat Gemini
      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const elapsedTime = Date.now() - startTime;

      const response = result.response;
      const text = response.text();

      console.log(`   ⏱️ Validation took ${elapsedTime}ms`);

      // Parse JSON response
      let validationResult: ValidationResult;
      try {
        // Odstranit markdown code blocks pokud existují
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        validationResult = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('   ❌ Failed to parse validation result:', parseError);
        throw new Error('Invalid JSON response from validator LLM');
      }

      // Přidat metadata
      validationResult.validator_llm = validatorModel;
      validationResult.validation_timestamp = new Date().toISOString();

      // Log výsledky
      console.log(`   ✅ Validation complete:`);
      console.log(`      Valid: ${validationResult.is_valid}`);
      console.log(`      Confidence: ${(validationResult.confidence * 100).toFixed(1)}%`);
      console.log(`      Agreement: ${validationResult.agreement_percentage}%`);
      console.log(`      Hallucinations: ${validationResult.hallucinations.length}`);
      console.log(`      Missing data: ${validationResult.missing_data.length}`);
      console.log(`      Negation errors: ${validationResult.negation_errors.length}`);

      return validationResult;
    } catch (error) {
      console.error('❌ Validation error:', error);
      throw error;
    }
  }

  /**
   * Aplikuje opravu na základě validace
   */
  applyFix(
    originalData: any,
    field: string,
    newValue: any
  ): any {
    const updatedData = { ...originalData };
    
    // Rozdělit field path (např. "exam.tools" → ["exam", "tools"])
    const fieldParts = field.split('.');
    
    // Navigovat do objektu
    let current = updatedData;
    for (let i = 0; i < fieldParts.length - 1; i++) {
      if (!current[fieldParts[i]]) {
        current[fieldParts[i]] = {};
      }
      current = current[fieldParts[i]];
    }
    
    // Nastavit novou hodnotu
    current[fieldParts[fieldParts.length - 1]] = newValue;
    
    return updatedData;
  }

  /**
   * Zkontroluje dostupnost Gemini API
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const result = await model.generateContent('Test');
      return !!result.response.text();
    } catch (error) {
      console.error('Gemini API not available:', error);
      return false;
    }
  }
}

// Singleton instance
let validationServiceInstance: LLMValidationService | null = null;

export function getValidationService(apiKey?: string): LLMValidationService {
  if (!validationServiceInstance) {
    validationServiceInstance = new LLMValidationService(apiKey);
  }
  return validationServiceInstance;
}





