# 🎓 Fine-Tuning Setup - Kompletní Průvodce

## ✅ Co Je Implementováno

### 📱 Mobilní App:
1. ✅ **Diff Calculator** (`utils/diffCalculator.ts`)
   - Porovná original LLM vs finální data
   - Identifikuje opravy hygienistky

2. ✅ **RecordFormScreen Updated**
   - Při Save vypočítá diff
   - Uloží `human_corrections` do DB

### 🌐 Web:
1. ✅ **TypeScript Typy** rozšířeny
   - `HumanCorrections` interface
   - `ParoRecord` s `human_corrections`, `correction_count`, `corrected_at`

2. ✅ **DB Migrace** připravena
   - SQL soubor: `supabase/migrations/add_human_corrections.sql`

3. ✅ **Export API** už existuje
   - `/api/fine-tuning/export`

---

## 🚀 Jak Aplikovat DB Migraci

### Metoda 1: Supabase Dashboard (Doporučeno)

1. **Přihlásit se** na https://supabase.com
2. **Otevřít projekt** EDOWhisper
3. **SQL Editor** (levý panel)
4. **Zkopírovat** obsah `supabase/migrations/add_human_corrections.sql`
5. **Vložit** do SQL Editoru
6. **Spustit** (Cmd/Ctrl + Enter)
7. ✅ **Ověřit**: `SELECT * FROM paro_records LIMIT 1;`
   - Měly by být vidět nové sloupce: `human_corrections`, `correction_count`, `corrected_at`

### Metoda 2: psql Command Line

```bash
# Získat connection string z Supabase Dashboard
export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres'

# Aplikovat migraci
psql $SUPABASE_DB_URL -f supabase/migrations/add_human_corrections.sql

# Ověřit
psql $SUPABASE_DB_URL -c "
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'paro_records' 
  AND column_name IN ('human_corrections', 'correction_count', 'corrected_at');
"
```

### Očekávaný Výstup:
```
      column_name       |     data_type      
------------------------+-------------------
 human_corrections      | jsonb
 correction_count       | integer
 corrected_at           | timestamp with time zone
```

---

## 📊 Jak To Funguje - Krok za Krokem

### 1. **Hygienistka Nahraje Audio**
```
📱 Mobilní App
  ↓
🎤 Audio → Whisper → Přepis
  ↓
💾 Přepis uložen IHNED (před LLM)
  ↓
🤖 LLM Extrakce (GPT-4o)
  ↓
📋 Original output uložen do `llm_original`
  ↓
Formulář otevřen s předvyplněnými daty
```

### 2. **Hygienistka Opraví Chyby**
```
✏️ Změní "Novák" → "Novotný"
✏️ Doplní diagnózu
✏️ Upraví hodnoty
  ↓
💾 Klikne "Uložit"
```

### 3. **Diff Calculation & Save**
```typescript
// RecordFormScreen.tsx - řádek 284

const diffResult = calculateDiff(originalLLMOutput, formData);

// Výsledek:
{
  corrections: {
    lastName: {
      llm: "Novák",
      human: "Novotný",
      action: "corrected"
    }
  },
  correctionCount: 1,
  modifiedFields: ["lastName"]
}

// Uložit do DB
UPDATE paro_records SET
  human_corrections = '{"lastName": {"llm": "Novák", "human": "Novotný", "action": "corrected"}}',
  correction_count = 1,
  corrected_at = NOW()
WHERE id = ...;
```

### 4. **Ohodnocení Na Webu**
```
🌐 Web dashboard
  ↓
⭐ Hygienistka ohodnotí 1-5 hvězdiček
  ↓
💾 Rating uložen do `llm_rating`
```

### 5. **Export Pro Fine-Tuning**
```
🌐 Dashboard → "Export Fine-Tuning Data"
  ↓
⚙️ Filter:
   - rating >= 4 (jen kvalitní záznamy)
   - correction_count > 0 (záznamy s opravami)
  ↓
📥 Stáhne training_data.jsonl
```

