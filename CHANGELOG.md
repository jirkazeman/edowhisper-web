# 📝 Changelog - EDO Whisper Web

Všechny významné změny v projektu budou zdokumentovány v tomto souboru.

---

## [1.1.0] - 2024-10-30

### ✨ Přidáno

#### 🎯 Fine-Tuning Management Stránka
- **Nová dedikovaná stránka** `/dashboard/fine-tuning` pro správu hodnocení AI výstupů
- **Real-time statistiky:**
  - Celkový počet záznamů s AI výstupem
  - Počet ohodnocených/neohodnocených záznamů
  - Průměrné hodnocení (1-5 hvězdiček)
  - Počet záznamů připravených k exportu (rating ≥4)
- **Vizuální distribuce hodnocení** s progress bary a statistikami
- **Inteligentní doporučení** podle stavu dat:
  - Barevně rozlišené bannery (zelený/modrý/žlutý/červený)
  - Automatické tipy, kdy spustit fine-tuning
- **Pokročilé filtry:**
  - Podle hodnocení (všechny/neohodnoceno/1-5⭐)
  - Podle zpětné vazby (všechny/s feedbackem/bez feedbacku)
- **Přehledná tabulka záznamů** s možností rychlého přechodu na detail
- **Real-time aktualizace** při změnách dat

#### 🔌 API Endpoints
- **POST `/api/fine-tuning/export`** - Export dat do OpenAI JSONL formátu
  - Automatické filtrování kvalitních záznamů (rating ≥4)
  - Generování správného formátu pro fine-tuning
  - Přímé stažení souboru
- **GET `/api/fine-tuning/export`** - Statistiky pro export
  - Přehled záznamů připravených k exportu
  - Agregované metriky kvality

#### 📚 Dokumentace
- **FINE_TUNING_PAGE_GUIDE.md** - Kompletní průvodce novou stránkou
- **CHANGES_FINE_TUNING_PAGE.md** - Přehled všech změn
- **FINE_TUNING_PAGE_LAYOUT.md** - Vizuální dokumentace designu
- **CHANGELOG.md** - Tento soubor

### 🔄 Změněno

#### Navigace
- Přidána položka **"Fine-Tuning"** do hlavního menu dashboardu
- Přidána položka **"AI Role"** do hlavního menu
- Vylepšené zvýraznění aktivní sekce (včetně podsložek)
- Nová ikona Sparkles (✨) pro Fine-Tuning sekci

#### README
- Aktualizována hlavní stránka s odkazem na novou Fine-Tuning stránku
- Přidány odkazy na novou dokumentaci
- Zvýraznění dedikované stránky jako hlavního vstupu

#### README_FINE_TUNING.md
- Přidány odkazy na nové dokumentační soubory na začátek
- Zvýrazněn FINE_TUNING_PAGE_GUIDE.md jako primární průvodce

### 🐛 Opravy

- Žádné v této verzi (nová funkcionalita)

---

## [1.0.0] - 2024-10-XX

### ✨ Přidáno

#### Základní systém
- ✅ Autentizace uživatelů (Supabase Auth)
- ✅ Dashboard s přehledem
- ✅ Správa záznamů pacientů
- ✅ Detail záznamu s hodnocením AI
- ✅ API endpoints pro CRUD operace

#### Fine-Tuning základ
- ✅ Databázové sloupce pro hodnocení (`quality_rating`, `hygienist_feedback`, atd.)
- ✅ UI pro hodnocení v detailu záznamu
- ✅ API endpoint pro uložení hodnocení (PATCH `/api/records`)
- ✅ Export script (`scripts/export-fine-tuning-data.ts`)

#### Dokumentace
- ✅ README_FINE_TUNING.md
- ✅ FINE_TUNING_QUICKSTART.md
- ✅ FINE_TUNING_GUIDE.md
- ✅ INTEGRATION_EXAMPLE.md
- ✅ SQL_QUERIES.md
- ✅ A další...

#### AI Role
- ✅ Správa AI rolí a system promptů
- ✅ Stránka `/dashboard/ai-roles`

---

## 🔮 Plánované funkce

### v1.2.0 (Budoucí)
- [ ] 📊 Grafy trendů kvality v čase
- [ ] 📧 Email notifikace při dosažení milníků (100, 200, 500 hodnocení)
- [ ] 🔄 Přímá integrace s OpenAI API pro automatický export
- [ ] 📝 Historie exportů a fine-tuning jobů
- [ ] 🎨 Porovnání původního vs opraveného výstupu vedle sebe
- [ ] 📈 Dashboard widget pro rychlý přehled fine-tuning statusu
- [ ] 🏷️ Tagy a kategorie pro záznamy
- [ ] 🔍 Pokročilé vyhledávání v feedbacku

### v1.3.0 (Budoucí)
- [ ] 🤖 A/B testing různých modelů
- [ ] 📊 Porovnání výkonu mezi verzemi modelů
- [ ] 💬 Collaborative hodnocení (více hygienistek může hodnotit)
- [ ] 🎓 Tutoriály a onboarding pro nové hygienistky
- [ ] 📱 PWA podpora pro lepší mobilní zážitek

---

## 📌 Konvence verzování

Používáme [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Velké breaking changes
- **MINOR** (1.X.0): Nové funkce (zpětně kompatibilní)
- **PATCH** (1.0.X): Opravy bugů

---

## 🔗 Odkazy

- **Dokumentace:** [`documents/`](./documents/)
- **Fine-Tuning průvodce:** [`documents/FINE_TUNING_PAGE_GUIDE.md`](./documents/FINE_TUNING_PAGE_GUIDE.md)
- **Přehled změn:** [`documents/CHANGES_FINE_TUNING_PAGE.md`](./documents/CHANGES_FINE_TUNING_PAGE.md)

---

*Pro starší verze a kompletní historii viz git log.*





