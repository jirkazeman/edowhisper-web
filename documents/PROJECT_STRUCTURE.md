# 📁 Struktura projektu - Fine-Tuning systém

Přehled všech souborů souvisejících s fine-tuning systémem.

---

## 🗂️ Přehled změn

```
edowhisper-web/
│
├── 📊 DATABÁZE
│   └── migrations/
│       └── add_llm_rating.sql           ✨ SQL migrace (SPUSTIT V SUPABASE!)
│
├── 💻 BACKEND
│   ├── lib/
│   │   ├── types.ts                     ✅ Aktualizováno (ParoRecord + rating fields)
│   │   └── api.ts                       ✅ Aktualizováno (create() + llmOriginal param)
│   └── app/api/records/
│       └── route.ts                     ✅ Aktualizováno (+ PATCH method pro rating)
│
├── 🎨 FRONTEND
│   └── app/dashboard/records/[id]/
│       └── page.tsx                     ✅ Aktualizováno (+ UI pro hodnocení)
│
├── 🔧 SKRIPTY
│   └── scripts/
│       └── export-fine-tuning-data.ts   ✨ Nový (export do OpenAI JSONL)
│
└── 📖 DOKUMENTACE
    ├── INSTALACE_FINE_TUNING.md         ✨ START ZDE! (hlavní instalační návod)
    ├── FINE_TUNING_QUICKSTART.md        ✨ Rychlý start (5 kroků)
    ├── FINE_TUNING_GUIDE.md             ✨ Kompletní technická dokumentace
    ├── FINE_TUNING_CZ.md                ✨ Návod pro hygienistky (česky)
    ├── INTEGRATION_EXAMPLE.md           ✨ Příklady integrace do kódu
    ├── SQL_QUERIES.md                   ✨ Užitečné SQL dotazy
    ├── README_FINE_TUNING.md            ✨ Hlavní přehled systému
    └── PROJECT_STRUCTURE.md             ✨ Tento soubor
```

**Legenda:**
- ✨ = Nový soubor
- ✅ = Aktualizovaný existující soubor

---

## 📂 Detailní popis souborů

### 1️⃣ Databáze

#### `migrations/add_llm_rating.sql`
**Typ:** SQL migrace  
**Účel:** Přidá nové sloupce do `paro_records` tabulky  
**Kdy spustit:** HNED (Krok 1 instalace)  
**Kde spustit:** Supabase SQL Editor  

**Přidává:**
- `llm_original` - JSONB - Původní AI výstup
- `quality_rating` - INTEGER - Hodnocení 1-5
- `hygienist_feedback` - TEXT - Zpětná vazba
- `rated_at` - TIMESTAMP - Datum hodnocení
- `rated_by` - UUID - ID hodnotitele

---

### 2️⃣ Backend

#### `lib/types.ts`
**Změny:** Aktualizován interface `ParoRecord`

```typescript
export interface ParoRecord {
  // ... existující fieldy ...
  llm_original?: any;           // NOVÉ
  quality_rating?: number;      // NOVÉ
  hygienist_feedback?: string;  // NOVÉ
  rated_at?: string;            // NOVÉ
  rated_by?: string;            // NOVÉ
}
```

---

#### `lib/api.ts`
**Změny:** Funkce `recordsAPI.create()` má nový parametr

**Před:**
```typescript
create: async (formData, userId) => { ... }
```

**Po:**
```typescript
create: async (formData, userId, llmOriginal?) => {
  // ... ukládá llm_original do databáze
}
```

---

#### `app/api/records/route.ts`
**Změny:** Přidán PATCH method pro ukládání hodnocení

**Nový endpoint:**
```
PATCH /api/records
Body: {
  id: string,
  quality_rating: number,
  hygienist_feedback?: string,
  rated_by?: string
}
```

---

### 3️⃣ Frontend

#### `app/dashboard/records/[id]/page.tsx`
**Změny:** Přidána sekce "Hodnocení AI výstupu"

**Nové funkce:**
- ⭐ Hvězdičkové hodnocení (1-5)
- 💬 Textové pole pro feedback
- 💾 Uložení hodnocení
- 📊 Zobrazení původního AI výstupu

**Umístění:** Pod existujícími sekcemi (Appointment, Examination Summary, etc.)

**Viditelnost:** Jen pokud `record.llm_original` existuje

---

### 4️⃣ Skripty

#### `scripts/export-fine-tuning-data.ts`
**Typ:** TypeScript skript  
**Účel:** Export ohodnocených záznamů do OpenAI JSONL formátu  
**Použití:** `npx tsx scripts/export-fine-tuning-data.ts`

**Výstup:**
- `exports/fine-tuning-data-[timestamp].jsonl` - Pro OpenAI upload
- `exports/fine-tuning-metadata-[timestamp].json` - Metadata pro referenci

**Funkce:**
- Načte všechny ohodnocené záznamy
- Vyfiltruje kvalitní (rating >= 4)
- Převede do OpenAI formátu
- Validuje data
- Zobrazí statistiky

