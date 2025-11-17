# 🔍 AUDIT: Stávající funkce v Record Detail Page

**Datum:** 17. listopadu 2025
**Účel:** Zkontrolovat co všechno musí zůstat funkční po implementaci nového workflow

---

## 📋 **STÁVAJÍCÍ FUNKCE (MUSÍ ZŮSTAT):**

### **1. HEADER BUTTONS (řádky 807-890)**

#### **A) ⬅️ Zpět**
- ✅ `onClick={() => router.back()}`
- Funkce: Vrátit se na seznam záznamů

#### **B) 🔍 Zoom In/Out**
- ✅ `setFontSize(prev => Math.min(prev + 10, 200))`
- ✅ `setFontSize(prev => Math.max(prev - 10, 50))`
- Funkce: Zvětšit/zmenšit velikost textu

#### **C) 👁️ Zobrazit/Skrýt označení polí**
- ✅ `setShowFieldStatus(!showFieldStatus)`
- Funkce: Zapnout/vypnout korálové ohraničení prázdných polí

#### **D) ✨ Sparkles (co to dělá?)**
- ❓ Není implementováno nebo disabled?
- TODO: Zkontrolovat

#### **E) ✅ Ověřit / ❌ Odebrat ověření**
- ⚠️ **AKTUÁLNĚ VYPNUTO** (zobrazuje alert)
- Funkce: `handleVerifyRecord()` (řádek 710)
- **BUDE NAHRAZENO novým workflow**

#### **F) 🤖 Validovat extrakci (AI ikona)**
- ✅ `handleValidateExtraction()` (řádek 228)
- Funkce: Dual-LLM validace přes Gemini
- **PONECHAT!**

#### **G) 🤖 Validovat všechna low-confidence pole**
- ✅ `triggerBatchValidation()` (řádek 121)
- Funkce: Batch validace přes Gemini
- **PONECHAT!**

#### **H) 🎯 LLM tuning**
- ✅ Odkaz na `/dashboard/fine-tuning`
- Funkce: Export dat pro fine-tuning
- **PONECHAT!**

#### **I) 📝 Hygienist correction**
- ✅ `setShowCorrectionsModal(true)`
- Funkce: Zobrazit modal s opravami
- **PONECHAT!**

---

### **2. DENTAL CROSS (řádky 950+)**

#### **A) Kliknutí na zub**
- ✅ `setEditingToothId(toothId)`
- Funkce: Otevřít editor zubu
- **PONECHAT!**

#### **B) ToothEditor modal**
- ✅ `handleSaveTooth()` (řádek 359)
- Funkce: Uložit stav zubu do DB
- **PONECHAT!**

---

### **3. PERIODONTAL STATUS CHART (řádky 1000+)**

#### **A) Kliknutí na zub**
- ✅ Otevřít `PeriodontalToothEditor`
- Funkce: Editovat parodontální data
- **PONECHAT!**

#### **B) Export PNG/JSON**
- ✅ `handleExportPNG()` / `handleExportJSON()`
- Funkce: Stáhnout graf jako obrázek nebo JSON
- **PONECHAT!**

#### **C) Uložení parodontálního protokolu**
- ✅ `handleSavePeriodontalProtocol()` (řádek 409)
- Funkce: Automaticky ukládá změny
- **PONECHAT!**

---

### **4. EDITOVATELNÁ POLE (řádky 900-1100)**

#### **A) lastName, personalIdNumber**
- ✅ `onChange` + `onBlur` → `handleFieldUpdate()`
- Funkce: Inline editace s auto-save
- **PONECHAT!**

#### **B) Confidence Badge**
- ✅ Zobrazení confidence skóre
- Funkce: Vizuální indikace kvality
- **PONECHAT!**

#### **C) Gemini Suggestion**
- ✅ `handleAccept()` / `handleReject()`
- Funkce: Přijmout/zamítnout Gemini návrh
- **PONECHAT!**

#### **D) Field Actions (🤖 Validovat)**
- ✅ `triggerGeminiValidation(fieldName)`
- Funkce: Validovat jedno pole přes Gemini
- **PONECHAT!**

---

### **5. TREATMENT RECORD (řádky 1100+)**

#### **A) ✏️ Upravit / 💾 Uložit / ❌ Zrušit**
- ✅ `setIsEditingTreatment(true)`
- ✅ `handleSaveTreatmentRecord()` (řádek 179)
- Funkce: Editace a uložení záznamu o ošetření
- **PONECHAT!**

#### **B) 📋 Kopírovat do schránky**
- ✅ `copyToClipboard(fd.treatmentRecord)`
- Funkce: Zkopírovat text
- **PONECHAT!**

---

### **6. TRANSCRIPT HIGHLIGHT (řádky 1200+)**

#### **A) TranscriptHighlight component**
- ✅ Zobrazení přepisu se žlutým označením nevyužitých slov
- Funkce: Vizualizace využití přepisu
- **PONECHAT!**

---

### **7. MODALS**

#### **A) ValidationModal**
- ✅ `showValidationModal` state
- Funkce: Zobrazit výsledky Dual-LLM validace
- **PONECHAT!**

#### **B) CorrectionsModal**
- ✅ `showCorrectionsModal` state
- Funkce: Zobrazit historii oprav hygienistkou
- **PONECHAT!**

---

## 🔧 **CO SE BUDE MĚNIT:**

### **PŘED:**
```
✅ Ověřit (řádek 820) → alert("VYPNUTO")
```

### **PO:**
```
✏️ Opravit záznam (nové tlačítko)
  → Zapne editaci všech polí
  → Všechna pole budou `contentEditable` nebo `<input>`

🛡️ Uložit a ověřit (nové tlačítko, nahradí "✅ Ověřit")
  → Uloží všechny změny
  → Vypočítá diff (human_corrections)
  → Nastaví verified_by_hygienist = true
  → Zobrazí potvrzení
```

---

## ✅ **CHECKLIST PO IMPLEMENTACI:**

- [ ] ⬅️ Zpět funguje
- [ ] 🔍 Zoom In/Out funguje
- [ ] 👁️ Zobrazit/Skrýt označení polí funguje
- [ ] 🤖 AI validace (single + batch) funguje
- [ ] 🎯 LLM tuning odkaz funguje
- [ ] 📝 Hygienist correction modal funguje
- [ ] 🦷 Dental Cross editace funguje
- [ ] 📊 Periodontal Chart editace funguje
- [ ] 📥 Export PNG/JSON funguje
- [ ] ✏️ Treatment Record editace funguje
- [ ] 📋 Copy to clipboard funguje
- [ ] 🟡 Transcript Highlight funguje
- [ ] ✏️ **NOVÉ:** Opravit záznam funguje
- [ ] 🛡️ **NOVÉ:** Uložit a ověřit funguje

---

## 🚀 **READY PRO IMPLEMENTACI?**

✅ Audit dokončen
✅ Vím co musí zůstat
✅ Vím co se mění
✅ Můžu začít implementovat!

