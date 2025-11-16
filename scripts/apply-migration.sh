#!/bin/bash

# Script pro aplikaci DB migrace
# Usage: ./scripts/apply-migration.sh

echo "🚀 Aplikace DB migrace: add_human_corrections.sql"
echo ""
echo "⚠️  DŮLEŽITÉ:"
echo "1. Ujistěte se, že máte Supabase connection string"
echo "2. Najdete ho v: Supabase Dashboard → Settings → Database → Connection String"
echo ""
read -p "Máte connection string? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Nejdřív získejte connection string a zkuste znovu."
    exit 1
fi

# Požádat o connection string
echo ""
echo "Zadejte Supabase connection string:"
echo "(postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres)"
read -r DB_URL

if [ -z "$DB_URL" ]; then
    echo "❌ Connection string je prázdný"
    exit 1
fi

# Zkontrolovat že existuje migration soubor
MIGRATION_FILE="supabase/migrations/add_human_corrections.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Soubor $MIGRATION_FILE neexistuje"
    exit 1
fi

echo ""
echo "📝 Spouštím migraci..."
echo ""

# Spustit migraci
psql "$DB_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrace úspěšně aplikována!"
    echo ""
    echo "🔍 Ověřuji nové sloupce..."
    
    # Ověřit
    psql "$DB_URL" -c "
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'paro_records' 
        AND column_name IN ('human_corrections', 'correction_count', 'corrected_at');
    "
    
    echo ""
    echo "🎉 Hotovo! Můžete začít používat fine-tuning systém."
else
    echo ""
    echo "❌ Chyba při aplikaci migrace"
    echo "💡 Tip: Zkuste Metodu 1 (Supabase Dashboard)"
    exit 1
fi

