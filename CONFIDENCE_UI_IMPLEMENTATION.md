# 🎨 Confidence Scoring UI Implementation Guide

## Přehled změn v `/app/dashboard/records/[id]/page.tsx`

### 1. Přidat imports (✅ HOTOVO)
```typescript
import { AlertTriangle } from "lucide-react";
import type { ConfidenceScores, GeminiCorrections } from "@/lib/types";
import { getConfidenceColorClass, formatConfidence, getConfidenceEmoji } from "@/lib/confidenceCalculator";
```

### 2. Přidat state pro confidence (řádek ~50)
```typescript
// Confidence scoring & Gemini validace
const [confidenceScores, setConfidenceScores] = useState<ConfidenceScores>({});
const [lowConfidenceFields, setLowConfidenceFields] = useState<string[]>([]);
const [geminiCorrections, setGeminiCorrections] = useState<GeminiCorrections>({});
const [validatingFields, setValidatingFields] = useState<Set<string>>(new Set());
```

### 3. Načíst confidence scores při loadingu (v `fetchRecord()` funkci)
```typescript
const fetchRecord = async () => {
  // ... existing code ...
  
  if (data && data.length > 0) {
    const rec = data[0];
    setRecord(rec);
    
    // ✨ NOVÉ: Načíst confidence scores
    setConfidenceScores(rec.confidence_scores || {});
    setLowConfidenceFields(rec.low_confidence_fields || []);
    setGeminiCorrections(rec.gemini_corrections || {});
    
    // ... rest of code ...
  }
};
```

### 4. Rozšířit `getInputClass()` o confidence styling (řádek ~389)
```typescript
const getInputClass = (
  value: any, 
  fieldName: string,  // ✨ NOVÝ parametr
  baseClass: string = "w-full px-3 py-2 border border-gray-300 rounded text-sm"
) => {
  // Pokud je skrytý field status, vrať base
  if (!showFieldStatus) return baseClass;
  
  // ✨ NOVÉ: Confidence scoring má prioritu
  const confidence = confidenceScores[fieldName]?.value;
  if (confidence !== undefined) {
    // Confidence styling
    const confidenceClass = getConfidenceColorClass(confidence);
    return `${baseClass} ${confidenceClass}`;
  }
  
  // Fallback na původní logiku (filled/unfilled)
  if (isFieldFilled(value)) return baseClass;
  return baseClass.replace('border-gray-300', 'border-[#FF6B6B]');
};
```

### 5. Přidat Confidence Badge komponentu (před return)
```typescript
// Confidence badge pro zobrazení % u pole
const ConfidenceBadge = ({ fieldName }: { fieldName: string }) => {
  const confidence = confidenceScores[fieldName]?.value;
  if (confidence === undefined) return null;
  
  const emoji = getConfidenceEmoji(confidence);
  const percent = formatConfidence(confidence);
  const isLow = confidence < 0.2;
  
  return (
    <span 
      className={`inline-flex items-center gap-1 text-xs ml-2 px-1.5 py-0.5 rounded ${
        isLow ? 'bg-red-100 text-red-700' : 
        confidence < 0.5 ? 'bg-yellow-100 text-yellow-700' : 
        'bg-green-100 text-green-700'
      }`}
      title={`Confidence score: ${percent}`}
    >
      {emoji} {percent}
    </span>
  );
};
```

### 6. Přidat Gemini Suggestion Card komponentu
```typescript
// Gemini návrh pro low-confidence pole
const GeminiSuggestion = ({ fieldName }: { fieldName: string }) => {
  const correction = geminiCorrections[fieldName];
  if (!correction) return null;
  
  const handleAccept = async () => {
    // Přijmout Gemini návrh
    // TODO: Update form_data + correction_history
    console.log('Přijímám Gemini návrh pro', fieldName);
  };
  
  const handleReject = () => {
    // Zamítnout návrh
    setGeminiCorrections(prev => {
      const newCorrections = { ...prev };
      delete newCorrections[fieldName];
      return newCorrections;
    });
  };
  
  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
        <div className="flex-1">
          <div className="text-xs font-semibold text-blue-900 mb-1">
            🤖 Gemini navrhuje opravu
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <div>
              <span className="font-medium">Původní:</span> 
              <span className="ml-1 line-through">{correction.original}</span>
            </div>
            <div>
              <span className="font-medium">Navrženo:</span> 
              <span className="ml-1 font-semibold text-blue-700">{correction.suggested}</span>
            </div>
            <div className="text-gray-600 italic">
              {correction.reason}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAccept}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
            >
              ✅ Přijmout
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition"
            >
              ❌ Zamítnout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 7. Aktualizovat input fields (např. řádek ~540)

**Před:**
```tsx
<input 
  type="text" 
  value={fd.lastName || ""} 
  readOnly 
  className={getInputClass(fd.lastName, "w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium")} 
/>
```

**Po:**
```tsx
<div>
  <label className="block text-xs text-gray-600 mb-1">
    Příjmení
    <FieldStatusIcon value={fd.lastName} />
    <ConfidenceBadge fieldName="lastName" />
  </label>
  <input 
    type="text" 
    value={fd.lastName || ""} 
    readOnly 
    className={getInputClass(fd.lastName, "lastName", "w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium")} 
  />
  <GeminiSuggestion fieldName="lastName" />
</div>
```

### 8. Přidat "Validovat" tlačítko pro low-confidence pole
```typescript
const triggerGeminiValidation = async (fieldName: string) => {
  if (validatingFields.has(fieldName)) return; // Already validating
  
  setValidatingFields(prev => new Set(prev).add(fieldName));
  
  try {
    const response = await fetch(`/api/records/${params.id}/validate-field`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fieldName,
        fieldValue: record?.form_data[fieldName]
      })
    });
    
    if (response.ok) {
      const { correction } = await response.json();
      setGeminiCorrections(prev => ({
        ...prev,
        [fieldName]: correction
      }));
    }
  } catch (error) {
    console.error('Gemini validation error:', error);
  } finally {
    setValidatingFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  }
};
```

---

## 📝 Shrnutí změn

1. ✅ Import confidence utilities
2. ✅ State pro confidence scores, low_confidence_fields, gemini_corrections
3. ✅ Načtení dat z databáze
4. ✅ Rozšířený `getInputClass()` s confidence styling
5. ✅ `ConfidenceBadge` komponenta
6. ✅ `GeminiSuggestion` komponenta
7. ✅ Aktualizované input fields
8. ✅ Gemini validace funkce

---

## 🎨 Výsledek

- 🟢 **Zelená pole** (80%+): Vysoká confidence
- 🟡 **Žlutá pole** (50-80%): Střední confidence
- 🟠 **Oranžová pole** (20-50%): Nízká confidence
- 🔴 **Červená pole** (<20%): Velmi nízká confidence + Gemini návrh

---

**Ready pro implementaci! 🚀**

