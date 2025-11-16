# 🔄 Backup: Confidence Scoring Implementation

**Datum:** 16.11.2025 14:06  
**Důvod:** Záloha před implementací multi-layer quality control systému s confidence scoring

## 📦 Zálohované soubory:

- `lib/types.ts` - TypeScript typy
- `lib/api.ts` - API funkce
- `app/dashboard/records/[id]/page.tsx` → `record-detail-page.tsx` - Detail záznamu
- `app/api/records/route.ts` - Records API endpoint
- `app/api/fine-tuning/export/route.ts` → `fine-tuning-export.ts` - Fine-tuning export

## 🔙 Jak obnovit zálohu:

```bash
cd /Users/jirizeman/dev/edowhisper-web

# Obnovit všechny soubory
cp .backups/confidence-scoring-20251116-140600/types.ts lib/
cp .backups/confidence-scoring-20251116-140600/api.ts lib/
cp .backups/confidence-scoring-20251116-140600/record-detail-page.tsx "app/dashboard/records/[id]/page.tsx"
cp .backups/confidence-scoring-20251116-140600/route.ts app/api/records/
cp .backups/confidence-scoring-20251116-140600/fine-tuning-export.ts app/api/fine-tuning/export/route.ts

# Rebuild
npm run build

# Deploy
vercel --prod
```

## 🎯 Co se bude implementovat:

1. **Confidence scoring** - logprobs z OpenAI API
2. **Low-confidence detekce** - pole s confidence < 20%
3. **Dual-LLM validation** - Gemini 2.0 Flash jako druhý validátor
4. **UI indikátory** - barevné označení + návrhy oprav
5. **Correction history** - historie oprav pro fine-tuning

## 📊 Databázové změny:

```sql
ALTER TABLE paro_records ADD COLUMN confidence_scores JSONB;
ALTER TABLE paro_records ADD COLUMN low_confidence_fields TEXT[];
ALTER TABLE paro_records ADD COLUMN gemini_corrections JSONB;
ALTER TABLE paro_records ADD COLUMN correction_history JSONB[];
```

