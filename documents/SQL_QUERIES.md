# 📊 Užitečné SQL dotazy pro Fine-Tuning

Sbírka SQL dotazů pro analýzu hodnocení a export dat.

---

## 📈 Statistiky

### Základní přehled

```sql
-- Celkové statistiky hodnocení
SELECT 
  COUNT(*) as total_records,
  COUNT(llm_original) as records_with_ai,
  COUNT(quality_rating) as rated_records,
  ROUND(AVG(quality_rating), 2) as avg_rating,
  ROUND(100.0 * COUNT(quality_rating) / NULLIF(COUNT(*), 0), 1) as rated_percentage
FROM paro_records;
```

### Rozložení hodnocení

```sql
-- Počet záznamů podle hodnocení
SELECT 
  quality_rating,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage,
  CASE quality_rating
    WHEN 5 THEN '⭐⭐⭐⭐⭐ Vynikající'
    WHEN 4 THEN '⭐⭐⭐⭐   Dobré'
    WHEN 3 THEN '⭐⭐⭐     Průměrné'
    WHEN 2 THEN '⭐⭐       Špatné'
    WHEN 1 THEN '⭐         Velmi špatné'
  END as description
FROM paro_records
WHERE quality_rating IS NOT NULL
GROUP BY quality_rating
ORDER BY quality_rating DESC;
```

### Trend hodnocení v čase

```sql
-- Průměrné hodnocení po týdnech
SELECT 
  DATE_TRUNC('week', rated_at) as week,
  COUNT(*) as rated_count,
  ROUND(AVG(quality_rating), 2) as avg_rating
FROM paro_records
WHERE rated_at IS NOT NULL
GROUP BY week
ORDER BY week DESC;
```

---

## 👥 Statistiky podle hygienistek

### Hodnocení podle hygienistky

```sql
-- Kolik hodnocení má každá hygienistka
SELECT 
  rated_by,
  COUNT(*) as total_ratings,
  ROUND(AVG(quality_rating), 2) as avg_rating,
  COUNT(*) FILTER (WHERE hygienist_feedback IS NOT NULL) as with_feedback
FROM paro_records
WHERE rated_at IS NOT NULL
GROUP BY rated_by
ORDER BY total_ratings DESC;
```

### Nejaktivnější hodnotitelé

```sql
-- Top 5 hygienistek podle počtu hodnocení
SELECT 
  rated_by,
  COUNT(*) as ratings_count,
  ROUND(AVG(quality_rating), 2) as avg_rating
FROM paro_records
WHERE rated_at IS NOT NULL
GROUP BY rated_by
ORDER BY ratings_count DESC
LIMIT 5;
```

---

## 🔍 Analýza kvality

### Záznamy s nízkou kvalitou

```sql
-- Najít záznamy s hodnocením 1-2 (špatné výsledky)
SELECT 
  id,
  quality_rating,
  hygienist_feedback,
  rated_at,
  form_data->>'lastName' as patient_name
FROM paro_records
WHERE quality_rating <= 2
ORDER BY rated_at DESC
LIMIT 20;
```

### Záznamy bez zpětné vazby

```sql
-- Ohodnocené záznamy bez textové zpětné vazby
SELECT 
  id,
  quality_rating,
  rated_at,
  form_data->>'lastName' as patient_name
FROM paro_records
WHERE quality_rating IS NOT NULL
  AND (hygienist_feedback IS NULL OR hygienist_feedback = '')
ORDER BY rated_at DESC;
```

### Vynikající záznamy (pro benchmark)

```sql
-- Záznamy s hodnocením 5 (použít jako reference)
SELECT 
  id,
  hygienist_feedback,
  form_data->>'lastName' as patient_name,
  llm_original->>'model' as ai_model
FROM paro_records
WHERE quality_rating = 5
ORDER BY rated_at DESC
LIMIT 10;
```

---

## 💾 Export dat

### Kvalitní data pro fine-tuning

```sql
-- Export jen kvalitních záznamů (rating >= 4)
SELECT 
  id,
  llm_original,
  form_data,
  quality_rating,
  hygienist_feedback,
  rated_at
FROM paro_records
WHERE quality_rating >= 4
  AND llm_original IS NOT NULL
ORDER BY rated_at DESC;
```

### Kompletní dataset

```sql
-- Export všech ohodnocených záznamů
SELECT 
  id,
  llm_original->>'raw_response' as ai_output,
  llm_original->>'transcript' as original_transcript,
  llm_original->>'model' as ai_model,
  form_data,
  quality_rating,
  hygienist_feedback,
  rated_at,
  created_at,
  rated_by
FROM paro_records
WHERE quality_rating IS NOT NULL
  AND llm_original IS NOT NULL
ORDER BY rated_at DESC;
```

