# 🔍 AUDIT: Současné funkce v Record Detail Page

**Datum:** 17. listopadu 2025
**Soubor:** `app/dashboard/records/[id]/page.tsx`

---

## ✅ **FUNKCE KTERÉ MUSÍ ZŮSTAT:**

### 🎯 **HEADER CONTROLS (řádky 724-850):**

1. **← Zpět** (ArrowLeft)
   - Navigace na předchozí stránku
   - ✅ ZACHOVAT

2. **✅ Ověřit / ✅ Ověřeno** (Shield button)
   - ⚠️ AKTUÁLNĚ VYPNUTO (alert na řádku 711-717)
   - 🔄 NAHRADIT novým workflow "Uložit a ověřit"

3. **🛡️ Validovat extrakci** (Shield icon - Dual-LLM)
   - Gemini 2.0 Flash validace celého záznamu
   - ✅ ZACHOVAT (= AI ikona kterou chceš ponechat)

4. **📱 Odeslat do telefonu** (Smartphone)
   - Push notification do mobilní app
   - ✅ ZACHOVAT

5. **🤖 LLM tuning** (Sparkles)
   - Navigace na /dashboard/fine-tuning
   - ✅ ZACHOVAT

6. **👤 Hygienist correction** (UserCheck)
   - Otevře CorrectionsModal
   - ✅ ZACHOVAT

7. **🔍 Zoom +/-** (ZoomIn/ZoomOut)
   - Zvětšení/zmenšení fontSize (100-200%)
   - ✅ ZACHOVAT

8. **👁️ Toggle Field Status** (Eye/EyeOff)
   - Zapne/vypne zelené/korálové ohraničení prázdných polí
   - ✅ ZACHOVAT

---

### 📊 **3-COLUMN LAYOUT (řádky 854-1220):**

#### **LEFT COLUMN (280px):**
- **Examination Summary** (examinationSummary)
- ✅ ZACHOVAT

#### **MIDDLE COLUMN (flex-1, scrollable):**
- **SimpleDentalChart** (zubní kříž)
  - Kliknutelné zuby → ToothEditor modal
  - Auto-save při změně
  - ✅ ZACHOVAT
  
- **PeriodontalStatusChart** (parodontální status)
  - Editable + PNG/JSON export
  - Auto-save při změně
  - ✅ ZACHOVAT

#### **RIGHT COLUMN (320px, scrollable):**

**1. Patient Info:**
- lastName (editovatelné inline)
- personalIdNumber (editovatelné inline)
- ConfidenceBadge pro každé pole
- FieldActions (🤖 Validovat button)
- ✅ ZACHOVAT editaci
- ✅ ZACHOVAT confidence badges
- 🔄 UPRAVIT: Edit mode místo inline editing

**2. Anamnesis:**
- generalAnamnesis
- permanentMedication
- allergies
- stomatologicalAnamnesis
- 🔄 UPRAVIT: Edit mode místo vždy editovatelných

**3. Clinical Examination:**
- hygiene, gingiva, tartar, tools
- caries, mucosa, tongue, frenulum
- occlusion, orthodonticAnomaly
- 🔄 UPRAVIT: Edit mode

**4. Indices:**
- bob, pbiValues, pbiTools, cpitn
- 🔄 UPRAVIT: Edit mode

**5. Treatment Record:**
- treatmentRecord (textarea)
- Copy to clipboard button
- ✅ ZACHOVAT copy button
- 🔄 UPRAVIT: Edit mode

**6. Transcript (řádky 1170-1195):**
- TranscriptHighlight component
- Žlutě označená nevyužitá slova
- Stats (použito X%, nevyužito Y slov)
- ✅ ZACHOVAT

---

## 🚀 **FUNKCE KTERÉ SE PŘIDAJÍ:**

### **1. Edit Mode Toggle:**
```typescript
const [isEditMode, setIsEditMode] = useState(false);
```

- **Button:** "✏️ Opravit záznam"
- **Akce:** Přepne všechna pole do editovatelného stavu
- **Vizuální:** Tlačítko změní barvu, zobrazí "Režim úprav"

### **2. Save & Verify Button:**
```typescript
const handleSaveAndVerify = async () => {
  // 1. Calculate diff (original vs edited)
  // 2. Save form_data to DB
  // 3. Save human_corrections to DB
  // 4. Set verified_by_hygienist = true
  // 5. Show success message
  // 6. Reload record
  // 7. Exit edit mode
};
```

- **Button:** "✅ Uložit a ověřit"
- **Zobrazí se:** Pouze v Edit Mode
- **Barva:** Zelená (bg-green-600)
- **Icon:** Shield + Check

---

## 📋 **STAV KOMPONENT:**

### ✅ **FUNGUJÍCÍ:**
- SimpleDentalChart (zubní kříž)
- PeriodontalStatusChart (parodontální status)
- ToothEditor modal
- PeriodontalToothEditor modal
- TranscriptHighlight
- CorrectionsModal
- ValidationModal (Dual-LLM)
- Zoom controls
- Copy to clipboard
- Send to phone

### ⚠️ **PROBLEMATICKÉ:**
- handleVerifyRecord (vypnuté kvůli bugu s mizením dat)
- Inline editing (lastName, personalIdNumber) - způsobuje conflikty

### 🔄 **K ÚPRAVĚ:**
- Nahradit inline editing → Edit Mode
- Opravit handleVerifyRecord → handleSaveAndVerify
- Přidat Edit Mode toggle button

---

## 🎯 **IMPLEMENTAČNÍ PLÁN:**

1. ✅ Přidat `isEditMode` state
2. ✅ Přidat "✏️ Opravit záznam" button do headeru
3. ✅ Podmíněně renderovat input fieldy (readonly vs editable)
4. ✅ Přidat "✅ Uložit a ověřit" button (zobrazí se v Edit Mode)
5. ✅ Implementovat `handleSaveAndVerify` funkci
6. ✅ Odstranit staré `handleVerifyRecord`
7. ✅ Zachovat VŠECHNY ostatní funkce beze změny

---

## ⚠️ **CRITICAL:**
- **NESMÍ SE SMAZAT:** Žádná z existujících funkcí (dental cross, periodontal, zoom, copy, etc.)
- **NESMÍ SE ROZBÍT:** Auto-save pro dental cross a periodontal
- **MUSÍ ZŮSTAT:** Všechny ikony v headeru (kromě "Ověřit" → nahradit "Opravit")

---

**READY FOR IMPLEMENTATION! 🚀**

