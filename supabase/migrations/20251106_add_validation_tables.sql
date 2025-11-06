-- Migration: Add Dual-LLM Validation tables
-- Description: Stores validation results from second LLM auditing first LLM extraction
-- Date: 2025-11-06

-- 1. Add validation fields to paro_records
ALTER TABLE paro_records
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'issues_found', 'skipped')),
ADD COLUMN IF NOT EXISTS validation_confidence DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS validation_timestamp TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN paro_records.validation_status IS 'Status of dual-LLM validation: pending (not validated yet), validated (no issues), issues_found (validator found problems), skipped (validation not needed)';
COMMENT ON COLUMN paro_records.validation_confidence IS 'Validator LLM confidence in primary extraction (0.0-1.0)';
COMMENT ON COLUMN paro_records.validation_timestamp IS 'When validation was performed';

-- 2. Create extraction_validations table
CREATE TABLE IF NOT EXISTS extraction_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES paro_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Validator info
  validator_llm TEXT NOT NULL, -- e.g., "gemini-2.0-flash-exp", "gemini-2.5-pro"
  
  -- Overall results
  is_valid BOOLEAN NOT NULL,
  confidence DECIMAL(3,2) NOT NULL, -- 0.0-1.0
  agreement_percentage INTEGER NOT NULL, -- 0-100
  overall_assessment TEXT,
  
  -- Detailed findings
  hallucinations JSONB DEFAULT '[]'::jsonb, -- Array of hallucination objects
  missing_data JSONB DEFAULT '[]'::jsonb, -- Array of missing data objects
  negation_errors JSONB DEFAULT '[]'::jsonb, -- Array of negation error objects
  correct_fields JSONB DEFAULT '[]'::jsonb, -- Array of correctly extracted fields
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT fk_record FOREIGN KEY (record_id) REFERENCES paro_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_extraction_validations_record_id ON extraction_validations(record_id);
CREATE INDEX IF NOT EXISTS idx_extraction_validations_user_id ON extraction_validations(user_id);
CREATE INDEX IF NOT EXISTS idx_extraction_validations_created_at ON extraction_validations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extraction_validations_is_valid ON extraction_validations(is_valid);

-- Index for paro_records validation status
CREATE INDEX IF NOT EXISTS idx_paro_records_validation_status ON paro_records(validation_status);

-- Comments
COMMENT ON TABLE extraction_validations IS 'Stores results from dual-LLM validation (second LLM audits first LLM extraction)';
COMMENT ON COLUMN extraction_validations.validator_llm IS 'Which LLM model was used as validator (e.g., gemini-2.0-flash-exp)';
COMMENT ON COLUMN extraction_validations.is_valid IS 'Overall validation result: true if extraction is acceptable, false if issues found';
COMMENT ON COLUMN extraction_validations.confidence IS 'Validator LLM confidence in primary extraction quality (0.0-1.0)';
COMMENT ON COLUMN extraction_validations.agreement_percentage IS 'Percentage of fields where validator agrees with primary LLM (0-100)';
COMMENT ON COLUMN extraction_validations.hallucinations IS 'Array of detected hallucinations: {field, primary_value, expected_value, reason, severity}';
COMMENT ON COLUMN extraction_validations.missing_data IS 'Array of data missing from primary extraction: {field, transcript_mentions, primary_value, reason}';
COMMENT ON COLUMN extraction_validations.negation_errors IS 'Array of negation handling errors: {field, transcript_says, primary_value, correct_value, reason}';

-- RLS Policies
ALTER TABLE extraction_validations ENABLE ROW LEVEL SECURITY;

-- Users can view their own validations
CREATE POLICY "Users can view own validations"
ON extraction_validations
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create validations for their own records
CREATE POLICY "Users can create own validations"
ON extraction_validations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own validations
CREATE POLICY "Users can delete own validations"
ON extraction_validations
FOR DELETE
USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON extraction_validations TO authenticated;
GRANT USAGE ON SEQUENCE extraction_validations_id_seq TO authenticated;

