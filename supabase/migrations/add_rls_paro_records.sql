-- Migration: Přidat Row Level Security (RLS) pro paro_records
-- Zajistí, že každý uživatel vidí POUZE své vlastní záznamy

-- 1. Zapnout RLS pro paro_records tabulku
ALTER TABLE paro_records ENABLE ROW LEVEL SECURITY;

-- 2. Politiky pro SELECT (čtení)
CREATE POLICY "Users can view only their own records"
  ON paro_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Politiky pro INSERT (vytváření)
CREATE POLICY "Users can create records for themselves"
  ON paro_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Politiky pro UPDATE (aktualizace)
CREATE POLICY "Users can update their own records"
  ON paro_records
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Politiky pro DELETE (mazání - soft delete via deleted flag)
CREATE POLICY "Users can delete their own records"
  ON paro_records
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE paro_records IS 'Parodontální záznamy - každý uživatel vidí pouze své záznamy díky RLS';

