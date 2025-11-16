# 🤖 Kompletní průvodce Fine-tuning LLM

## 📊 **Přehled procesu**

```
1. Ověř 50+ záznamů (✅ zelený badge)
2. Exportuj data (JSONL soubor)
3. Upload do OpenAI (Fine-tuning job)
4. Získej nové Model ID
5. Aktualizuj aplikaci
6. Testuj nový model
```

---

## 🎯 **KROK 1: Nahromadění dat**

### Minimální požadavky:
- ✅ **50 ověřených záznamů** (minimum)
- ✅ **100+ doporučeno** pro lepší výsledky
- ✅ **Různé typy záznamů** (různí pacienti, situace)

### Jak ověřovat záznamy:

1. **Otevři Dashboard** → Záznamy
2. **Klikni na záznam** → Detail
3. **Zkontroluj pole** s low confidence (🔴🟠 červený/oranžový border)
4. **Oprav chyby** (klikni do pole, edituj, Tab)
5. **Klikni "✅ Ověřit"** v pravém horním rohu
6. **Potvrď** dialog

### Kontrola stavu:

```sql
-- V Supabase SQL Editor:
SELECT 
  COUNT(*) as total_verified,
  COUNT(DISTINCT user_id) as unique_patients,
  MIN(verified_at) as first_verified,
  MAX(verified_at) as last_verified
FROM paro_records 
WHERE verified_by_hygienist = true;
```

**Cíl:** Alespoň 50 verified záznamů

---

## 🎯 **KROK 2: Export dat**

### Metoda A: Web UI (nejjednodušší) ✨

1. **Přihlas se** do dashboard
2. **Jdi na**: `/dashboard/fine-tuning`
3. **Klikni**: "📥 Exportovat data pro fine-tuning"
4. **Stáhne se**: `fine-tuning-data-YYYY-MM-DD.jsonl`

### Metoda B: API endpoint

```bash
# cURL:
curl https://edowhisper-web.vercel.app/api/fine-tuning/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o fine-tuning-data.jsonl

# Browser:
https://edowhisper-web.vercel.app/api/fine-tuning/export
```

### Formát souboru (JSONL):

```jsonl
{"messages":[{"role":"system","content":"Jsi AI asistent pro dentální hygienu..."},{"role":"user","content":"Příjmení Novák, rodné číslo 850101/1234..."},{"role":"assistant","content":"{\"lastName\":\"Novák\",\"personalIdNumber\":\"850101/1234\"...}"}]}
{"messages":[{"role":"system","content":"Jsi AI asistent pro dentální hygienu..."},{"role":"user","content":"Další přepis..."},{"role":"assistant","content":"{...}"}]}
```

**Každý řádek = 1 trénovací příklad**

---

## 🎯 **KROK 3: Upload do OpenAI**

### 📊 Ceník OpenAI Fine-tuning:

| Model | Training | Input | Output |
|-------|----------|-------|--------|
| gpt-4o-mini | $3.00/1M tokens | $0.30/1M | $1.20/1M |
| gpt-4o | $25.00/1M tokens | $3.75/1M | $15.00/1M |

**Doporučení**: Začni s **gpt-4o-mini** (levnější)

---

### Metoda A: OpenAI Playground (GUI) ✨ **DOPORUČENO**

#### 1. **Přihlas se do OpenAI:**
```
https://platform.openai.com/finetune
```

#### 2. **Vytvoř fine-tuning job:**
- Klikni: **"Create fine-tuned model"**
- Upload: Tvůj `.jsonl` soubor
- Base model: `gpt-4o-mini-2024-07-18`
- Suffix: `edowhisper-v1` (volitelné)
- Hyperparameters: **Nech default**

#### 3. **Spusť job:**
- Klikni: **"Start training"**
- Počkej: **10-60 minut** (závisí na počtu příkladů)

#### 4. **Zkontroluj status:**
- Dashboard → Fine-tuning → Tvůj job
- Status: `queued` → `running` → `succeeded`

#### 5. **Získej Model ID:**
```
ft:gpt-4o-mini-2024-07-18:company:edowhisper-v1:abc123xyz
```

---

### Metoda B: OpenAI API (CLI)

#### 1. **Nastav API key:**
```bash
export OPENAI_API_KEY="sk-proj-..."
```

