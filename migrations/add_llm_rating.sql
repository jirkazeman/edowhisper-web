-- ================================================
-- EDO WHISPER - LLM ORIGINAL DATA & RATING SYSTEM
-- ================================================
-- Přidání sloupců pro uložení původního LLM výstupu
-- a hodnocení hygienistky pro fine-tuning

-- 1. Přidej sloupec pro původní LLM data
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS llm_original JSONB;

-- 2. Přidej sloupce pro hodnocení hygienistky
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS hygienist_feedback TEXT,
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rated_by UUID REFERENCES auth.users(id);

-- 3. Komentáře
COMMENT ON COLUMN paro_records.llm_original 
IS 'Původní výstup z LLM před úpravami hygienistky - pro fine-tuning';

COMMENT ON COLUMN paro_records.quality_rating 
IS 'Hodnocení kvality LLM výstupu od hygienistky (1-5): 1=velmi špatné, 5=vynikající';

COMMENT ON COLUMN paro_records.hygienist_feedback 
IS 'Textová zpětná vazba od hygienistky k LLM výstupu';

COMMENT ON COLUMN paro_records.rated_at 
IS 'Datum a čas hodnocení';

COMMENT ON COLUMN paro_records.rated_by 
IS 'ID hygienistky, která záznam ohodnotila';

-- 4. Indexy pro rychlejší dotazy
CREATE INDEX IF NOT EXISTS idx_paro_records_llm_original 
ON paro_records(llm_original) 
WHERE llm_original IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_paro_records_quality_rating 
ON paro_records(quality_rating) 
WHERE quality_rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_paro_records_rated_at 
ON paro_records(rated_at) 
WHERE rated_at IS NOT NULL;

-- 5. RLS Policy pro hodnocení (hygienistka může hodnotit své záznamy)
CREATE POLICY "Users can rate their own records" ON paro_records
FOR UPDATE USING (auth.uid() = user_id);

-- 6. Verify
SELECT 'LLM rating system added successfully!' as status;

-- 7. Test query
SELECT 
  COUNT(*) as total_records,
  COUNT(llm_original) as records_with_llm_data,
  COUNT(quality_rating) as rated_records,
  ROUND(AVG(quality_rating), 2) as avg_rating,
  ROUND(100.0 * COUNT(quality_rating) / NULLIF(COUNT(*), 0), 1) as rated_percentage
FROM paro_records;

