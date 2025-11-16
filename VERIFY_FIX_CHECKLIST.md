# ✅ Checklist pro opravu "Ověřit" tlačítka

## 🔍 **Problém:**
```
❌ Nepodařilo se změnit stav ověření
```

---

## 📋 **Co zkontrolovat:**

### 1️⃣ **Byla aplikována migrace?**

**Otevři Supabase SQL Editor** a spusť:

```sql
-- Zkontroluj jestli sloupce existují:
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'paro_records' 
AND column_name IN ('verified_by_hygienist', 'verified_at', 'verified_by')
ORDER BY column_name;
```

**Očekávaný výsledek:**
```
| column_name              | data_type                   | is_nullable |
|--------------------------|----------------------------|-------------|
| verified_at              | timestamp with time zone    | YES         |
| verified_by              | uuid                        | YES         |
| verified_by_hygienist    | boolean                     | YES         |
```

**Pokud NEJSOU sloupce:**
```sql
-- Spusť migraci:
ALTER TABLE paro_records 
  ADD COLUMN IF NOT EXISTS verified_by_hygienist BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
```

---

### 2️⃣ **Je nastavený SUPABASE_SERVICE_ROLE_KEY?**

**Zkontroluj `.env.local`:**

```bash
cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY
```

**Mělo by být:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Pokud chybí:**
1. Otevři [Supabase Dashboard](https://supabase.com/dashboard)
2. Project Settings → API
3. Zkopíruj **service_role key** (secret)
4. Přidej do `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=tvuj_service_role_key_zde
```
5. Restart dev serveru:
```bash
npm run dev
```

---

### 3️⃣ **Jsou správná RLS pravidla?**

**Zkontroluj RLS policy v Supabase:**

```sql
-- Zobraz všechny policies na paro_records:
SELECT 
  policyname, 
  cmd, 
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'paro_records';
```

**Mělo by být něco jako:**
```sql
-- Policy pro UPDATE:
CREATE POLICY "Users can update own records"
ON paro_records
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Pokud chybí, přidej:**
```sql
-- Enable RLS:
ALTER TABLE paro_records ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own records:
CREATE POLICY "Users can update own records"
ON paro_records
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own records:
CREATE POLICY "Users can view own records"
ON paro_records
FOR SELECT
USING (auth.uid() = user_id);
```

---

### 4️⃣ **Je user přihlášený?**

**Otevři browser console (F12) a zkontroluj:**

```javascript
// V console:
localStorage.getItem('sb-' + 'YOUR_PROJECT_ID' + '-auth-token')
```

**Mělo by vrátit:** JSON s `access_token`

**Pokud ne:**
- Odhlásit se a znovu přihlásit
- Vymazat cookies a localStorage
- Zkusit jiný browser

---

## 🔧 **Oprava API endpointu**

API endpoint byl aktualizován s těmito změnami:

### ✅ **Co bylo opraveno:**

1. **Autentizace přes cookie token**
   - Extrahuje `access_token` z cookie
   - Vytváří dva Supabase klienty (admin + user)

2. **Service role pro update**
   - Používá `supabaseAdmin` pro update (bypasses RLS)
   - Stále kontroluje `user_id` ownership

3. **Lepší error messages**
   - `console.error()` pro debugging
   - Detailnější error responses

---

## 🚀 **Testování:**

### 1. Build a deploy:
```bash
cd /Users/jirizeman/dev/edowhisper-web
npm run build
git add -A
git commit -m "fix: API endpoint pro verification s cookie auth"
git push origin main
```

### 2. Počkej na Vercel deployment (~2 min)

### 3. Testuj:
1. Otevři záznam
2. Klikni "✅ Ověřit"
3. Mělo by:
   - Zobrazit confirm dialog
   - Uložit změnu
   - Zobrazit zelený badge
   - Alert: "✅ Záznam ověřen..."

---

## 📊 **Debugging v production:**

**Zkontroluj Vercel logs:**
```
https://vercel.com/dashboard → Deployments → Logs
```

**Hledej:**
- `Error updating verification status:`
- `Fetch error:`
- `Unauthorized`

**Častá chyba:**
```
column "verified_by_hygienist" does not exist
```
→ Migrace nebyla aplikována!

---

## ✅ **Po opravě ověř:**

```sql
-- Zkontroluj že update funguje:
SELECT 
  id,
  verified_by_hygienist,
  verified_at,
  verified_by
FROM paro_records
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;
```

---

**Vytvořeno:** 16.11.2025  
**Poslední update:** 16.11.2025

