# 🚀 Jak Spustit DB Migraci (add_human_corrections.sql)

## ⚡ **NEJRYCHLEJŠÍ ZPŮSOB: Supabase Dashboard**

### 📝 Krok za Krokem (5 minut):

1. **Otevřít prohlížeč:**
   ```
   https://supabase.com/dashboard
   ```

2. **Přihlásit se** k vašemu účtu

3. **Vybrat projekt:** `EDOWhisper`

4. **V levém menu kliknout:** `SQL Editor`

5. **Kliknout:** `New Query` (zelené tlačítko vpravo nahoře)

6. **Otevřít soubor:**
   ```
   /Users/jirizeman/dev/edowhisper-web/supabase/migrations/add_human_corrections.sql
   ```
   
7. **Zkopírovat CELÝ obsah** souboru (Cmd+A, Cmd+C)

8. **Vložit do SQL Editoru** (Cmd+V)

9. **Spustit:**
   - Kliknout `Run` (nebo Cmd+Enter)
   - ✅ Měli byste vidět: "Success. No rows returned"

10. **✅ OVĚŘENÍ - Zkopírovat a spustit tento dotaz:**
    ```sql
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'paro_records' 
    AND column_name IN ('human_corrections', 'correction_count', 'corrected_at');
    ```
    
    **Očekávaný výsledek:**
    ```
    human_corrections    | jsonb
    correction_count     | integer
    corrected_at         | timestamp with time zone
    ```

11. **🎉 Hotovo!** Migrace je aplikována.

---

## 🖥️ **ALTERNATIVA: Terminal (Pokročilé)**

### Pokud máte `psql` nainstalovaný:

```bash
# 1. Najít connection string:
#    Supabase Dashboard → Settings → Database → Connection String → URI
#    Bude vypadat: postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres

# 2. Spustit náš script:
cd /Users/jirizeman/dev/edowhisper-web
./scripts/apply-migration.sh

# 3. Script se vás zeptá na connection string
# 4. Zkopírujte ho ze Supabase Dashboard
# 5. Vložte a potvrďte
# 6. ✅ Migrace se spustí automaticky
```

---

## 🔍 **Co Migrace Dělá:**

### Přidává 3 nové sloupce do `paro_records`:

1. **`human_corrections`** (JSONB)
   - Ukládá všechny opravy hygienistky
   - Struktura: `{ "fieldName": { "llm": "original", "human": "corrected" } }`

2. **`correction_count`** (INTEGER)
   - Počet polí, která hygienistka opravila
   - Používá se pro filtrování kvalitních záznamů

3. **`corrected_at`** (TIMESTAMPTZ)
   - Kdy byly provedeny opravy
   - Timestamp poslední změny

### Plus:

- ✅ **3 indexy** pro rychlé vyhledávání
- ✅ **View `fine_tuning_records`** s quality scoringem
- ✅ **Komentáře** k sloupcům pro dokumentaci

---

## ❌ **Možné Problémy:**

### Chyba: "column already exists"
```
✅ To je OK! Znamená to že sloupec už existuje.
   Migrace používá IF NOT EXISTS, takže je bezpečné ji spustit vícekrát.
```

### Chyba: "permission denied"
```
❌ Zkontrolujte že používáte správný connection string s heslem.
   Heslo najdete v: Supabase Dashboard → Settings → Database → Connection pooling
```

### Chyba: "relation paro_records does not exist"
```
❌ Tabulka paro_records neexistuje.
   To je vážný problém - zkontrolujte že jste ve správném projektu.
```

---

## 🎯 **Po Aplikaci Migrace:**

### Co Funguje:

1. ✅ Mobilní app automaticky ukládá corrections při Save
2. ✅ Web může zobrazit opravy hygienistky
3. ✅ Export API může exportovat kvalitní záznamy
4. ✅ Připraveno pro OpenAI fine-tuning

### Co Dál:

1. **Rebuild mobilní app** (aby se použil nový diff calculator)
2. **Nahrát pár testovacích záznamů**
3. **Zkontrolovat v DB** že corrections se ukládají
4. **Za týden:** První export a fine-tuning

---

## 📞 **Potřebujete Pomoc?**

Pokud něco nefunguje:

1. Zkontrolujte že jste ve **správném projektu** (EDOWhisper)
2. Zkuste **obnovit stránku** v Supabase Dashboardu
3. Zkuste spustit migraci **znovu** (je to bezpečné)
4. Zkontrolujte **Logs** v Supabase (pokud je chyba)

---

## ✅ **Checklist:**

- [ ] Otevřel jsem Supabase Dashboard
- [ ] Vybral jsem správný projekt (EDOWhisper)
- [ ] Otevřel jsem SQL Editor
- [ ] Zkopíroval jsem celý obsah add_human_corrections.sql
- [ ] Spustil jsem SQL (Run nebo Cmd+Enter)
- [ ] Viděl jsem "Success"
- [ ] Ověřil jsem nové sloupce (SELECT dotaz výše)
- [ ] Vidím 3 řádky výsledků (human_corrections, correction_count, corrected_at)
- [ ] 🎉 Hotovo!

---

**💡 Tip:** Pokud vám Supabase Dashboard přijde jednodušší, použijte ho. Script je jen alternativa pro ty, kteří preferují terminal.

