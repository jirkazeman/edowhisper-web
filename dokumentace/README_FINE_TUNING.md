# 🤖 Systém hodnocení AI pro Fine-Tuning

Kompletní dokumentace systému hodnocení AI výstupů pro fine-tuning OpenAI modelů.

---

## 📚 Dokumentace

| Soubor | Popis |
|--------|-------|
| **[FINE_TUNING_PAGE_GUIDE.md](./FINE_TUNING_PAGE_GUIDE.md)** | 🎯 **Průvodce Fine-Tuning stránkou** (START HERE!) |
| **[CHANGES_FINE_TUNING_PAGE.md](./CHANGES_FINE_TUNING_PAGE.md)** | 🆕 Co bylo přidáno (přehled změn) |
| **[FINE_TUNING_QUICKSTART.md](./FINE_TUNING_QUICKSTART.md)** | ⚡ Rychlý start (5 kroků) |
| **[FINE_TUNING_GUIDE.md](./FINE_TUNING_GUIDE.md)** | 📖 Kompletní průvodce |
| **[INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)** | 💻 Příklady integrace do kódu |
| **[SQL_QUERIES.md](./SQL_QUERIES.md)** | 📊 Užitečné SQL dotazy |

---

## 🎯 Co bylo přidáno

### 1. Databázová struktura

Nové sloupce v `paro_records`:

```sql
llm_original         JSONB                   -- Původní AI výstup
quality_rating       INTEGER (1-5)           -- Hodnocení kvality
hygienist_feedback   TEXT                    -- Zpětná vazba
rated_at             TIMESTAMP               -- Datum hodnocení
rated_by             UUID                    -- ID hodnotitele
```

📁 **Migrace:** `migrations/add_llm_rating.sql`

### 2. TypeScript typy

Aktualizované typy v `lib/types.ts`:

```typescript
export interface ParoRecord {
  // ... existující fieldy
  llm_original?: any;           // Původní LLM výstup
  quality_rating?: number;      // 1-5 hodnocení
  hygienist_feedback?: string;  // Textová zpětná vazba
  rated_at?: string;            // Datum hodnocení
  rated_by?: string;            // ID hygienistky
}
```

### 3. API Endpoints

**PATCH `/api/records`** - Uložení hodnocení

```typescript
PATCH /api/records
{
  "id": "record-uuid",
  "quality_rating": 4,
  "hygienist_feedback": "Dobré, jen malé úpravy",
  "rated_by": "user-uuid"
}
```

Implementováno v: `app/api/records/route.ts`

### 4. UI pro hodnocení

Nová sekce v detailu záznamu (`app/dashboard/records/[id]/page.tsx`):

- ⭐ Hvězdičkové hodnocení (1-5)
- 💬 Textové pole pro zpětnou vazbu
- 💾 Tlačítko "Uložit hodnocení"
- ℹ️ Informační box o účelu hodnocení
- 🔍 Zobrazení původního AI výstupu

### 5. Export script

**`scripts/export-fine-tuning-data.ts`** - Export dat do OpenAI formátu

```bash
npx tsx scripts/export-fine-tuning-data.ts
```

Vytvoří:
- `exports/fine-tuning-data-[timestamp].jsonl` - Pro OpenAI
- `exports/fine-tuning-metadata-[timestamp].json` - Metadata

---

## 🚀 Jak to funguje

### Workflow:

```
┌─────────────────┐
│  1. Audio Input │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Transcription│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. AI Processing│ ◄── Uložit llm_original
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Create Record│ ◄── S původním AI výstupem
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Hygienistka  │
│    upraví data  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Hygienistka  │ ◄── Rating + Feedback
│    ohodnotí     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. Export dat   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 8. Fine-tuning  │ ◄── OpenAI
└─────────────────┘
```

---

## 📦 Instalace

### Krok 1: SQL Migrace

V Supabase SQL Editor spusťte:

```sql
-- migrations/add_llm_rating.sql
ALTER TABLE paro_records 
ADD COLUMN IF NOT EXISTS llm_original JSONB,
ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS hygienist_feedback TEXT,
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rated_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_paro_records_llm_original 
ON paro_records(llm_original) WHERE llm_original IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_paro_records_quality_rating 
ON paro_records(quality_rating) WHERE quality_rating IS NOT NULL;
```

### Krok 2: Kód je hotový! ✅

Vše potřebné už je v projektu:
- ✅ TypeScript typy
- ✅ API endpoints
- ✅ UI komponenty
- ✅ Export script

### Krok 3: Integrace

Přidejte ukládání `llm_original` do vašeho kódu, kde vytváříte záznamy:

```typescript
// Příklad
const record = await recordsAPI.create(
  formData,
  userId,
  {
    raw_response: aiOutput,    // Původní AI výstup
    transcript: transcript,    // Původní vstup
    model: "gpt-4",           // Model použitý
    timestamp: new Date().toISOString()
  }
);
```

Detailní příklady: [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)

---

## 📊 Monitoring

### V aplikaci:

1. Otevřete detail záznamu: `/dashboard/records/[id]`
2. Pokud má záznam `llm_original`, uvidíte modrý box s hodnocením

### V Supabase:

