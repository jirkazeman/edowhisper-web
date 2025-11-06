# 🚀 Fine-Tuning Quick Start

Rychlý průvodce pro spuštění systému hodnocení AI výstupů.

## ⚡ Rychlý start (5 kroků)

### 1️⃣ Spusťte SQL migraci

V Supabase Dashboard → SQL Editor vložte a spusťte:

```sql
-- Přidání sloupců pro fine-tuning
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS llm_original JSONB,
ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS hygienist_feedback TEXT,
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rated_by UUID REFERENCES auth.users(id);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_paro_records_llm_original 
ON paro_records(llm_original) WHERE llm_original IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_paro_records_quality_rating 
ON paro_records(quality_rating) WHERE quality_rating IS NOT NULL;
```

✅ **Hotovo!** Databáze je připravena.

---

### 2️⃣ Ukládejte původní AI výstup

Když vytváříte nový záznam z AI, uložte původní výstup:

```typescript
import { recordsAPI } from "@/lib/api";

// Příklad: Zpracování AI výstupu
const aiResponse = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "Vyplň parodontální záznam..." },
    { role: "user", content: transcript }
  ]
});

const aiOutput = aiResponse.choices[0].message.content;
const formData = JSON.parse(aiOutput);

// ⚡ Uložte záznam + původní AI výstup
await recordsAPI.create(
  formData,  // Parsovaná data
  userId,
  {
    // 🔥 Původní AI výstup
    raw_response: aiOutput,
    model: aiResponse.model,
    timestamp: new Date().toISOString()
  }
);
```

✅ **Hotovo!** Záznamy se ukládají s AI výstupem.

---

### 3️⃣ Hygienistky hodnotí záznamy

1. Otevřete detail záznamu: `/dashboard/records/[id]`
2. Najděte modrý box **"Hodnocení AI výstupu"**
3. Vyberte hodnocení (1-5 hvězdiček)
4. Přidejte zpětnou vazbu (volitelné)
5. Klikněte **"Uložit hodnocení"**

**UI je již hotové!** ✨

---

### 4️⃣ Sbírejte data (200+ hodnocení)

Doporučené minimum:
- ✅ **200+ ohodnocených záznamů**
- ✅ **Rozmanitá data** (různé typy pacientů)
- ✅ **Kvalitní zpětná vazba** u alespoň 50%

Sledujte progress:

```sql
-- Statistiky v Supabase
SELECT 
  COUNT(*) as total,
  COUNT(quality_rating) as rated,
  ROUND(AVG(quality_rating), 2) as avg_rating
FROM paro_records;
```

---

### 5️⃣ Exportujte data pro OpenAI

Když máte dostatek dat:

```bash
# Export do JSONL formátu
npx tsx scripts/export-fine-tuning-data.ts
```

Výstup:
```
📊 Nalezeno 250 ohodnocených záznamů
✅ Pro fine-tuning použijeme 180 kvalitních záznamů (rating >= 4)
📁 Fine-tuning data: exports/fine-tuning-data-2024-10-30.jsonl
```

---

## 🎯 Spuštění Fine-tuningu na OpenAI

### Krok 1: Nahrajte data

```bash
openai api files.create \
  -f exports/fine-tuning-data-2024-10-30.jsonl \
  -p fine-tune
```

Výstup:
```
{
  "id": "file-abc123",
  "object": "file",
  "purpose": "fine-tune"
}
```

### Krok 2: Vytvořte fine-tuning job

```bash
openai api fine_tuning.jobs.create \
  -t file-abc123 \
  -m gpt-4o-mini-2024-07-18
```

### Krok 3: Sledujte progress

```bash
openai api fine_tuning.jobs.follow -i ftjob-abc123
```

### Krok 4: Použijte model

Když je hotovo:

```typescript
const completion = await openai.chat.completions.create({
  model: "ft:gpt-4o-mini-2024-07-18:your-org:custom-model-name",
  messages: [...]
});
```

---

## 📊 Co dělat s výsledky

### Porovnejte kvalitu:

1. **Před fine-tuningem**: Průměrné hodnocení 3.2/5
2. **Po fine-tuningu**: Očekáváme 4.2+/5

### A/B Testing:

```typescript
// 50% požadavků na starý model, 50% na nový
const useFineTunedModel = Math.random() < 0.5;
const model = useFineTunedModel 
  ? "ft:gpt-4o-mini:custom" 
  : "gpt-4o-mini";
```

### Měřte zlepšení:

```sql
-- Porovnání kvality před/po fine-tuningu
SELECT 
  CASE 
    WHEN created_at < '2024-11-01' THEN 'Před fine-tuning'
    ELSE 'Po fine-tuning'
  END as period,
  COUNT(*) as total,
  ROUND(AVG(quality_rating), 2) as avg_rating
FROM paro_records
WHERE quality_rating IS NOT NULL
GROUP BY period;
```

---

## 🆘 Troubleshooting

### Problém: Žádná data k exportu

```
⚠️  Žádné ohodnocené záznamy nenalezeny.
```

**Řešení:**
1. Zkontrolujte, že hygienistky hodnotí záznamy
2. Ověřte SQL migraci: `SELECT * FROM paro_records WHERE quality_rating IS NOT NULL;`

---

### Problém: Málo dat

```
⚠️  Málo dat pro fine-tuning! (pouze 15 záznamů)
```

**Řešení:**
- Pokračujte ve sběru hodnocení
- Minimum: 100-200 kvalitních záznamů
- Ideálně: 500+ pro nejlepší výsledky

---

### Problém: Nízké hodnocení

```
📊 Průměrné hodnocení: 2.1/5
```

**Analýza:**
1. Prohlédněte si zpětnou vazbu: Co je špatně?
2. Možná potřebujete lepší system prompt
3. Nebo lepší preprocessing transkriptu

---

## 📚 Další dokumentace

- 📖 [Kompletní průvodce](./FINE_TUNING_GUIDE.md)
- 🔧 [SQL migrace](./migrations/add_llm_rating.sql)
- 💻 [Export script](./scripts/export-fine-tuning-data.ts)
- 🌐 [OpenAI Docs](https://platform.openai.com/docs/guides/fine-tuning)

---

## ✅ Checklist

- [ ] SQL migrace spuštěna
- [ ] Ukládáte `llm_original` při vytváření záznamů
- [ ] Hygienistky školeny k hodnocení
- [ ] Sbíráte hodnocení (cíl: 200+)
- [ ] Export dat funguje
- [ ] Fine-tuning job vytvořen na OpenAI
- [ ] Nový model testován
- [ ] Měříte zlepšení

---

**Hodně štěstí s fine-tuningem! 🚀✨**

