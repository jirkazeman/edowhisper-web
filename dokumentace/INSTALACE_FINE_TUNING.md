# ⚡ Instalace Fine-Tuning systému - START ZDE

Toto je **hlavní dokument** pro zprovoznění systému hodnocení AI.

---

## 📋 Co bylo vytvořeno

### ✅ Databáze

- **SQL migrace:** `migrations/add_llm_rating.sql`
- Přidány sloupce: `llm_original`, `quality_rating`, `hygienist_feedback`, `rated_at`, `rated_by`

### ✅ Backend

- **TypeScript typy:** `lib/types.ts` (aktualizováno)
- **API endpoint:** `app/api/records/route.ts` (přidán PATCH method)
- **API helper:** `lib/api.ts` (aktualizován s `llmOriginal` parametrem)

### ✅ Frontend

- **UI pro hodnocení:** `app/dashboard/records/[id]/page.tsx` (přidána sekce hodnocení)
- Hvězdičkové hodnocení 1-5
- Textové pole pro zpětnou vazbu
- Vizualizace původního AI výstupu

### ✅ Export & Skripty

- **Export script:** `scripts/export-fine-tuning-data.ts`
- Převádí data do OpenAI JSONL formátu

### ✅ Dokumentace

| Soubor | Pro koho | Popis |
|--------|----------|-------|
| `FINE_TUNING_QUICKSTART.md` | Vývojáři | Rychlý start (5 kroků) |
| `FINE_TUNING_GUIDE.md` | Vývojáři | Detailní technická dokumentace |
| `INTEGRATION_EXAMPLE.md` | Vývojáři | Příklady kódu pro integraci |
| `SQL_QUERIES.md` | Vývojáři/Admin | Užitečné SQL dotazy |
| `README_FINE_TUNING.md` | Všichni | Hlavní přehled systému |
| `FINE_TUNING_CZ.md` | Hygienistky | Jednoduchý návod v češtině |

---

## 🚀 INSTALACE (3 kroky)

### ⚠️ DŮLEŽITÉ: Toto musíte udělat TEĎKA!

---

### KROK 1: Spusťte SQL migraci v Supabase

1. **Přihlaste se do Supabase:** https://supabase.com/dashboard
2. **Vyberte váš projekt** (edowhisper-web)
3. **Jděte do: SQL Editor** (v levém menu)
4. **Klikněte: "+ New Query"**
5. **Zkopírujte celý obsah souboru:** `migrations/add_llm_rating.sql`
6. **Vložte do editoru a klikněte "Run"**

**Nebo zkopírujte toto:**

```sql
-- ================================================
-- EDO WHISPER - LLM ORIGINAL DATA & RATING SYSTEM
-- ================================================

-- 1. Přidej sloupce
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS llm_original JSONB,
ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS hygienist_feedback TEXT,
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rated_by UUID REFERENCES auth.users(id);

-- 2. Komentáře
COMMENT ON COLUMN paro_records.llm_original 
IS 'Původní výstup z LLM před úpravami hygienistky - pro fine-tuning';

COMMENT ON COLUMN paro_records.quality_rating 
IS 'Hodnocení kvality LLM výstupu od hygienistky (1-5)';

COMMENT ON COLUMN paro_records.hygienist_feedback 
IS 'Textová zpětná vazba od hygienistky k LLM výstupu';

-- 3. Indexy
CREATE INDEX IF NOT EXISTS idx_paro_records_llm_original 
ON paro_records(llm_original) 
WHERE llm_original IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_paro_records_quality_rating 
ON paro_records(quality_rating) 
WHERE quality_rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_paro_records_rated_at 
ON paro_records(rated_at) 
WHERE rated_at IS NOT NULL;

-- 4. RLS Policy
CREATE POLICY "Users can rate their own records" ON paro_records
FOR UPDATE USING (auth.uid() = user_id);

-- 5. Ověření
SELECT 'LLM rating system added successfully!' as status;
```

**Výstup by měl být:** `✅ LLM rating system added successfully!`

---

### KROK 2: Integrujte do vašeho kódu

**Najděte místo, kde vytváříte nový záznam z AI.**

Pravděpodobně hledáte něco jako:

```typescript
// Vaš současný kód (najděte toto)
const record = await recordsAPI.create(formData, userId);
```

**Změňte na:**

```typescript
// Nový kód s ukládáním původního AI výstupu
const record = await recordsAPI.create(
  formData, 
  userId,
  {
    raw_response: aiOutput,       // Původní AI výstup (JSON string)
    transcript: transcript,        // Původní transkript
    model: "gpt-4",               // Použitý model
    timestamp: new Date().toISOString()
  }
);
```

**Kde to najdu?** Hledejte:
- Soubor s OpenAI voláním
- Kde se zpracovává audio transkript
- Handler pro vytváření záznamů

📖 **Detailní příklady:** `INTEGRATION_EXAMPLE.md`

---

### KROK 3: Deploy & Test

```bash
# 1. Commitněte změny (všechny soubory již jsou v projektu)
git add .
git commit -m "feat: přidán systém hodnocení AI pro fine-tuning"

# 2. Push & deploy
git push

# 3. Test v produkci
# - Otevřete detail jakéhokoliv záznamu
# - Pokud má llm_original, uvidíte modrý box s hodnocením
```

---

## ✅ Ověření, že vše funguje

### Test 1: Databáze

V Supabase SQL Editor:

```sql
-- Zkontrolujte nové sloupce
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'paro_records' 
  AND column_name IN ('llm_original', 'quality_rating', 'hygienist_feedback');
```

Měli byste vidět 3 řádky.

### Test 2: UI