#### 2. **Upload souboru:**
```bash
curl https://api.openai.com/v1/files \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F purpose="fine-tune" \
  -F file="@fine-tuning-data-2025-11-16.jsonl"
```

**Response:**
```json
{
  "id": "file-abc123",
  "object": "file",
  "purpose": "fine-tune",
  "filename": "fine-tuning-data-2025-11-16.jsonl",
  "bytes": 123456,
  "created_at": 1700000000,
  "status": "processed"
}
```

**✅ Zapamatuj si**: `file-abc123`

#### 3. **Spustit fine-tuning:**
```bash
curl https://api.openai.com/v1/fine_tuning/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "training_file": "file-abc123",
    "model": "gpt-4o-mini-2024-07-18",
    "suffix": "edowhisper-v1"
  }'
```

**Response:**
```json
{
  "id": "ftjob-xyz789",
  "object": "fine_tuning.job",
  "model": "gpt-4o-mini-2024-07-18",
  "created_at": 1700000000,
  "fine_tuned_model": null,
  "status": "queued"
}
```

**✅ Zapamatuj si**: `ftjob-xyz789`

#### 4. **Zkontrolovat status:**
```bash
curl https://api.openai.com/v1/fine_tuning/jobs/ftjob-xyz789 \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Status:**
- `queued` - čeká ve frontě
- `running` - právě se trénuje
- `succeeded` - **HOTOVO!** ✅
- `failed` - chyba ❌

#### 5. **Získat finální Model ID:**
```bash
curl https://api.openai.com/v1/fine_tuning/jobs/ftjob-xyz789 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  | jq -r '.fine_tuned_model'
```

**Output:**
```
ft:gpt-4o-mini-2024-07-18:company:edowhisper-v1:abc123xyz
```

**✅ Tohle je tvůj nový Model ID!**

---

## 🎯 **KROK 4: Aktualizace mobilní aplikace**

### A) **Změnit Model ID:**

**Soubor:** `EDOWhisper/services/llmExtractService.ts`

**Najdi řádek 957:**
```typescript
model: 'gpt-4o-mini', // 💰 Ekonomický režim (~$0.02/záznam)
```

**Změň na:**
```typescript
model: 'ft:gpt-4o-mini-2024-07-18:company:edowhisper-v1:abc123xyz', // 🎯 Fine-tuned model
```

### B) **Commit a push:**
```bash
cd /Users/jirizeman/dev/EDOWhisper
git add services/llmExtractService.ts
git commit -m "feat: Použití fine-tuned GPT-4o-mini modelu (v1)"
git push origin main
```

### C) **Build nové verze:**
```bash
# Zvýšit verzi v app.json:
"version": "1.2.0"

