-- Migration: Add Confidence Scoring & Dual-LLM Validation Support
-- Created: 2025-11-16
-- Purpose: Enable multi-layer quality control with confidence scores and Gemini validation

-- 1. Add confidence_scores column (JSONB)
-- Struktura: { "fieldName": { "value": 0.85, "token_confidences": [...] } }
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS confidence_scores JSONB DEFAULT '{}'::jsonb;

-- 2. Add low_confidence_fields column (TEXT[])
-- Array of field names with confidence < 20%
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS low_confidence_fields TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Add gemini_corrections column (JSONB)
-- Struktura: { "fieldName": { "original": "...", "suggested": "...", "reason": "...", "confidence": 0.95, "accepted": true } }
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS gemini_corrections JSONB DEFAULT '{}'::jsonb;

-- 4. Add correction_history column (JSONB[])
-- Array of correction events for fine-tuning feedback loop
-- Struktura: [{ "field": "lastName", "original": "...", "gemini_suggested": "...", "final": "...", "timestamp": "...", "corrected_by": "..." }]
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS correction_history JSONB[] DEFAULT ARRAY[]::JSONB[];

-- 5. Add validation_method column (TEXT)
-- Track which validation method was used: 'single', 'dual-llm', 'human-reviewed'
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS validation_method TEXT DEFAULT 'single';

-- 6. Add avg_confidence column (NUMERIC) for quick filtering
-- Average confidence across all fields
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS avg_confidence NUMERIC(5,4) DEFAULT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paro_records_low_confidence 
ON paro_records USING GIN (low_confidence_fields);

CREATE INDEX IF NOT EXISTS idx_paro_records_confidence_scores 
ON paro_records USING GIN (confidence_scores);

CREATE INDEX IF NOT EXISTS idx_paro_records_avg_confidence 
ON paro_records (avg_confidence) 
WHERE avg_confidence < 0.5;

CREATE INDEX IF NOT EXISTS idx_paro_records_validation_method 
ON paro_records (validation_method);

-- Add comments
COMMENT ON COLUMN paro_records.confidence_scores IS 
'JSONB object containing confidence scores for each extracted field. Structure: { "fieldName": { "value": 0.85, "token_confidences": [...] } }';

COMMENT ON COLUMN paro_records.low_confidence_fields IS 
'Array of field names with confidence score below threshold (< 20%). Triggers Gemini validation.';

COMMENT ON COLUMN paro_records.gemini_corrections IS 
'JSONB object containing Gemini validation suggestions for low-confidence fields. Structure: { "fieldName": { "original": "...", "suggested": "...", "reason": "...", "confidence": 0.95, "accepted": true } }';

COMMENT ON COLUMN paro_records.correction_history IS 
'Array of correction events tracking original value → Gemini suggestion → final hygienist correction. Used for fine-tuning feedback loop.';

COMMENT ON COLUMN paro_records.validation_method IS 
'Validation method used: single (OpenAI only), dual-llm (OpenAI + Gemini), human-reviewed';

COMMENT ON COLUMN paro_records.avg_confidence IS 
'Average confidence score across all extracted fields. Used for quick filtering and quality metrics.';