```sql
-- Rychlý přehled
SELECT 
  COUNT(*) as total,
  COUNT(quality_rating) as rated,
  ROUND(AVG(quality_rating), 2) as avg_rating
FROM paro_records;
```

Více dotazů: [SQL_QUERIES.md](./SQL_QUERIES.md)

---

## 🎓 Pro hygienistky

### Jak hodnotit:

1. **Otevřete záznam** který chcete ohodnotit
2. **Najděte modrý box** "Hodnocení AI výstupu"
3. **Vyberte hodnocení:**
   - ⭐ 1 = Velmi špatné (nutné kompletní přepsání)
   - ⭐⭐ 2 = Špatné (mnoho chyb)
   - ⭐⭐⭐ 3 = Průměrné (některé chyby)
   - ⭐⭐⭐⭐ 4 = Dobré (jen malé úpravy)
   - ⭐⭐⭐⭐⭐ 5 = Vynikající (téměř bez úprav)

4. **Přidejte zpětnou vazbu** (důležité!):
   ```
   Příklad dobré zpětné vazby:
   "AI správně identifikovala gingivitidu a uvedla PBI 65%. 
   Chybělo však doporučení konkrétní techniky čištění. 
   Správně by měla zmínit techniku Bass."
   ```

5. **Uložte hodnocení**

### Proč to děláme?

- 🎯 Pomáháte AI se zlepšovat
- 📈 Budoucí záznamy budou kvalitnější
- ⏱️ Ušetříte čas při budoucích úpravách

---

## 📈 Požadavky pro fine-tuning

| Kritérium | Minimum | Doporučeno | Ideální |
|-----------|---------|------------|---------|
| Ohodnocené záznamy | 100 | 200-500 | 1000+ |
| Kvalitní záznamy (≥4⭐) | 50 | 150 | 500+ |
| Se zpětnou vazbou | 20% | 50% | 80% |
| Průměrné hodnocení | - | <4.0 | - |
| Rozmanitost dat | ✓ | ✓✓ | ✓✓✓ |

---

## 💰 Náklady

### Fine-tuning (OpenAI):

- **Training:** ~$8 / 1M tokens
- **Usage:** ~2-3x cena base modelu

### Příklad:
- 200 záznamů × 2000 tokenů = 400k tokens
- Training cost: ~$3.20
- Úspora času hygienistek: **neocenitelnáé** ⏱️

---

## 🔄 Aktualizace modelu

### Kdy spustit nový fine-tuning:

1. **Každých 100-200 nových hodnocení**
2. **Když průměrné hodnocení < 4.0**
3. **Když se změní požadavky na záznamy**
4. **Po velkých změnách v terminologii**

### Proces:

```bash
# 1. Export
npx tsx scripts/export-fine-tuning-data.ts

# 2. Upload na OpenAI
openai api files.create -f exports/fine-tuning-data-*.jsonl -p fine-tune

# 3. Spustit fine-tuning
openai api fine_tuning.jobs.create -t <FILE_ID> -m gpt-4o-mini-2024-07-18

# 4. Sledovat progress
openai api fine_tuning.jobs.follow -i <JOB_ID>

# 5. Aktualizovat model v kódu
# model: "ft:gpt-4o-mini:your-org:name:id"
```

---

## 🛠️ Troubleshooting

### Problém: Nevidím hodnocení box

**Řešení:**
- Zkontrolujte, že záznam má `llm_original` data
- Spusťte: `SELECT llm_original FROM paro_records WHERE id = 'your-id'`

### Problém: Nelze uložit hodnocení

**Řešení:**
- Zkontrolujte network tab v DevTools
- Ověřte API endpoint: `/api/records` [PATCH]
- Zkontrolujte RLS policies v Supabase

### Problém: Export script nevrací data

**Řešení:**
```sql
-- Zkontrolujte, kolik máte dat:
SELECT COUNT(*) 
FROM paro_records 
WHERE llm_original IS NOT NULL 
  AND quality_rating IS NOT NULL;
```

---

## 📞 Podpora

- 📖 **Dokumentace:** Viz soubory výše
- 🐛 **Bug report:** GitHub Issues
- 💡 **Feature request:** GitHub Discussions
- 📧 **Kontakt:** Váš development team

---

## 🎉 Co dál?

1. ✅ **Setup dokončen** - Spusťte SQL migraci
2. 📝 **Integrace** - Ukládejte `llm_original` při vytváření záznamů
3. 👥 **Školení** - Vyškolte hygienistky k hodnocení
4. 📊 **Sběr dat** - Cíl: 200+ hodnocení
5. 🚀 **Fine-tuning** - Export a trénování modelu
6. 📈 **Měření** - Vyhodnocení zlepšení
7. 🔄 **Iterace** - Opakujte proces

---

## 📝 Changelog

### v1.0 (2024-10-30)
- ✅ Databázová migrace
- ✅ TypeScript typy
- ✅ API endpoints
- ✅ UI pro hodnocení
- ✅ Export script
- ✅ Dokumentace

---

## 📄 License

Součást EDO Whisper projektu.

---

**🦷 Ať se daří s fine-tuningem!** ✨

Pro rychlý start: [FINE_TUNING_QUICKSTART.md](./FINE_TUNING_QUICKSTART.md)

