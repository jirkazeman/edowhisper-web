#!/bin/bash

# Script: Apply Confidence Scoring Migration to Supabase
# Usage: ./scripts/apply-confidence-migration.sh

echo "🚀 Aplikace Confidence Scoring migrace na Supabase..."
echo ""

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Chyba: SUPABASE_DB_URL není nastavena"
  echo ""
  echo "Nastavte ji pomocí:"
  echo "export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres'"
  echo ""
  echo "Nebo spusťte migraci ručně přes Supabase Dashboard → SQL Editor"
  exit 1
fi

echo "✅ SUPABASE_DB_URL je nastavena"
echo ""

# Apply migration
echo "📝 Aplikuji add_confidence_scoring.sql..."
psql "$SUPABASE_DB_URL" < supabase/migrations/add_confidence_scoring.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migrace úspěšně aplikována!"
  echo ""
  echo "🎯 Nové sloupce v tabulce paro_records:"
  echo "  - confidence_scores (JSONB)"
  echo "  - low_confidence_fields (TEXT[])"
  echo "  - gemini_corrections (JSONB)"
  echo "  - correction_history (JSONB[])"
  echo "  - validation_method (TEXT)"
  echo "  - avg_confidence (NUMERIC)"
  echo ""
  echo "📊 Vytvořeny indexy pro performance"
  echo ""
  echo "➡️  Pokračujte s implementací UI"
else
  echo ""
  echo "❌ Chyba při aplikaci migrace"
  echo ""
  echo "Zkuste aplikovat ručně přes Supabase Dashboard:"
  echo "1. Otevřete https://supabase.com/dashboard"
  echo "2. Vyberte projekt"
  echo "3. SQL Editor → New query"
  echo "4. Zkopírujte obsah supabase/migrations/add_confidence_scoring.sql"
  echo "5. Spusťte"
  exit 1
fi