---

### 5️⃣ Dokumentace

#### `INSTALACE_FINE_TUNING.md` ⭐ **START ZDE**
**Pro koho:** Vývojáři  
**Obsah:**
- ✅ Co bylo vytvořeno
- 🚀 3 kroky instalace
- ✅ Ověření funkčnosti
- 🛠️ Troubleshooting

**Použití:** První soubor, který si přečíst!

---

#### `FINE_TUNING_QUICKSTART.md`
**Pro koho:** Vývojáři (spěchající)  
**Obsah:**
- ⚡ 5 rychlých kroků
- 📊 Monitoring pokroku
- 🚀 Spuštění fine-tuningu

**Použití:** Když máte málo času

---

#### `FINE_TUNING_GUIDE.md`
**Pro koho:** Vývojáři (detailní)  
**Obsah:**
- 🔍 Kompletní popis systému
- 🗄️ Databázová struktura
- 💻 Integrace s kódem
- 📊 Export dat
- 🎓 Doporučení

**Použití:** Když potřebujete znát všechny detaily

---

#### `FINE_TUNING_CZ.md`
**Pro koho:** Hygienistky (uživatelé)  
**Obsah:**
- 🤔 Proč hodnotíme
- 📱 Jak hodnotit (krok za krokem)
- 💡 Tipy pro dobré hodnocení
- 📊 Příklady
- ❓ Časté otázky

**Použití:** Sdílet s týmem hygienistek

---

#### `INTEGRATION_EXAMPLE.md`
**Pro koho:** Vývojáři (praktický)  
**Obsah:**
- 🎯 6 praktických příkladů integrace
- 💻 Kompletní kód
- 🔍 Debugging tipy
- 🚨 Časté chyby

**Použití:** Když integrujete do svého kódu

---

#### `SQL_QUERIES.md`
**Pro koho:** Vývojáři, Admin  
**Obsah:**
- 📈 Statistiky
- 👥 Analýza podle hygienistek
- 🔍 Kvalita dat
- 💾 Export queries
- 🔧 Údržba

**Použití:** Pro monitoring a analýzu dat

---

#### `README_FINE_TUNING.md`
**Pro koho:** Všichni  
**Obsah:**
- 📚 Přehled celé dokumentace
- 🎯 Co bylo přidáno
- 🚀 Workflow
- 📦 Instalace
- 📊 Monitoring

**Použití:** Hlavní rozcestník pro celý systém

---

## 🔄 Workflow používání

### Pro vývojáře:

```
1. INSTALACE_FINE_TUNING.md
   ↓
2. Spustit SQL migraci
   ↓
3. INTEGRATION_EXAMPLE.md
   ↓
4. Integrovat do kódu
   ↓
5. Deploy & test
   ↓
6. SQL_QUERIES.md (monitoring)
```

### Pro hygienistky:

```
1. FINE_TUNING_CZ.md (přečíst)
   ↓
2. Otevřít záznam
   ↓
3. Hodnotit AI výstup
   ↓
4. Uložit
   ↓
5. Opakovat průběžně
```

### Pro fine-tuning:

```
1. Sbírat hodnocení (200+)
   ↓
2. npx tsx scripts/export-fine-tuning-data.ts
   ↓
3. FINE_TUNING_QUICKSTART.md (OpenAI steps)
   ↓
4. Upload na OpenAI
   ↓
5. Spustit fine-tuning job
   ↓
6. Měřit zlepšení
```

---

## 📊 Kam co patří

### Když potřebujete:

| Potřebuji... | Otevřete... |
|--------------|-------------|
| Rychle zprovoznit | `INSTALACE_FINE_TUNING.md` |
| Integrovat do kódu | `INTEGRATION_EXAMPLE.md` |
| Zjistit statistiky | `SQL_QUERIES.md` |
| Vyškolit hygienistky | `FINE_TUNING_CZ.md` |
| Spustit fine-tuning | `FINE_TUNING_QUICKSTART.md` |
| Pochopit celý systém | `README_FINE_TUNING.md` |
| Všechny detaily | `FINE_TUNING_GUIDE.md` |

---

## 🔧 Závislosti mezi soubory

```
Databáze
   ↓ (vyžaduje)
Backend (types, api)
   ↓ (používá)
Frontend (UI)
   ↓ (vytváří)
Data v DB
   ↓ (zpracovává)
Export script
   ↓ (generuje)
JSONL soubor
   ↓ (upload)
OpenAI Fine-tuning
```

---

## 🚀 Co dělat teď

1. ✅ Přečtěte si: `INSTALACE_FINE_TUNING.md`
2. ✅ Spusťte SQL migraci
3. ✅ Integrujte do kódu (viz `INTEGRATION_EXAMPLE.md`)
4. ✅ Deploy
5. ✅ Vyškolte hygienistky (`FINE_TUNING_CZ.md`)
6. 📊 Sledujte pokrok (`SQL_QUERIES.md`)

---

**Všechno připraveno! Teď už jen začít! 🚀**