### Data s metadaty

```sql
-- Export s token usage a dalšími metadaty
SELECT 
  id,
  llm_original->>'model' as model,
  (llm_original->'usage'->>'prompt_tokens')::int as prompt_tokens,
  (llm_original->'usage'->>'completion_tokens')::int as completion_tokens,
  (llm_original->'usage'->>'total_tokens')::int as total_tokens,
  quality_rating,
  LENGTH(llm_original->>'raw_response') as response_length,
  LENGTH(llm_original->>'transcript') as transcript_length,
  rated_at
FROM paro_records
WHERE llm_original IS NOT NULL
  AND quality_rating IS NOT NULL
ORDER BY rated_at DESC;
```

---

## 📊 Analýza nákladů

### Token usage statistiky

```sql
-- Celkové token usage
SELECT 
  COUNT(*) as total_records,
  SUM((llm_original->'usage'->>'prompt_tokens')::int) as total_prompt_tokens,
  SUM((llm_original->'usage'->>'completion_tokens')::int) as total_completion_tokens,
  SUM((llm_original->'usage'->>'total_tokens')::int) as total_tokens,
  ROUND(AVG((llm_original->'usage'->>'total_tokens')::int), 0) as avg_tokens_per_record
FROM paro_records
WHERE llm_original->'usage' IS NOT NULL;
```

### Náklady podle modelu

```sql
-- Token usage podle AI modelu
SELECT 
  llm_original->>'model' as model,
  COUNT(*) as records,
  SUM((llm_original->'usage'->>'total_tokens')::int) as total_tokens,
  ROUND(AVG(quality_rating), 2) as avg_rating
FROM paro_records
WHERE llm_original IS NOT NULL
  AND quality_rating IS NOT NULL
GROUP BY model
ORDER BY records DESC;
```

---

## 🔄 Údržba databáze

### Nehotové záznamy

```sql
-- Záznamy s AI výstupem, ale bez hodnocení
SELECT 
  id,
  created_at,
  form_data->>'lastName' as patient_name,
  llm_original->>'model' as ai_model
FROM paro_records
WHERE llm_original IS NOT NULL
  AND quality_rating IS NULL
ORDER BY created_at ASC
LIMIT 50;
```

### Staré neohodnocené záznamy

```sql
-- Záznamy starší než 30 dní bez hodnocení
SELECT 
  id,
  created_at,
  form_data->>'lastName' as patient_name,
  AGE(NOW(), created_at) as age
FROM paro_records
WHERE llm_original IS NOT NULL
  AND quality_rating IS NULL
  AND created_at < NOW() - INTERVAL '30 days'
ORDER BY created_at ASC;
```

### Duplicitní záznamy

```sql
-- Najít možné duplicity (stejné rodné číslo, blízký čas)
SELECT 
  form_data->>'personalIdNumber' as personal_id,
  COUNT(*) as count,
  ARRAY_AGG(id) as record_ids,
  MIN(created_at) as first_created,
  MAX(created_at) as last_created
FROM paro_records
WHERE form_data->>'personalIdNumber' IS NOT NULL
GROUP BY form_data->>'personalIdNumber'
HAVING COUNT(*) > 1
ORDER BY count DESC;
```

---

## 📝 Zpětná vazba

### Nejčastější problémy

```sql
-- Word cloud z hygienist_feedback (manuální analýza)
SELECT 
  hygienist_feedback,
  quality_rating,
  COUNT(*) as frequency
FROM paro_records
WHERE hygienist_feedback IS NOT NULL
  AND LENGTH(hygienist_feedback) > 10
GROUP BY hygienist_feedback, quality_rating
ORDER BY frequency DESC
LIMIT 20;
```

### Feedback podle hodnocení

```sql
-- Zpětná vazba pro různá hodnocení
SELECT 
  quality_rating,
  hygienist_feedback,
  form_data->>'lastName' as patient_name,
  rated_at
FROM paro_records
WHERE hygienist_feedback IS NOT NULL
  AND quality_rating IN (1, 2, 5)  -- Extrémní hodnocení
ORDER BY quality_rating ASC, rated_at DESC
LIMIT 30;
```

---

## 🎯 Monitoring progress

### Denní přehled