1. Spusťte aplikaci: `npm run dev`
2. Přihlaste se
3. Jděte na: `/dashboard/records`
4. Otevřete detail záznamu
5. Pokud má záznam `llm_original`, uvidíte **modrý box** s hodnocením

### Test 3: API

```bash
# Test PATCH endpoint
curl -X PATCH http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -d '{
    "id": "your-record-id",
    "quality_rating": 4,
    "hygienist_feedback": "Test feedback"
  }'
```

---

## 📊 Monitorování

### Kolik hodnocení máme?

V Supabase SQL Editor:

```sql
SELECT 
  COUNT(*) as total_records,
  COUNT(llm_original) as with_ai_data,
  COUNT(quality_rating) as rated,
  ROUND(AVG(quality_rating), 2) as avg_rating
FROM paro_records;
```

### Dashboard (volitelné - můžete vytvořit později)

```typescript
// Jednoduchý stats component
async function FineTuningStats() {
  const stats = await supabase
    .from('paro_records')
    .select('quality_rating')
    .not('quality_rating', 'is', null);

  return (
    <div>
      <h2>Fine-Tuning Progress</h2>
      <p>Hodnoceno: {stats.data?.length || 0} / 200</p>
      <p>Progress: {Math.round((stats.data?.length || 0) / 200 * 100)}%</p>
    </div>
  );
}
```

---

## 🎓 Školení hygienistek

**Sdílejte s týmem:** `FINE_TUNING_CZ.md`

Tento soubor obsahuje:
- ✅ Proč hodnotíme AI
- ✅ Jak hodnotit (krok za krokem)
- ✅ Příklady dobrých hodnocení
- ✅ Tipy a triky
- ✅ Časté otázky

**Krátké školení (15 minut):**

1. **Ukažte modrý box** v detail záznamu
2. **Vysvětlete hodnocení:**
   - 5⭐ = Perfektní, žádné úpravy
   - 1⭐ = Katastrofa, vše přepsáno
3. **Zdůrazněte zpětnou vazbu:**
   - "Co bylo špatně?"
   - "Co chybělo?"
4. **Motivujte:**
   - "Pomáháte AI se zlepšit"
   - "Budete mít v budoucnu méně práce"

---

## 📈 Plán sběru dat

### Fáze 1: Intenzivní sběr (2-4 týdny)

- **Cíl:** 200 hodnocení
- **Strategie:** Hodnotit všechny nebo většinu záznamů
- **Frekvence:** Denně

### Fáze 2: Průběžný sběr

- **Cíl:** Další hodnocení průběžně
- **Strategie:** 20-30% náhodných záznamů
- **Frekvence:** Průběžně při běžné práci

### Fáze 3: Fine-tuning

- **Kdy:** Po dosažení 200+ hodnocení
- **Kdo:** IT tým
- **Jak:** Spustit `scripts/export-fine-tuning-data.ts`

---

## 🚀 Export a Fine-tuning (až budete mít data)

Až budete mít **200+ hodnocení:**

```bash
# 1. Export dat
npx tsx scripts/export-fine-tuning-data.ts

# Výstup:
# ✅ Export dokončen!
# 📁 Fine-tuning data: exports/fine-tuning-data-[timestamp].jsonl

# 2. Upload na OpenAI
openai api files.create \
  -f exports/fine-tuning-data-*.jsonl \
  -p fine-tune

# 3. Spustit fine-tuning
openai api fine_tuning.jobs.create \
  -t <FILE_ID> \
  -m gpt-4o-mini-2024-07-18

# 4. Sledovat progress
openai api fine_tuning.jobs.follow -i <JOB_ID>
```

Detaily: `FINE_TUNING_QUICKSTART.md`

---

## 🛠️ Troubleshooting

### ❌ SQL migrace selhala

**Chyba:** `column "llm_original" already exists`

**Řešení:** OK! Sloupec už existuje, pokračujte dál.

---

### ❌ Nevidím modrý box s hodnocením

**Důvody:**
1. Záznam nemá `llm_original` data
2. Ještě jste neintegrovali ukládání (Krok 2)

**Ověření:**
```sql
SELECT id, llm_original FROM paro_records LIMIT 1;
```

---

### ❌ API endpoint vrací 404

**Řešení:**
1. Zkontrolujte: `app/api/records/route.ts` obsahuje PATCH method
2. Restartujte dev server: `npm run dev`

---

## 📞 Podpora

Máte problém? Projděte:

1. 📖 `FINE_TUNING_QUICKSTART.md` - Rychlý start
2. 📖 `INTEGRATION_EXAMPLE.md` - Příklady kódu
3. 📖 `SQL_QUERIES.md` - SQL dotazy pro debugging

---

## ✅ Checklist

- [ ] ✅ SQL migrace spuštěna v Supabase
- [ ] ✅ Ověřeno, že nové sloupce existují
- [ ] 💻 Integrováno ukládání `llm_original` do kódu
- [ ] 🧪 Testován celý flow (vytvoření → hodnocení)
- [ ] 👥 Hygienistky proškoleny (`FINE_TUNING_CZ.md`)
- [ ] 📊 Monitorování nastaveno (SQL queries)
- [ ] 🚀 Deploy do produkce
- [ ] 📈 Sledování pokroku (cíl: 200+ hodnocení)

---

## 🎉 Gratulujeme!

Systém je připraven. Teď stačí:

1. ✅ Dokončit kroky výše
2. 📊 Sbírat hodnocení
3. 🚀 Spustit fine-tuning
4. 📈 Těšit se na lepší AI!

---

**Potřebujete pomoc?** Kontaktujte IT tým nebo se podívejte do dokumentace výše. 💬

**Hodně štěstí! 🦷✨**

