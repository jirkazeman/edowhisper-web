# 🚀 EDO Whisper - Setup Guide

## ✅ Co je hotovo

1. ✅ Projekt vytvořen s Next.js 15, TypeScript, Tailwind CSS
2. ✅ Supabase credentials nakonfigurovány v `.env.local`
3. ✅ Všechny stránky implementovány:
   - Login
   - Dashboard (Overview)
   - Záznamy pacientů (s quick-edit)
   editace záznamu pro fine tunning //dodelat
   stránka s kompletním přehledem záznamů z paro_records //dodelat
   - AI Role
   - Nastavení
4. ✅ Supabase API připojeno
5. ✅ Real-time synchronizace nastavena
6. ✅ Development server běží na http://localhost:3001

## ⚠️ Co je potřeba udělat

### 1. Spustit SQL schéma v Supabase

**DŮLEŽITÉ**: Než začneš aplikaci používat, musíš vytvořit tabulky v databázi.

1. Otevři Supabase SQL Editor:
   👉 https://supabase.com/dashboard/project/pdnishbanhiwjnpphfvl/editor

2. Klikni na "New Query"

3. Zkopíruj celý obsah souboru `supabase-schema.sql` a vlož ho do editoru

4. Klikni "Run" nebo stiskni Cmd+Enter

5. Zkontroluj, že se vytvořily tabulky:
   - `paro_records` - pro záznamy pacientů
   - `ai_roles` - pro AI role

### 2. Testování

Po spuštění SQL:

1. Otevři aplikaci: http://localhost:3001

2. Na login stránce zadej jakýkoliv email a heslo (demo mode)

3. Přejdi na "Záznamy" - měla by být prázdná tabulka

4. Přejdi na "AI Role" - měl by být prázdný seznam

5. Zkus vytvořit novou AI roli:
   - Klikni "Nová role"
   - Zadej název (např. "Parodontolog")
   - Zadej systémový prompt
   - Uloží se do Supabase!

## 🔄 Real-time synchronizace

Aplikace automaticky synchronizuje změny v reálném čase:

- Když upravíš záznam na webu, uvidíš změnu i v mobilu
- Když upravíš záznam v mobilu, uvidíš změnu i na webu
- Synchronizace běží přes Supabase Realtime WebSocket

## 📱 Co dál

### Připojení mobilní aplikace

Mobilní aplikace už má Supabase připojený, takže stačí:

1. Zkontrolovat, že mobil používá stejné Supabase URL a anon key
2. Data z mobilu by se měla automaticky zobrazit na webu
3. Data z webu by se měla automaticky zobrazit v mobilu

### Autentizace (volitelné)

Momentálně běží v demo módu. Pro skutečnou autentizaci:

1. V Supabase vytvořit uživatele
2. Upravit `app/page.tsx` - implementovat skutečný login
3. Použít správné `user_id` místo dummy hodnoty

## 🎨 Design

Design je čistý, moderní, inspirovaný Expo dashboardem:

- Světlé pozadí (#fafafa)
- Bílé karty s jemnými stíny
- Modrá primary barva pro záznamy
- Fialová accent barva pro AI funkce
- Responzivní layout

## 🛠️ Technické detaily

**Struktura:**
```
app/
├── page.tsx                    # Login
├── dashboard/
│   ├── layout.tsx             # Sidebar navigation
│   ├── page.tsx               # Overview
│   ├── records/page.tsx       # Záznamy s quick-edit
│   ├── ai-roles/page.tsx      # AI Role management
│   └── settings/page.tsx      # Nastavení
lib/
├── supabase.ts                # Supabase client
├── types.ts                   # TypeScript typy
├── api.ts                     # API funkce (CRUD)
└── realtime.ts                # Real-time subscriptions
```

**Features:**
- ✅ Quick edit v tabulce (inline editing)
- ✅ Real-time sync mezi zařízeními
- ✅ Vyhledávání záznamů
- ✅ CRUD operace pro AI role
- ✅ Kontrola velikosti písma
- ✅ Responzivní design

## 📝 Poznámky

- Server běží na portu 3001 (3000 byl obsazený)
- SQL schéma obsahuje RLS policies pro bezpečnost
- Realtime je povolený pro obě tabulky
- Demo mode umožňuje přihlášení bez autentizace
