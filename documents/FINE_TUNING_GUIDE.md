# 🎯 Fine-Tuning Guide - Průvodce hodnocením AI výstupů

Tento dokument vysvětluje, jak funguje systém hodnocení AI výstupů pro fine-tuning OpenAI modelu.

## 📋 Obsah

1. [Přehled systému](#přehled-systému)
2. [Databázová struktura](#databázová-struktura)
3. [Jak používat hodnocení](#jak-používat-hodnocení)
4. [Integrace s vaší aplikací](#integrace-s-vaší-aplikací)
5. [Export dat pro fine-tuning](#export-dat-pro-fine-tuning)

---

## 🔍 Přehled systému

Systém umožňuje hygienistkám hodnotit kvalitu AI výstupů pomocí:
- **Hvězdičkového hodnocení** (1-5 hvězdiček)
- **Textové zpětné vazby** (volitelné)
- **Uložení původního AI výstupu** před úpravami

### Jak to funguje:

```
1. AI zpracuje audio transkript
   ↓
2. Vytvoří se záznam s llm_original (původní AI výstup)
   ↓
3. Hygienistka upraví/opraví záznam
   ↓
4. Hygienistka ohodnotí kvalitu AI výstupu
   ↓
5. Systém uloží: původní AI → úpravy hygienistky → hodnocení
   ↓
6. Data se použijí pro fine-tuning OpenAI modelu
```

---

## 🗄️ Databázová struktura

### Nové sloupce v `paro_records`:

```sql
-- Původní AI výstup (před úpravami)
llm_original JSONB

-- Hodnocení kvality (1-5)
quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5)

-- Textová zpětná vazba
hygienist_feedback TEXT

-- Datum a čas hodnocení
rated_at TIMESTAMP WITH TIME ZONE

-- ID hygienistky, která ohodnotila
rated_by UUID REFERENCES auth.users(id)
```

### Migrace databáze:

Spusťte SQL v Supabase SQL Editor:

```sql
-- Spustit soubor: migrations/add_llm_rating.sql
```

Nebo ručně v Supabase Dashboard → SQL Editor:

```sql
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS llm_original JSONB,
ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS hygienist_feedback TEXT,
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rated_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_paro_records_llm_original 
ON paro_records(llm_original) 
WHERE llm_original IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_paro_records_quality_rating 
ON paro_records(quality_rating) 
WHERE quality_rating IS NOT NULL;
```

---

## 👩‍⚕️ Jak používat hodnocení

### Pro hygienistky:

1. **Otevřete detail záznamu** (`/dashboard/records/[id]`)

2. **Najděte sekci "Hodnocení AI výstupu"** (modrý box)

3. **Ohodnoťte kvalitu AI:**
   - ⭐ 1 hvězdička = Velmi špatné (nutné kompletní přepsání)
   - ⭐⭐ 2 hvězdičky = Špatné (mnoho chyb)
   - ⭐⭐⭐ 3 hvězdičky = Průměrné (některé chyby)
   - ⭐⭐⭐⭐ 4 hvězdičky = Dobré (jen malé úpravy)
   - ⭐⭐⭐⭐⭐ 5 hvězdiček = Vynikající (téměř bez úprav)

4. **Přidejte zpětnou vazbu** (volitelné):
   ```
   Příklad:
   "AI správně identifikovala hlavní nálezy, ale chyběly konkrétní 
   hodnoty PBI. Doporučení byla příliš obecná. Správně by měla uvést 
   konkrétní číselné hodnoty."
   ```

5. **Klikněte na "Uložit hodnocení"**

---

## 💻 Integrace s vaší aplikací

### Krok 1: Při vytváření záznamu z AI výstupu

```typescript
import { recordsAPI } from "@/lib/api";

// Když AI zpracuje transkript:
const aiResponse = await callOpenAI(transcript); // Váš OpenAI call

// Parsujte AI odpověď do form_data
const formData = parseAIResponse(aiResponse);

// Vytvořte záznam a uložte PŮVODNÍ AI výstup
const record = await recordsAPI.create(
  formData,           // Parsovaná data do formuláře
  userId,             // ID hygienistky
  aiResponse          // 🔥 DŮLEŽITÉ: Původní AI odpověď pro fine-tuning
);
```

### Příklad s OpenAI API:

```typescript
async function processTranscript(transcript: string, userId: string) {
  // 1. Zavolejte OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Jsi parodontální asistentka. Vyplň záznam z transkriptu..."
      },
      {
        role: "user",
        content: transcript
      }
    ],
    response_format: { type: "json_object" }
  });

  const aiOutput = completion.choices[0].message.content;
  const parsedData = JSON.parse(aiOutput);

  // 2. Uložte záznam S původním AI výstupem
  const record = await recordsAPI.create(
    parsedData,        // RecordFormData
    userId,
    {
      // Uložte CELÝ AI výstup pro fine-tuning
      raw_response: aiOutput,
      model: completion.model,
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
      timestamp: new Date().toISOString()
    }
  );

  return record;
}
```

### Krok 2: API endpoint pro hodnocení (již hotový)

```typescript
// API: /api/records [PATCH]
const response = await fetch("/api/records", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: recordId,
    quality_rating: 4,
    hygienist_feedback: "Dobrý výstup, jen drobné úpravy",
    rated_by: userId
  })
});
```

---

## 📊 Export dat pro fine-tuning

### SQL dotaz pro export tréninkových dat:

```sql
-- Export všech ohodnocených záznamů pro fine-tuning
SELECT 
  id,
  llm_original,              -- Původní AI výstup
  form_data,                 -- Upravená verze hygienistkou
  quality_rating,            -- Hodnocení 1-5
  hygienist_feedback,        -- Textová zpětná vazba
  rated_at,
  rated_by
FROM paro_records
WHERE quality_rating IS NOT NULL
  AND llm_original IS NOT NULL
ORDER BY rated_at DESC;
```

### Statistiky hodnocení:

```sql
-- Celkové statistiky
SELECT 
  COUNT(*) as total_records,
  COUNT(llm_original) as records_with_ai,
  COUNT(quality_rating) as rated_records,
  ROUND(AVG(quality_rating), 2) as avg_rating,
  
  -- Počet podle hodnocení
  COUNT(*) FILTER (WHERE quality_rating = 5) as excellent,
  COUNT(*) FILTER (WHERE quality_rating = 4) as good,
  COUNT(*) FILTER (WHERE quality_rating = 3) as average,
  COUNT(*) FILTER (WHERE quality_rating = 2) as poor,
  COUNT(*) FILTER (WHERE quality_rating = 1) as very_poor,
  
  -- Procentuální pokrytí
  ROUND(100.0 * COUNT(quality_rating) / NULLIF(COUNT(*), 0), 1) as rated_percentage
FROM paro_records;
```

### Export do OpenAI fine-tuning formátu (JSONL):

```typescript
// Script pro export dat
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";

async function exportForFineTuning() {
  const { data } = await supabaseAdmin
    .from("paro_records")
    .select("*")
    .not("llm_original", "is", null)
    .not("quality_rating", "is", null)
    .gte("quality_rating", 4); // Jen dobré výsledky (4-5)

  // OpenAI fine-tuning formát
  const training_data = data.map(record => ({
    messages: [
      {
        role: "system",
        content: "Jsi parodontální asistentka..."
      },
      {
        role: "user",
        content: record.llm_original.transcript || "..."
      },
      {
        role: "assistant",
        content: JSON.stringify(record.form_data)
      }
    ]
  }));

  // Uložit jako JSONL
  const jsonl = training_data
    .map(item => JSON.stringify(item))
    .join("\n");

  fs.writeFileSync("fine-tuning-data.jsonl", jsonl);
  
  console.log(`Exported ${training_data.length} training examples`);
}
```

---

## 🎓 Doporučení pro hygienistky

### Co hodnotit:

✅ **Přesnost údajů** - Správné hodnoty, čísla, nálezy
✅ **Úplnost** - Nezapomněla AI něco důležitého?
✅ **Odbornost** - Používá správnou terminologii?
✅ **Logika** - Dávají doporučení smysl vzhledem k nálezům?

### Tipy pro zpětnou vazbu:

```
✅ DOBŘE:
"AI správně identifikovala gingivitidu, ale nezmínila 
konkrétní PBI index 65%. Doporučení hygieny byla obecná, 
měla by specifikovat techniku Bass."

❌ ŠPATNĚ:
"Špatné"
```

---

## 🔧 Technické poznámky

### Co ukládat do `llm_original`:

```typescript
{
  // Původní odpověď od AI
  raw_response: string,
  
  // Metadata
  model: "gpt-4-turbo-preview",
  timestamp: "2024-01-15T10:30:00Z",
  
  // Token usage (pro monitorování nákladů)
  prompt_tokens: 1500,
  completion_tokens: 800,
  
  // Původní prompt (volitelné)
  system_prompt?: string,
  user_prompt?: string,
  
  // AI confidence (pokud dostupné)
  confidence?: number
}
```

### Jak často sbírat hodnocení:

- **Ideálně**: První 2 týdny - ohodnotit každý záznam
- **Průběžně**: Pak náhodně 20-30% záznamů
- **Minimum**: Alespoň 100-200 ohodnocených záznamů před fine-tuningem

### Kdy spustit fine-tuning:

```
📊 Doporučená kritéria:
- ✅ Minimálně 200 ohodnocených záznamů
- ✅ Průměrné hodnocení < 4 (je co zlepšovat)
- ✅ Rozmanitá data (různé typy pacientů/nálezů)
- ✅ Kvalitní zpětná vazba u alespoň 50% záznamů
```

---

## 🚀 Další kroky

1. ✅ Spusťte SQL migraci
2. ✅ Integrujte ukládání `llm_original` při vytváření záznamů
3. ✅ Školte hygienistky, jak hodnotit
4. 📊 Sbírejte data (200+ hodnocení)
5. 🤖 Spusťte fine-tuning OpenAI modelu
6. 🎯 Vyhodnoťte zlepšení

---

## 📞 Podpora

Pokud máte otázky:
- 📧 Kontaktujte vývojářský tým
- 📚 Dokumentace OpenAI: https://platform.openai.com/docs/guides/fine-tuning
- 🐛 Nahlaste chybu v Issues

---

**Vytvořeno pro EDO Whisper** 🦷✨

