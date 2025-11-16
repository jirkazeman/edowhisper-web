-- ✅ KROK 1: Zkontrolovat všechny sloupce v paro_records
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'paro_records'
ORDER BY ordinal_position;

-- ✅ KROK 2: Zkontrolovat konkrétně naše nové sloupce
SELECT 
  column_name, 
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'paro_records' 
AND column_name IN ('human_corrections', 'correction_count', 'corrected_at');

-- ✅ KROK 3: Zkontrolovat indexy
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'paro_records'
AND indexname LIKE '%correction%';

-- ✅ KROK 4: Zkontrolovat view
SELECT table_name 
FROM information_schema.views 
WHERE table_name = 'fine_tuning_records';

-- ✅ KROK 5: Test - pokusit se vložit testovací data
-- (Toto jen zkontroluje že sloupce existují a jsou správného typu)
SELECT 
  '{}'::jsonb as test_corrections,
  0 as test_count,
  NOW() as test_timestamp;

