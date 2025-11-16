-- Zkontroluj jestli existují sloupce pro verification
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'paro_records' 
AND column_name IN ('verified_by_hygienist', 'verified_at', 'verified_by')
ORDER BY column_name;

-- Pokud NEJSOU sloupce, spusť toto:
-- ALTER TABLE paro_records 
--   ADD COLUMN IF NOT EXISTS verified_by_hygienist BOOLEAN DEFAULT false,
--   ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
--   ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

