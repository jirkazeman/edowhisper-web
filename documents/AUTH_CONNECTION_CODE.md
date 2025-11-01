# 🔐 EDO Whisper - Kód pro připojení a autentizaci

## 📋 Kompletní konfigurační soubory

### 1️⃣ `.env.local` (Environment Variables)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pdnishbanhiwjnpphfvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbmlzaGJhbmhpd2pucHBoZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzc5MzUsImV4cCI6MjA3NjkxMzkzNX0.z4JecCJ2y8zJtH0nRoTw_JmfLITrQ6MNFxOAicsaTKA

# Service Role Key (for admin access - bypasses RLS)
# ⚠️ NEVER expose this in client-side code!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbmlzaGJhbmhpd2pucHBoZnZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMzNzkzNSwiZXhwIjoyMDc2OTEzOTM1fQ.UKp3iKR_lBbC9xMIWupiT3fihtLv4DzPReDhrXOEGNU
```

---

## 🔧 Supabase Klienti

### 2️⃣ `lib/supabase.ts` (Supabase Clients)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Client for user authentication (uses anon key + RLS)
// Use this in client-side components for auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Admin client for server-side operations (bypasses RLS)
// ⚠️ ONLY use in API routes or server components!
// NEVER import this in client components!
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

---

## 🔐 Autentizace (Auth Context)

### 3️⃣ `lib/auth-context.tsx` (Authentication Provider)

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    setUser(data.user);
    router.push("/dashboard");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 🌐 API Routes (Server-side s Service Role)

### 4️⃣ `app/api/records/route.ts` (Get All Records)

```typescript
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("paro_records")
      .select("*")
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching records:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error in GET /api/records:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 📱 Použití v Client Components

### 5️⃣ Příklad: Načtení dat z API route

```typescript
"use client";

import { useState, useEffect } from "react";
import type { ParoRecord } from "@/lib/types";

export default function RecordsPage() {
  const [records, setRecords] = useState<ParoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecords() {
      try {
        // Volání API route (ne přímý Supabase!)
        const response = await fetch("/api/records");
        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setRecords(result.data || []);
      } catch (error) {
        console.error("Failed to load records:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Načítání...</p>
      ) : (
        <ul>
          {records.map((record) => (
            <li key={record.id}>
              {record.form_data?.lastName} - {record.form_data?.personalIdNumber}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🔑 Jak se přihlásit

### Varianta A: Přihlášení přes UI

1. Otevři: `http://localhost:3000`
2. Zadej email a heslo z Supabase Auth
3. Klikni "Přihlásit se"

### Varianta B: Vytvoření uživatele v Supabase

```sql
-- Spusť v Supabase SQL Editor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'tvuj@email.cz',  -- ✏️ ZMĚŇ
  crypt('tvojeHeslo123', gen_salt('bf')),  -- ✏️ ZMĚŇ
  NOW(),
  NOW(),
  NOW()
);
```

### Varianta C: Supabase Dashboard

1. Jdi na: https://supabase.com/dashboard/project/pdnishbanhiwjnpphfvl/auth/users
2. Klikni "Add user" → "Create new user"
3. Zadej email a heslo
4. Použij tyto údaje pro přihlášení

---

## 🧪 Testování připojení

### Test 1: Zkontrolovat připojení (Terminal)

```bash
npx tsx scripts/test-service-role.ts
```

### Test 2: Přímo z kódu

```typescript
import { supabaseAdmin } from "@/lib/supabase";

async function testConnection() {
  const { data, error } = await supabaseAdmin
    .from("paro_records")
    .select("*")
    .limit(1);

  if (error) {
    console.error("❌ Connection failed:", error);
  } else {
    console.log("✅ Connected! Sample record:", data[0]);
  }
}

testConnection();
```

---

## 📊 Databázové informace

**Supabase Project ID:** `pdnishbanhiwjnpphfvl`
**URL:** `https://pdnishbanhiwjnpphfvl.supabase.co`

**Tabulky:**
- `paro_records` - Záznamy pacientů
- `llm_feedback` - LLM feedback (pro admin panel)

**Aktuální data:**
- 13 celkových záznamů
- 4 aktivní (deleted=false)
- 9 smazané (deleted=true)

---

## ⚠️ Bezpečnostní poznámky

1. **Service Role Key:**
   - ✅ Používej POUZE v API routes nebo server components
   - ❌ NIKDY v client-side kódu
   - ✅ Obchází RLS polícy (vidí všechna data)

2. **Anon Key:**
   - ✅ Bezpečné pro client-side
   - ✅ Respektuje RLS polícy
   - ✅ Použij pro autentizaci uživatelů

3. **RLS Polícy:**
   - Admin panel používá service_role → vidí všechna data
   - Běžní uživatelé používají anon_key → vidí jen svá data

---

## 🚀 Spuštění aplikace

```bash
# 1. Ujisti se, že máš .env.local s klíči
cat .env.local

# 2. Nainstaluj závislosti (pokud ještě nejsou)
npm install

# 3. Spusť dev server
npm run dev

# 4. Otevři prohlížeč
open http://localhost:3000
```

---

## 📝 Shrnutí

**Co potřebuješ:**
1. `.env.local` s 3 klíči (URL, ANON_KEY, SERVICE_ROLE_KEY)
2. `lib/supabase.ts` s 2 klienty (supabase, supabaseAdmin)
3. `lib/auth-context.tsx` pro autentizaci
4. API routes používající `supabaseAdmin`
5. Client components volající API routes (ne přímý Supabase)

**Aktuální stav:**
- ✅ Service role key nakonfigurován
- ✅ Admin klient vytvořen
- ✅ API routes fungují
- ✅ Aplikace vidí všechna data (4 aktivní záznamy)
- ✅ Autentizace funguje

**Pro přihlášení:**
- Vytvoř uživatele v Supabase Dashboard
- Nebo použij SQL insert
- Přihlaš se na http://localhost:3000
