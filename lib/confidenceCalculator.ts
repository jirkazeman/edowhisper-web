/**
 * Confidence Calculator
 * 
 * Vypočítá confidence score z OpenAI logprobs
 * Logprobs jsou log-pravděpodobnosti tokenů (záporná čísla)
 * -0.1 = velmi jistý (97% pravděpodobnost)
 * -2.3 = nejistý (10% pravděpodobnost)
 */

import type { FieldConfidence, ConfidenceScores } from './types';

/**
 * Převede logprob na pravděpodobnost (0.0-1.0)
 * logprob = log(p) => p = exp(logprob)
 */
export function logprobToProbability(logprob: number): number {
  return Math.exp(logprob);
}

/**
 * Vypočítá průměrnou confidence z pole logprobs
 */
export function calculateAverageConfidence(logprobs: number[]): number {
  if (!logprobs || logprobs.length === 0) return 0;
  
  const probabilities = logprobs.map(logprobToProbability);
  const sum = probabilities.reduce((acc, p) => acc + p, 0);
  return sum / probabilities.length;
}

/**
 * Vypočítá confidence pro jedno pole z logprobs
 */
export function calculateFieldConfidence(
  logprobs: number[] | undefined,
  fallbackValue: number = 0.5
): FieldConfidence {
  if (!logprobs || logprobs.length === 0) {
    return {
      value: fallbackValue,
      token_confidences: [],
      logprobs: []
    };
  }

  const tokenConfidences = logprobs.map(logprobToProbability);
  const avgConfidence = calculateAverageConfidence(logprobs);

  return {
    value: avgConfidence,
    token_confidences: tokenConfidences,
    logprobs: logprobs
  };
}

/**
 * Zpracuje OpenAI response s logprobs a extrahuje confidence pro každé pole
 * 
 * @param responseText - JSON string z OpenAI response
 * @param logprobs - Logprobs objekt z OpenAI API
 * @returns ConfidenceScores object
 */
export function extractConfidenceScores(
  responseText: string,
  logprobs: any
): { scores: ConfidenceScores; lowConfidenceFields: string[]; avgConfidence: number } {
  const scores: ConfidenceScores = {};
  const lowConfidenceFields: string[] = [];
  const threshold = 0.2; // 20% threshold pro low confidence

  try {
    // Parse JSON response
    const data = JSON.parse(responseText);

    // Získat token_logprobs z response
    const tokenLogprobs = logprobs?.content?.map((item: any) => item.logprob) || [];

    if (tokenLogprobs.length === 0) {
      console.warn('No logprobs available in response');
      return { scores: {}, lowConfidenceFields: [], avgConfidence: 0.5 };
    }

    // Průměrná confidence pro celý response
    const overallConfidence = calculateAverageConfidence(tokenLogprobs);

    // Pro každé pole v response vypočítáme confidence
    // TODO: Ideálně bychom měli mapovat konkrétní tokeny na konkrétní pole
    // Pro teď použijeme průměrnou confidence pro všechna pole
    Object.keys(data).forEach((fieldName) => {
      const fieldValue = data[fieldName];
      
      // Skip prázdných polí
      if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        return;
      }

      // Pro zjednodušení používáme průměrnou confidence
      // V budoucnu můžeme implementovat přesnější mapování token -> pole
      const fieldConfidence: FieldConfidence = {
        value: overallConfidence,
        token_confidences: tokenLogprobs.map(logprobToProbability),
        logprobs: tokenLogprobs
      };

      scores[fieldName] = fieldConfidence;

      // Označit low-confidence pole
      if (fieldConfidence.value < threshold) {
        lowConfidenceFields.push(fieldName);
      }
    });

    return {
      scores,
      lowConfidenceFields,
      avgConfidence: overallConfidence
    };

  } catch (error) {
    console.error('Error extracting confidence scores:', error);
    return {
      scores: {},
      lowConfidenceFields: [],
      avgConfidence: 0
    };
  }
}

/**
 * Vrací CSS třídy pro UI indikátor podle confidence score
 */
export function getConfidenceColorClass(confidence: number): string {
  if (confidence >= 0.8) return 'border-green-500 bg-green-50';
  if (confidence >= 0.5) return 'border-yellow-500 bg-yellow-50';
  if (confidence >= 0.2) return 'border-orange-500 bg-orange-50';
  return 'border-red-500 bg-red-50';
}

/**
 * Vrací emoji indikátor podle confidence score
 */
export function getConfidenceEmoji(confidence: number): string {
  if (confidence >= 0.8) return '✅';
  if (confidence >= 0.5) return '⚠️';
  if (confidence >= 0.2) return '❗';
  return '🚨';
}

/**
 * Formátuje confidence score pro zobrazení (0.8534 => "85%")
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

