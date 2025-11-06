# ⚡ Quick Reference - Fine-Tuning Stránka

Rychlý přehled pro každodenní používání.

---

## 🎯 Přístup

```
Dashboard → Fine-Tuning
```

nebo

```
https://your-app.com/dashboard/fine-tuning
```

---

## 📊 Statistiky - Co znamenají

| Karta | Význam | Akce |
|-------|--------|------|
| **Záznamy s AI výstupem** | Kolik máte záznamů k hodnocení | - |
| **Ohodnoceno** | Kolik už je hotovo | Hodnoťte více! |
| **Průměrné hodnocení** | Jak dobrá je AI (1-5) | Sledujte trend |
| **Připraveno k exportu** | Kvalitní záznamy (≥4⭐) | Export od 100+ |

---

## 🎨 Barevné kódy doporučení

| Barva | Počet | Co dělat |
|-------|-------|----------|
| 🟢 **Zelená** | 200+ | ✅ Exportujte data! |
| 🔵 **Modrá** | 100-199 | 🔄 Pokračujte v hodnocení |
| 🟡 **Žlutá** | 50-99 | ⚠️ Potřebujete více dat |
| 🔴 **Červená** | 0-49 | 🚀 Začněte hodnotit! |

---

## 🔍 Filtry - Rychlé tipy

### Chci ohodnotit nové záznamy:
```
Hodnocení: [Neohodnoceno]
```

### Chci kontrolovat špičkové záznamy:
```
Hodnocení: [⭐⭐⭐⭐⭐ (5)]
```

### Chci záznamy bez feedbacku:
```
Zpětná vazba: [Bez feedbacku]
```

### Chci vidět všechny kvalitní záznamy:
```
Hodnocení: [⭐⭐⭐⭐ (4)] nebo [⭐⭐⭐⭐⭐ (5)]
```

---

## ⭐ Hodnocení - Rychlý průvodce

| Hvězdičky | Kdy použít | Příklad |
|-----------|------------|---------|
| ⭐⭐⭐⭐⭐ (5) | Téměř dokonalé | "Jen jsem opravila datum" |
| ⭐⭐⭐⭐ (4) | Dobré, pár chyb | "Chybělo PSČ a typ pojišťovny" |
| ⭐⭐⭐ (3) | Průměrné | "Chybí polovina údajů" |
| ⭐⭐ (2) | Špatné | "Většina je špatně" |
| ⭐ (1) | Velmi špatné | "Musela jsem přepsat vše" |

---

## 💬 Zpětná vazba - Příklady

### ✅ DOBŘE:
```
"AI správně identifikovala gingivitidu a PBI 65%. 
Chybělo doporučení techniky čištění. 
Pro tento typ problému správně technika Bass."
```

### ❌ ŠPATNĚ:
```
"Špatně"
```
```
"OK"
```

### 💡 Template:
```
AI správně: [co bylo dobře]
Chybělo: [co chybělo]
Mělo by být: [jak správně]
```

---

## 📥 Export - Kdy a jak

### Kdy exportovat?

| Milník | Doporučení |
|--------|------------|
| 50-99 | ⚠️ Ještě ne, málo dat |
| 100-199 | ✅ Můžete zkusit první iteraci |
| 200-499 | ✅ Ideální pro fine-tuning |
| 500+ | ✅ Vynikající! Další iterace |

### Jak exportovat?

```
1. Kliknout [📥 Exportovat data]
2. Soubor se automaticky stáhne
3. Název: fine-tuning-data-YYYY-MM-DD.jsonl
```

### Co dál s exportem?

```bash
# 1. Nahrát na OpenAI
openai api files.create -f fine-tuning-data.jsonl -p fine-tune

# 2. Spustit fine-tuning
openai api fine_tuning.jobs.create -t <FILE_ID> -m gpt-4o-mini-2024-07-18

# 3. Sledovat
openai api fine_tuning.jobs.follow -i <JOB_ID>
```

---

## 🚀 Denní workflow

### Pro hygienistky:

```
09:00 → Otevřít Fine-Tuning stránku
      → Zkontrolovat, kolik je neohodnocených
      
10:00 → Použít filtr "Neohodnoceno"
      → Otevřít první záznam
      → Prohlédnout + ohodnotit + feedback
      → Uložit
      
      → Opakovat 5-10x
      
17:00 → Zkontrolovat progress
      → Vidět zlepšení! 🎉
```

### Pro správce:

```
Týdně:
□ Zkontrolovat statistiky
□ Sledovat průměrné hodnocení
□ Motivovat hygienistky

Měsíčně:
□ Když ≥100 kvalitních → Export
□ Spustit fine-tuning
□ Aktualizovat model v mobilní app
□ Měřit zlepšení
```

---

## 🎯 Cílové hodnoty

| Metrika | Cíl |
|---------|-----|
| **Ohodnoceno** | 200+ záznamů |
| **Průměrné hodnocení** | ≥3.5 (aby měl fine-tuning smysl) |
| **S feedbackem** | ≥50% hodnocení |
| **Připraveno k exportu** | 100-200+ (pro první iteraci) |

---

## 📱 Klávesové zkratky

*(zatím nejsou implementované, ale doporučujeme pro budoucnost)*

- `Ctrl/Cmd + K` - Rychlé vyhledávání
- `N` - Nový záznam
- `E` - Exportovat
- `R` - Refresh/Obnovit
- `F` - Focus na filtry

---

## 🐛 Časté problémy a řešení

### "Žádné záznamy nenalezeny"
→ Zkontrolujte filtry, možná jsou příliš restriktivní

### "Nelze exportovat"
→ Potřebujete alespoň 50 kvalitních hodnocení (≥4⭐)

### "Průměrné hodnocení je nízké"
→ Normální na začátku, zlepší se po fine-tuningu

### "Statistiky se neaktualizují"
→ Klikněte [🔄 Obnovit] nebo F5

---

## 📞 Rychlá pomoc

| Problém | Řešení |
|---------|--------|
| Jak hodnotit? | [FINE_TUNING_PAGE_GUIDE.md](./FINE_TUNING_PAGE_GUIDE.md) |
| Jak exportovat? | Tlačítko na stránce, pak OpenAI CLI |
| Jak vylepšit AI? | Více hodnocení + lepší feedback |
| Technická otázka? | [CHANGES_FINE_TUNING_PAGE.md](./CHANGES_FINE_TUNING_PAGE.md) |

---

## 💡 Pro pokročilé

### SQL dotaz pro rychlý přehled:
```sql
SELECT 
  COUNT(*) as total,
  COUNT(quality_rating) as rated,
  AVG(quality_rating) as avg_rating,
  COUNT(CASE WHEN quality_rating >= 4 THEN 1 END) as ready
FROM paro_records 
WHERE llm_original IS NOT NULL;
```

### Měření zlepšení:
```
Před fine-tuningem:
- Průměrné hodnocení: X
- % s hodnocením 4+: Y%

Po fine-tuningu:
- Průměrné hodnocení: X + 0.5-1.0
- % s hodnocením 4+: Y + 10-20%
```

---

## ✨ Tipy pro efektivitu

1. **Denně 10 minut** hodnotit = 50 hodnocení/týden
2. **Copy-paste template** pro feedback
3. **Fokus na špičkové záznamy** (≥4⭐) pro export
4. **Sledovat trend** průměrného hodnocení
5. **Oslavit milníky** (100, 200, 500 hodnocení)

---

**🎯 Pamatujte:** Čím více kvalitních hodnocení, tím lepší AI!

*Vytištěte si tento dokument a dejte vedle počítače* 📋