### 6. **OpenAI Fine-Tuning**
```bash
# Nahrát data
openai api files.create -f training_data.jsonl -p fine-tune

# Spustit fine-tuning
openai api fine_tuning.jobs.create -t FILE_ID -m gpt-4o-2024-08-06

# Získat nový model
# ft:gpt-4o-2024-08-06:edowhisper:v2:abc123
```

### 7. **Aktualizovat App**
```bash
# .env v mobilní app
EXPO_PUBLIC_OPENAI_MODEL=ft:gpt-4o-2024-08-06:edowhisper:v2:abc123

# Rebuild
eas build --platform ios
```

---

## 📋 Fine-Tuning Data Format

### Příklad Exportovaného Záznamu:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "Jsi profesionální parodontální asistentka..."
    },
    {
      "role": "user",
      "content": "Přepis: Pacient Novák, rodné číslo 850312/1234..."
    },
    {
      "role": "assistant",
      "content": "{\"lastName\": \"Novotný\", \"personalIdNumber\": \"850312/1234\", ...}"
    }
  ]
}
```

**Klíč:** `assistant` obsahuje **OPRAVENOU** verzi (ne original)!

---

## 🎯 Filtrace Záznamů Pro Fine-Tuning

### View: `fine_tuning_records`

```sql
SELECT * FROM fine_tuning_records
WHERE quality_score IN ('perfect', 'excellent', 'good')
ORDER BY created_at DESC;
```

**Quality Score:**
- `perfect`: rating >= 4, correction_count = 0 (LLM bylo perfektní)
- `excellent`: rating >= 4, correction_count <= 2 (jen drobné opravy)
- `good`: rating >= 3, correction_count <= 5 (pár oprav)
- `poor`: correction_count > 5 (hodně oprav - nepoužívat)
- `unrated`: bez ratingu

---

## 📊 Statistiky

### Kontrola Dat v DB:

```sql
-- Kolik záznamů má opravy?
SELECT 
  COUNT(*) FILTER (WHERE correction_count > 0) as with_corrections,
  COUNT(*) FILTER (WHERE correction_count = 0) as without_corrections,
  AVG(correction_count) as avg_corrections_per_record
FROM paro_records
WHERE llm_original IS NOT NULL AND deleted = false;

-- Nejčastěji opravovaná pole
SELECT 
  jsonb_object_keys(human_corrections) as field_name,
  COUNT(*) as correction_frequency
FROM paro_records
WHERE human_corrections IS NOT NULL
GROUP BY field_name
ORDER BY correction_frequency DESC
LIMIT 10;

-- Záznamy připravené pro fine-tuning
SELECT 
  quality_score,
  COUNT(*) as count
FROM fine_tuning_records
GROUP BY quality_score
ORDER BY count DESC;
```

---

## 🔄 Pravidelný Export Workflow

### Týdně/Měsíčně:

1. **Dashboard** → "Export Fine-Tuning Data"
2. **Filtr**:
   - Datum od: posledních 30 dní
   - Rating >= 4
   - Correction count > 0
3. **Stáhnout** `training_data_2024-11-16.jsonl`
4. **Nahrát na OpenAI**
5. **Spustit Fine-Tuning**
6. **Testovat nový model**
7. **Deploy do produkce**

---

## ✅ Checklist - Co Máme Hotové

- [x] Diff calculator utility
- [x] RecordFormScreen - diff calculation
- [x] DB migrace SQL prepared
- [x] TypeScript typy rozšířeny
- [x] Export API existuje
- [ ] **Aplikovat DB migraci** (nutné udělat ručně)
- [ ] Export UI tlačítko (můžeme přidat později)
- [ ] První fine-tuning run (až budou data)

---

## 🚀 Další Kroky

1. **HNED TEĎ**: Aplikovat DB migraci (viz výše)
2. **Rebuild mobilní app** (aby se použil nový diff calculator)
3. **Nahrát pár záznamů** (otestovat diff calculation)
4. **Zkontrolovat DB** (měly by být vidět corrections)
5. **Za týden**: První export & fine-tuning

---

## 🎉 Hotovo!

**Systém je připravený na učení!** 🚀

Každá oprava hygienistky se nyní automaticky ukládá a připravuje pro fine-tuning.