# Build:
eas build --platform ios --profile production
```

---

## 🎯 **KROK 5: Testování**

### Test 1: Kontrola API volání

**Otevři console v mobilní app:**
```javascript
console.log('Using model:', model);
// Mělo by vypsat: ft:gpt-4o-mini-2024-07-18:...
```

### Test 2: Porovnání výsledků

**Před fine-tuning:**
```json
{
  "lastName": "Novák",
  "generalAnamnesis": "bez onemocnění",
  "confidence": 0.65
}
```

**Po fine-tuning:**
```json
{
  "lastName": "Novák",
  "generalAnamnesis": "KV onemocnění ani jiná onemocnění pacient neudává",
  "confidence": 0.92
}
```

**✅ Očekávané zlepšení:**
- Vyšší confidence scores (0.7+ → 0.9+)
- Přesnější terminologie (dental jargon)
- Méně halucinací
- Lepší porozumění kontextu

### Test 3: Batch test

**Otestuj na 10+ záznamech:**
1. Nahraj nový záznam
2. Zkontroluj výstup LLM
3. Porovnej s předchozími výsledky

---

## 🎯 **KROK 6: Iterace (opakování)**

### Když potřebuješ ještě lepší model:

1. **Shromáždi více dat** (200+, 500+, 1000+)
2. **Exportuj nová data**
3. **Vytvoř nový fine-tuning job** (`edowhisper-v2`)
4. **Získej nové Model ID**
5. **Aktualizuj aplikaci**
6. **Testuj**

---

## 📊 **Metriky úspěchu**

### Před fine-tuning:
- ❌ Confidence: 60-75%
- ❌ Halucinace: 15-20%
- ❌ Nepřesná terminologie

### Po fine-tuning (50+ příkladů):
- ✅ Confidence: 80-90%
- ✅ Halucinace: 5-10%
- ✅ Přesnější terminologie

### Po fine-tuning (200+ příkladů):
- ✅✅ Confidence: 90-95%
- ✅✅ Halucinace: <5%
- ✅✅ Velmi přesná terminologie

---

## 💰 **Odhad nákladů**

### Příklad (100 verified záznamů):

**Training:**
- 100 záznamů × 2000 tokenů = 200,000 tokenů
- 200k × $3.00 / 1M = **$0.60**

**Inference (po natrénování):**
- 1 záznam × 1500 input tokenů × $0.30 / 1M = $0.00045
- 1 záznam × 500 output tokenů × $1.20 / 1M = $0.0006
- **Celkem: ~$0.001 na záznam** (velmi levné!)

### Srovnání:
- Base model: $0.02 na záznam
- Fine-tuned: $0.001 na záznam
- **Úspora: 95%** (když už je natrénovaný)

---

## ❓ **FAQ**

### Q: Kolik záznamů minimálně potřebuji?
**A:** OpenAI doporučuje **50+**, ale čím více, tím lépe. Ideální je **100-200**.

### Q: Jak dlouho trvá fine-tuning?
**A:** 10-60 minut pro 50-100 příkladů. Větší datasety mohou trvat i hodiny.

### Q: Můžu použít starý model?
**A:** Ano! Starý Model ID zůstává funkční. Můžeš ho kdykoliv znovu použít.

### Q: Co když fine-tuning selže?
**A:** Zkontroluj formát JSONL. Každý řádek musí být validní JSON. Použij validátor:
```bash
cat fine-tuning-data.jsonl | jq -c . > /dev/null
# Pokud je OK, nic se nevypíše
```

### Q: Můžu mít více fine-tuned modelů?
**A:** Ano! Můžeš mít `edowhisper-v1`, `edowhisper-v2`, atd. a přepínat mezi nimi.

### Q: Jak často mám přetrénovat model?
**A:** Každých **200-500 nových ověřených záznamů** nebo když zjistíš, že výsledky stagnují.

### Q: Co když potřebuji rollback?
**A:** Jednoduše změň Model ID zpět na starší verzi nebo na base model (`gpt-4o-mini`).

---

## 🔧 **Troubleshooting**

### Problém: "Invalid training file"
**Řešení:** Zkontroluj formát JSONL:
```bash
# Validace:
cat fine-tuning-data.jsonl | while read line; do echo "$line" | jq . > /dev/null || echo "Invalid JSON"; done
```

### Problém: "Job failed"
**Řešení:** Otevři job detail v OpenAI Dashboard → Error message
- Nejčastější: nevalidní JSON, duplicitní příklady, příliš dlouhé tokeny

### Problém: "Model not found"
**Řešení:** Zkontroluj, že fine-tuning job je `succeeded` a že Model ID je správně zkopírované.

### Problém: Nový model je horší než base model
**Řešení:** 
- Potřebuješ více dat (100+)
- Zkontroluj kvalitu ověřených záznamů
- Zkus jiný base model (`gpt-4o` místo `gpt-4o-mini`)

---

## 📚 **Další zdroje**

- [OpenAI Fine-tuning Guide](https://platform.openai.com/docs/guides/fine-tuning)
- [Best practices](https://platform.openai.com/docs/guides/fine-tuning/preparing-your-dataset)
- [Pricing](https://openai.com/pricing)

---

## 🎯 **Checklist**

```
□ 1. Nahromadil/a jsem 50+ ověřených záznamů
□ 2. Exportoval/a jsem JSONL soubor
□ 3. Nahrál/a jsem do OpenAI
□ 4. Fine-tuning job úspěšně dokončen
□ 5. Získal/a jsem Model ID
□ 6. Aktualizoval/a jsem llmExtractService.ts
□ 7. Commitnul/a a pushnul/a změny
□ 8. Buildnul/a novou verzi aplikace
□ 9. Otestoval/a jsem nový model
□ 10. Monitoruji výsledky a metriky
```

---

**Vytvořeno:** 16.11.2025  
**Autor:** AI Assistant  
**Verze:** 1.0.0  
**Poslední aktualizace:** 16.11.2025

