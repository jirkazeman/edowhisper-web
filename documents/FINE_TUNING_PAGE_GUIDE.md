# 📖 Průvodce Fine-Tuning stránkou

Kompletní návod k používání nové Fine-Tuning Management stránky v EDO Whisper Web.

---

## 🎯 Co je Fine-Tuning stránka?

Dedikovaná stránka pro správu a sledování hodnocení AI výstupů, která umožňuje:

- 📊 **Statistiky** - Přehled ohodnocených záznamů a kvality AI
- 🔍 **Filtrování** - Vyhledávání záznamů podle ratingu a feedbacku
- 📥 **Export** - Stažení dat pro OpenAI fine-tuning
- 📈 **Doporučení** - Automatické tipy, kdy spustit fine-tuning

---

## 🚀 Jak na to

### 1. Přístup ke stránce

```
Dashboard → Fine-Tuning (v levém menu)
nebo
https://your-app.com/dashboard/fine-tuning
```

---

## 📊 Přehled stránky

### Horní sekce - Statistické karty

Čtyři hlavní metriky:

#### 1️⃣ Záznamy s AI výstupem
- Celkový počet záznamů, které lze ohodnotit
- Záznamy musí mít uložené `llm_original`

#### 2️⃣ Ohodnoceno
- Počet již ohodnocených záznamů
- Progress bar: kolik % je hotovo
- Zbývající neohodnocené záznamy

#### 3️⃣ Průměrné hodnocení
- Průměr všech hodnocení (1-5)
- Ukazuje celkovou kvalitu AI

#### 4️⃣ Připraveno k exportu
- Počet kvalitních záznamů (rating ≥ 4)
- Tyto záznamy budou exportovány pro fine-tuning

---

### Střední sekce - Doporučení

**Barevné bannery podle stavu:**

| Počet kvalitních | Barva | Zpráva |
|------------------|-------|--------|
| 200+ | 🟢 Zelená | Můžete spustit fine-tuning! |
| 100-199 | 🔵 Modrá | Dobře na cestě, pokračujte |
| 50-99 | 🟡 Žlutá | Potřebujete více hodnocení |
| 0-49 | 🔴 Červená | Začněte hodnotit záznamy |

**Tlačítko Export:**
- Zobrazí se od 50+ kvalitních záznamů
- Stáhne JSONL soubor pro OpenAI

---

### Distribuce hodnocení

Graf ukazující:
- Kolik záznamů má každé hodnocení (1-5 ⭐)
- Procentuální rozložení
- Barvy:
  - 🟢 Zelená (4-5⭐): Kvalitní pro fine-tuning
  - 🟡 Žlutá (3⭐): Průměrné
  - 🔴 Červená (1-2⭐): Špatné

**Statistika feedbacku:**
- Kolik záznamů má textovou zpětnou vazbu
- Důležité: feedback pomáhá pochopit, co AI dělá špatně

---

### Filtry

**Filtrovat podle hodnocení:**
- Vše
- Neohodnoceno
- ⭐⭐⭐⭐⭐ (5)
- ⭐⭐⭐⭐ (4)
- ⭐⭐⭐ (3)
- ⭐⭐ (2)
- ⭐ (1)

**Filtrovat podle zpětné vazby:**
- Vše
- S feedbackem
- Bez feedbacku

---

### Tabulka záznamů

Zobrazuje:
- **Pacient** - Jméno a rodné číslo
- **Vytvořeno** - Datum vytvoření záznamu
- **Hodnocení** - Hvězdičky nebo "Neohodnoceno"
- **Zpětná vazba** - ✅ Ano / — Ne
- **Akce** - Tlačítko "Zobrazit" nebo "Ohodnotit"

**Kliknutím na řádek** otevřete detail záznamu.

---

## 🎬 Pracovní workflow

### Pro hygienistky:

```
1. Otevřít Dashboard → Fine-Tuning
   ↓
2. Najít neohodnocené záznamy (filtr: "Neohodnoceno")
   ↓
3. Kliknout na záznam
   ↓
4. Prohlédnout AI výstup vs finální data
   ↓
5. Ohodnotit 1-5 hvězdiček
   ↓
6. Napsat zpětnou vazbu (co bylo špatně)
   ↓
7. Uložit hodnocení
   ↓
8. Zpět na Fine-Tuning stránku → další záznam
```

### Pro správce:

```
1. Sledovat statistiky na Fine-Tuning stránce
   ↓
2. Když máte 200+ kvalitních hodnocení:
   ↓
3. Kliknout "Exportovat data"
   ↓
4. Stáhnout JSONL soubor
   ↓
5. Nahrát na OpenAI:
   openai api files.create -f fine-tuning-data.jsonl -p fine-tune
   ↓
6. Spustit fine-tuning:
   openai api fine_tuning.jobs.create -t <FILE_ID> -m gpt-4o-mini-2024-07-18
   ↓
7. Sledovat progress:
   openai api fine_tuning.jobs.follow -i <JOB_ID>
   ↓
8. Po dokončení: Aktualizovat model v mobilní aplikaci
```

---

## 📥 Export dat

### Co se exportuje?

- **Pouze kvalitní záznamy**: Rating ≥ 4 (⭐⭐⭐⭐ a ⭐⭐⭐⭐⭐)
- **Formát**: JSONL (JSON Lines)
- **Struktura**:
  ```json
  {
    "messages": [
      {
        "role": "system",
        "content": "Váš system prompt..."
      },
      {
        "role": "user",
        "content": "Transkript audio nahrávky..."
      },
      {
        "role": "assistant",
        "content": "{finální form_data jako JSON}"
      }
    ]
  }
  ```

