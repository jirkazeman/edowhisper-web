# 🔧 Databázová Migrace: Confidence Scoring

## Metoda 1: Přes Supabase Dashboard (Doporučeno ✅)

1. Otevřete [Supabase Dashboard](https://supabase.com/dashboard)
2. Vyberte projekt **edowhisper**
3. Vlevo: **SQL Editor** → **New query**
4. Zkopírujte celý obsah souboru:
   ```
   supabase/migrations/add_confidence_scoring.sql
   ```
5. Vložte do SQL Editoru
6. Klikněte **Run** (Ctrl/Cmd + Enter)
7. Zkontrolujte výsledek:
   ```sql
   -- Ověření, že sloupce existují
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'paro_records' 
   AND column_name IN (
     'confidence_scores',
     'low_confidence_fields',
     'gemini_corrections',
     'correction_history',
     'validation_method',
     'avg_confidence'
   );
   ```

---

## Metoda 2: Přes psql (Advanced)

```bash
# 1. Nastavit connection string
export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres'

# 2. Aplikovat migraci
cd /Users/jirizeman/dev/edowhisper-web
psql "$SUPABASE_DB_URL" < supabase/migrations/add_confidence_scoring.sql
```

---

## Metoda 3: Automatický skript

```bash
cd /Users/jirizeman/dev/edowhisper-web
./scripts/apply-confidence-migration.sh
```

*(Vyžaduje nastavenou SUPABASE_DB_URL)*

---

## ✅ Ověření migrace

Po aplikaci spusťte tento query v SQL Editoru:

```sql
-- Test 1: Zkontrolovat sloupce
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'paro_records'
AND column_name LIKE '%confidence%' OR column_name LIKE '%gemini%' OR column_name LIKE '%correction%';

-- Test 2: Zkontrolovat indexy
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'paro_records'
AND indexname LIKE '%confidence%';

-- Test 3: Vložit testovací data
INSERT INTO paro_records (
  user_id,
  form_data,
  confidence_scores,
  low_confidence_fields,
  avg_confidence,
  validation_method
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  '{"lastName": "Test"}'::jsonb,
  '{"lastName": {"value": 0.95}}'::jsonb,
  ARRAY[]::text[],
  0.95,
  'single'
) RETURNING id, confidence_scores, low_confidence_fields;
```

Pokud všechny 3 testy projdou ✅, migrace je úspěšná!

---

## 🔄 Rollback (v případě problémů)

```sql
-- Vrátit zpět změny
ALTER TABLE paro_records DROP COLUMN IF EXISTS confidence_scores;
ALTER TABLE paro_records DROP COLUMN IF EXISTS low_confidence_fields;
ALTER TABLE paro_records DROP COLUMN IF EXISTS gemini_corrections;
ALTER TABLE paro_records DROP COLUMN IF EXISTS correction_history;
ALTER TABLE paro_records DROP COLUMN IF EXISTS validation_method;
ALTER TABLE paro_records DROP COLUMN IF EXISTS avg_confidence;

DROP INDEX IF EXISTS idx_paro_records_low_confidence;
DROP INDEX IF EXISTS idx_paro_records_confidence_scores;
DROP INDEX IF EXISTS idx_paro_records_avg_confidence;
DROP INDEX IF EXISTS idx_paro_records_validation_method;
```

---

## 📝 Poznámky

- Migrace je **nedestruktivní** - nepřepíše existující data
- Nové sloupce mají výchozí hodnoty (prázdné objekty/pole)
- Indexy zrychlí dotazy na low-confidence záznamy
- Migrace trvá ~5 sekund

---

**Po úspěšné migraci pokračujte s implementací UI! 🚀**

