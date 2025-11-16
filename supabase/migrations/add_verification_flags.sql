-- Migration: Add verification flags for hygienist approval
-- This allows hygienists to mark records as "verified" for fine-tuning

ALTER TABLE paro_records 
  ADD COLUMN IF NOT EXISTS verified_by_hygienist BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Index for filtering verified records
CREATE INDEX IF NOT EXISTS idx_paro_records_verified 
ON paro_records (verified_by_hygienist) 
WHERE verified_by_hygienist = true;

-- Index for verified_at timestamp
CREATE INDEX IF NOT EXISTS idx_paro_records_verified_at 
ON paro_records (verified_at) 
WHERE verified_at IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN paro_records.verified_by_hygienist IS 
'TRUE = Hygienistka zkontrolovala a ověřila tento záznam. Použitelné pro fine-tuning.';

COMMENT ON COLUMN paro_records.verified_at IS 
'Timestamp kdy hygienistka ověřila záznam.';

COMMENT ON COLUMN paro_records.verified_by IS 
'User ID hygienistky která záznam ověřila.';

-- View for fine-tuning - only verified records
CREATE OR REPLACE VIEW verified_records_for_training AS
SELECT 
  id, 
  user_id, 
  form_data, 
  llm_original, 
  human_corrections,
  verified_by_hygienist,
  verified_at,
  verified_by,
  quality_rating as llm_rating,
  created_at
FROM paro_records
WHERE 
  deleted = false
  AND verified_by_hygienist = true
  AND llm_original IS NOT NULL
  AND form_data IS NOT NULL
ORDER BY verified_at DESC;

COMMENT ON VIEW verified_records_for_training IS 
'View obsahuje pouze ověřené záznamy pro fine-tuning. Hygienistka je manuálně schválila jako 100% správné.';