### Jak používat exportovaná data?

1. **Stáhnout** soubor z Fine-Tuning stránky
2. **Nahrát na OpenAI**:
   ```bash
   openai api files.create \
     -f fine-tuning-data-2024-10-30.jsonl \
     -p fine-tune
   ```
3. **Spustit fine-tuning job**:
   ```bash
   openai api fine_tuning.jobs.create \
     -t file-abc123 \
     -m gpt-4o-mini-2024-07-18 \
     --suffix "dental-v1"
   ```
4. **Sledovat progress**:
   ```bash
   openai api fine_tuning.jobs.follow -i ftjob-xyz789
   ```

Po dokončení dostanete model ID: `ft:gpt-4o-mini:your-org:dental-v1:abc123`

---

## 💡 Doporučení pro hodnocení

### Kdy dát 5 hvězdiček ⭐⭐⭐⭐⭐

- AI výstup je téměř perfektní
- Jen minimální kosmetické úpravy
- Správná terminologie
- Kompletní data

### Kdy dát 4 hvězdičky ⭐⭐⭐⭐

- AI výstup je dobrý
- Několik drobných chyb
- Chybělo pár detailů
- Většina informací správně

### Kdy dát 3 hvězdičky ⭐⭐⭐

- AI výstup je průměrný
- Několik významných chyb
- Chybí důležité informace
- Vyžaduje větší úpravy

### Kdy dát 2 hvězdičky ⭐⭐

- AI výstup je špatný
- Mnoho chyb a nepřesností
- Chybí většina detailů
- Vyžaduje rozsáhlé přepsání

### Kdy dát 1 hvězdičku ⭐

- AI výstup je velmi špatný
- Téměř vše je špatně
- Nutné kompletní přepsání
- AI nepochopila kontext

---

## 📝 Zpětná vazba - Best Practices

### ✅ Dobrá zpětná vazba:

```
AI správně identifikovala gingivitidu a uvedla PBI 65%. 
Chybělo však doporučení konkrétní techniky čištění. 
Správně by měla zmínit techniku Bass pro tento typ problému.
```

### ❌ Špatná zpětná vazba:

```
Špatně
```

### Proč je to důležité?

- Pomáhá pochopit, **co** AI dělá špatně
- Umožňuje zlepšit **system prompt**
- Vytváří **dokumentaci** pro budoucí reference

---

## 🎯 Milníky fine-tuningu

| Ohodnoceno | Status | Doporučení |
|------------|--------|------------|
| 0-49 | 🔴 | Začněte hodnotit |
| 50-99 | 🟡 | Pokračujte, ještě není dost dat |
| 100-199 | 🟠 | Můžete zkusit první iteraci |
| 200-499 | 🔵 | Dobrý počet pro fine-tuning |
| 500+ | 🟢 | Vynikající! Spusťte další iteraci |

---

## 🔄 Iterativní zlepšování

### Cyklus 1 (měsíc 1):
- 50-100 hodnocení
- Export → Fine-tuning V1
- Přesnost: 70% → 85%

### Cyklus 2 (měsíc 2):
- Dalších 100+ hodnocení
- Export → Fine-tuning V2
- Přesnost: 85% → 93%

### Cyklus 3 (měsíc 3):
- Dalších 200+ hodnocení
- Export → Fine-tuning V3
- Přesnost: 93% → 97%

**Výsledek:** Čím déle používáte, tím lepší AI!

---

## ⚠️ Časté problémy

### Problém: "Žádné záznamy k exportu"

**Řešení:**
- Ujistěte se, že máte ohodnocené záznamy s rating ≥ 4
- Zkontrolujte filtry (možná jsou příliš restriktivní)

### Problém: Export je prázdný

**Řešení:**
- Záznamy musí mít uložené `llm_original`
- Zkontrolujte, že mobilní app ukládá původní AI výstup

### Problém: Průměrné hodnocení je nízké (<3.0)

**Řešení:**
- AI model potřebuje zlepšení
- Zkontrolujte system prompt
- Možná je čas na první fine-tuning iteraci

---

## 🔐 Bezpečnost

- ✅ Stránka je chráněná autentizací
- ✅ Export používá server-side API (Supabase admin)
- ✅ RLS (Row Level Security) zajišťuje přístup jen k vlastním datům
- ✅ Exportovaná data neobsahují žádné metadata (jen training data)

---

## 📞 Podpora

**Máte dotazy?**
- 📖 Dokumentace: `documents/README_FINE_TUNING.md`
- 🚀 Quick Start: `documents/FINE_TUNING_QUICKSTART.md`
- 💻 Integrace: `documents/INTEGRATION_EXAMPLE.md`

---

## ✨ Tip na závěr

**Pro nejlepší výsledky:**
1. Hodnoťte záznamy průběžně, ne všechny najednou
2. Pište konkrétní zpětnou vazbu
3. Exportujte data pravidelně (každých 100-200 hodnocení)
4. Sledujte, jak se průměrné hodnocení zlepšuje po každé iteraci

**Vaše hodnocení = Lepší AI = Méně práce v budoucnu! 🎉**

---

*Poslední aktualizace: 30. října 2024*





