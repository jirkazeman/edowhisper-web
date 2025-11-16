# 📋 Hygienist Verification Workflow

## 🎯 Účel
Nový jednoduchý workflow pro učení LLM modelu. Hygienistka opraví záznam a označí ho jako "100% správný" pro trénink.

---

## 🔄 Workflow

### 1️⃣ **Otevřít záznam**
- Dashboard → Záznamy → Klikni na záznam

### 2️⃣ **Zkontrolovat a opravit pole**
- Klikni do pole s **červeným/oranžovým borderem** (nízká confidence)
- Oprav chyby přímo v poli
- Když opustíš pole (Tab/Enter), automaticky se uloží

### 3️⃣ **Ověřit záznam**
- Když je vše správně, klikni **"✅ Ověřit"** v pravém horním rohu
- Potvrdíš, že záznam je **100% správný**
- Záznam se označí jako **verified**

### 4️⃣ **Záznam je připraven pro LLM**
- Zelený badge **"✅ Ověřeno"** + datum
- Záznam bude použit pro **fine-tuning**

---

## ✅ Co znamená "Ověřeno"?

| Stav | Popis | Použití |
|------|-------|---------|
| ❌ Neověřeno | Draft, může obsahovat chyby | ❌ NENÍ použito pro trénink |
| ✅ Ověřeno | 100% správný, zkontrolováno hygienistkou | ✅ JE použito pro trénink LLM |

---

## 🗄️ Databáze

### Nové sloupce v `paro_records`:

```sql
verified_by_hygienist BOOLEAN DEFAULT false
verified_at TIMESTAMPTZ
verified_by UUID (user_id)
```

### View pro export:

```sql
SELECT * FROM verified_records_for_training
-- Obsahuje POUZE ověřené záznamy
```

---

## 🔧 Jak aplikovat migraci?

### Metoda 1: Supabase Dashboard (doporučeno)
1. Otevři [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor → New query
3. Zkopíruj obsah `supabase/migrations/add_verification_flags.sql`
4. Run

### Metoda 2: psql
```bash
psql "postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres" \
  -f supabase/migrations/add_verification_flags.sql
```

---

## 📊 Export pro fine-tuning

### Filtr v API:

```typescript
// /api/fine-tuning/export/route.ts
const { data, error } = await supabase
  .from('paro_records')
  .select('*')
  .eq('verified_by_hygienist', true)  // ← POUZE ověřené
  .eq('deleted', false);
```

### View:

```sql
SELECT * FROM verified_records_for_training
WHERE verified_at > '2025-01-01'
ORDER BY verified_at DESC;
```

---

## 🎨 UI

### Header tlačítko:

```
┌─────────────────────────────────────┐
│ [← Zpět]  Jana Nováková    [✅ Ověřit] │
└─────────────────────────────────────┘
```

### Po ověření:

```
┌─────────────────────────────────────┐
│ [← Zpět]  Jana Nováková    [✅ Ověřeno 16.11.2025] [❌] │
└─────────────────────────────────────┘
```

---

## 🚀 Výhody

✅ **Jednoduchý workflow** - oprav → ověř → hotovo
✅ **Jasný stav** - víš co je verified / draft
✅ **Kvalitní data** - 100% správné pro trénink
✅ **Plná kontrola** - hygienistka rozhoduje
✅ **Možnost odvolat** - odebrání ověření (❌)

---

## 📝 Příklad použití

### 1. Draft záznam (neověřeno):
```json
{
  "lastName": "Novák",
  "verified_by_hygienist": false,
  "verified_at": null
}
```

### 2. Po ověření hygienistkou:
```json
{
  "lastName": "Novák",
  "verified_by_hygienist": true,
  "verified_at": "2025-11-16T10:30:00Z",
  "verified_by": "uuid-hygienistky"
}
```

### 3. Export pro fine-tuning:
```bash
GET /api/fine-tuning/export
→ Vrátí POUZE záznamy s verified_by_hygienist = true
```

---

## 🔒 Bezpečnost

- ✅ Ověřit může pouze **přihlášený uživatel**
- ✅ Pouze **vlastní záznamy** (user_id check)
- ✅ **Service role key** pro auth
- ✅ RLS policy v Supabase

---

## 📚 Další kroky

1. ✅ Aplikovat migraci (`add_verification_flags.sql`)
2. ✅ Otestovat UI (ověřit/odebrat ověření)
3. ✅ Zkontrolovat export (`/api/fine-tuning/export`)
4. 🚀 Začít ověřovat záznamy!
5. 📊 Exportovat data pro fine-tuning
6. 🤖 Natrénovat lepší LLM model

---

## ❓ FAQ

**Q: Musím ověřit každý záznam?**
A: Ne! Ověř pouze ty, které jsou 100% správné. Neověřené záznamy nebudou použity pro trénink.

**Q: Mohu odebrat ověření?**
A: Ano, klikni na ❌ vedle zeleného badge.

**Q: Co když opravím pole po ověření?**
A: Ověření zůstane, ale doporučujeme ho odebrat a znovu ověřit.

**Q: Kolik záznamů potřebuji pro fine-tuning?**
A: OpenAI doporučuje **50-100** kvalitních příkladů pro dobré výsledky.

---

**Vytvořeno:** 16.11.2025
**Autor:** AI Assistant
**Verze:** 1.0.0

