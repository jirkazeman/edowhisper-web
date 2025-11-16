-- Migration: Add Human Corrections for Fine-Tuning
-- Created: 2025-11-16
-- Purpose: Sledovat opravy hygienistek pro učení LLM

-- 1. Add human_corrections column (JSONB)
-- Struktura: { "fieldName": { "llm": "...", "human": "...", "action": "corrected" } }
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS human_corrections JSONB DEFAULT '{}'::jsonb;

-- 2. Add correction_count column (INTEGER)
-- Počet polí, která hygienistka opravila
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS correction_count INTEGER DEFAULT 0;

-- 3. Add corrected_at column (TIMESTAMPTZ)
-- Kdy byly provedeny poslední opravy
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS corrected_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paro_records_human_corrections 
ON paro_records USING GIN (human_corrections);

CREATE INDEX IF NOT EXISTS idx_paro_records_correction_count 
ON paro_records (correction_count) 
WHERE correction_count > 0;

CREATE INDEX IF NOT EXISTS idx_paro_records_corrected_at 
ON paro_records (corrected_at) 
WHERE corrected_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN paro_records.human_corrections IS 
'JSONB object containing human corrections for each field. Structure: { "fieldName": { "llm": "original", "human": "corrected", "action": "corrected/added/removed" } }';

COMMENT ON COLUMN paro_records.correction_count IS 
'Number of fields corrected by the hygienist. Used for filtering records suitable for fine-tuning.';

COMMENT ON COLUMN paro_records.corrected_at IS 
'Timestamp when corrections were last made. Useful for tracking when data was manually reviewed.';

-- Create view for fine-tuning export (záznamy vhodné pro učení)
CREATE OR REPLACE VIEW fine_tuning_records AS
SELECT 
  id,
  user_id,
  form_data,
  llm_original,
  human_corrections,
  correction_count,
  llm_rating,
  created_at,
  corrected_at,
  -- Vypočítat "quality score" pro fine-tuning
  CASE 
    WHEN llm_rating >= 4 AND correction_count = 0 THEN 'perfect'  -- LLM bylo perfektní
    WHEN llm_rating >= 4 AND correction_count <= 2 THEN 'excellent'  -- Jen drobné opravy
    WHEN llm_rating >= 3 AND correction_count <= 5 THEN 'good'  -- Pár oprav
    WHEN correction_count > 5 THEN 'poor'  -- Hodně oprav
    ELSE 'unrated'
  END as quality_score
FROM paro_records
WHERE 
  deleted = false
  AND llm_original IS NOT NULL  -- Musí mít original LLM output
  AND form_data IS NOT NULL  -- Musí mít finální data
ORDER BY created_at DESC;

COMMENT ON VIEW fine_tuning_records IS 
'View of records suitable for fine-tuning export. Includes quality scoring based on ratings and correction count.';