```sql
-- Hodnocení za poslední týden
SELECT 
  DATE(rated_at) as date,
  COUNT(*) as ratings,
  ROUND(AVG(quality_rating), 2) as avg_rating,
  COUNT(*) FILTER (WHERE hygienist_feedback IS NOT NULL) as with_feedback
FROM paro_records
WHERE rated_at >= NOW() - INTERVAL '7 days'
GROUP BY date
ORDER BY date DESC;
```

### Progress k cíli

```sql
-- Kolik zbývá do cíle (např. 200 hodnocení)
WITH stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE quality_rating IS NOT NULL) as rated,
    COUNT(*) FILTER (WHERE llm_original IS NOT NULL AND quality_rating IS NULL) as pending,
    200 as target
  FROM paro_records
)
SELECT 
  rated,
  pending,
  target,
  target - rated as remaining,
  ROUND(100.0 * rated / target, 1) as progress_percentage,
  CASE 
    WHEN rated >= target THEN '✅ Cíl splněn!'
    WHEN rated >= target * 0.5 THEN '🟡 Půlka cesty'
    ELSE '🔴 Potřebujeme více hodnocení'
  END as status
FROM stats;
```

---

## 🚀 Před fine-tuningem

### Validace dat

```sql
-- Ověření, že máme vše potřebné
SELECT 
  COUNT(*) as total_records,
  
  -- Máme původní AI výstupy?
  COUNT(*) FILTER (WHERE llm_original IS NOT NULL) as has_llm_data,
  COUNT(*) FILTER (WHERE llm_original->>'raw_response' IS NOT NULL) as has_raw_response,
  COUNT(*) FILTER (WHERE llm_original->>'transcript' IS NOT NULL) as has_transcript,
  
  -- Máme hodnocení?
  COUNT(*) FILTER (WHERE quality_rating IS NOT NULL) as has_rating,
  COUNT(*) FILTER (WHERE quality_rating >= 4) as high_quality,
  
  -- Kompletní záznamy (vše dohromady)
  COUNT(*) FILTER (
    WHERE llm_original IS NOT NULL 
      AND quality_rating IS NOT NULL
      AND llm_original->>'raw_response' IS NOT NULL
      AND llm_original->>'transcript' IS NOT NULL
  ) as complete_records
FROM paro_records;
```

### Kontrola velikosti dat

```sql
-- Kontrola, že data nejsou příliš velká/malá
SELECT 
  id,
  LENGTH(llm_original->>'raw_response') as response_length,
  LENGTH(llm_original->>'transcript') as transcript_length,
  quality_rating,
  CASE 
    WHEN LENGTH(llm_original->>'transcript') < 50 THEN '⚠️ Příliš krátký transcript'
    WHEN LENGTH(llm_original->>'raw_response') < 100 THEN '⚠️ Příliš krátká odpověď'
    WHEN LENGTH(llm_original->>'transcript') > 50000 THEN '⚠️ Příliš dlouhý transcript'
    ELSE '✅ OK'
  END as validation
FROM paro_records
WHERE llm_original IS NOT NULL
  AND quality_rating IS NOT NULL
ORDER BY response_length DESC;
```

---

## 💡 Užitečné Views

### Vytvoření view pro export

```sql
-- View pro snadný přístup k fine-tuning datům
CREATE OR REPLACE VIEW fine_tuning_export AS
SELECT 
  id,
  llm_original->>'transcript' as input_text,
  llm_original->>'raw_response' as ai_output,
  form_data as corrected_output,
  quality_rating,
  hygienist_feedback,
  llm_original->>'model' as model_used,
  rated_at,
  created_at
FROM paro_records
WHERE llm_original IS NOT NULL
  AND quality_rating IS NOT NULL
  AND quality_rating >= 4;

-- Použití:
SELECT * FROM fine_tuning_export ORDER BY rated_at DESC;
```

---

## 🔧 Utility queries

### Vyčištění testovacích dat

```sql
-- POZOR: Toto SMAŽE data! Jen pro development.
DELETE FROM paro_records
WHERE form_data->>'lastName' LIKE '%TEST%'
   OR form_data->>'lastName' LIKE '%test%';
```

### Reset hodnocení (pro re-rating)

```sql
-- POZOR: Toto SMAŽE hodnocení!
UPDATE paro_records
SET 
  quality_rating = NULL,
  hygienist_feedback = NULL,
  rated_at = NULL,
  rated_by = NULL
WHERE id IN ('uuid1', 'uuid2', 'uuid3');
```

---

**Tip:** Uložte si tyto dotazy jako "saved queries" v Supabase SQL Editoru! 💡

