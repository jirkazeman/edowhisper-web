# 📱 Realtime Notifikace - Setup Guide

## 🎯 Co to dělá?

Propojuje **web app** (edowhisper-web) a **mobilní app** (EDOWhisper) pomocí Supabase Realtime.

**Use case:**
1. Hygienistka otevře záznam na PC
2. Klikne "📱 Odeslat do telefonu"
3. Mobilní app dostane notifikaci a otevře záznam

---

## 🗄️ Databázové schéma

### Tabulka: `record_notifications`

```sql
CREATE TABLE record_notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  record_id UUID REFERENCES paro_records(id),
  action VARCHAR(50) DEFAULT 'open_record',
  opened_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Sloupce:**
- `user_id` - Kdo má otevřít záznam (hygienistka)
- `record_id` - Který záznam otevřít
- `action` - Typ akce (`open_record`, `edit_record`, atd.)
- `opened_at` - Kdy byla notifikace otevřena (NULL = nepřečtená)
- `created_at` - Kdy byla vytvořena

---

## 🚀 Instalace

### 1️⃣ **Spusť SQL migraci v Supabase:**

```bash
# V Supabase Dashboard → SQL Editor
# Zkopíruj obsah: supabase/migrations/create_record_notifications.sql
# Nebo použij Supabase CLI:
supabase db push
```

### 2️⃣ **Ověř, že Realtime je zapnutý:**

V Supabase Dashboard:
1. Jdi na **Database** → **Publications**
2. Zkontroluj, že `supabase_realtime` obsahuje tabulku `record_notifications`

---

## 📱 Web App (edowhisper-web)

### Poslání notifikace:

```tsx
import { supabase } from '@/lib/supabase';

const sendToPhone = async (recordId: string) => {
  const { data, error } = await supabase
    .from('record_notifications')
    .insert({
      user_id: user.id,
      record_id: recordId,
      action: 'open_record'
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Chyba při odesílání notifikace:', error);
    return;
  }
  
  console.log('✅ Notifikace odeslána:', data);
};
```

---

## 📲 Mobilní App (EDOWhisper)

### 1️⃣ **Realtime Listener (když je app otevřená):**

```tsx
import { supabase } from './services/supabaseService';

useEffect(() => {
  const channel = supabase
    .channel('record_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'record_notifications',
        filter: `user_id=eq.${user.id}`
      },
      async (payload) => {
        console.log('🔔 Nová notifikace:', payload);
        
        const { record_id, id } = payload.new;
        
        // Označ jako otevřenou
        await supabase.rpc('mark_notification_as_opened', {
          notification_id: id
        });
        
        // Otevři záznam
        await loadAndOpenRecord(record_id);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id]);
```

### 2️⃣ **Kontrola nepřečtených notifikací (při startu app):**

```tsx
const checkPendingNotifications = async () => {
  const { data, error } = await supabase
    .from('record_notifications')
    .select('*')
    .eq('user_id', user.id)
    .is('opened_at', null)
    .order('created_at', { ascending: false });
  
  if (error || !data?.length) return;
  
  // Zobraz alert
  Alert.alert(
    '📋 Nové záznamy',
    `Máte ${data.length} nových záznamů k otevření`,
    [
      { text: 'Později', style: 'cancel' },
      {
        text: 'Otevřít',
        onPress: async () => {
          // Označ jako otevřenou
          await supabase.rpc('mark_notification_as_opened', {
            notification_id: data[0].id
          });
          
          // Otevři záznam
          await loadAndOpenRecord(data[0].record_id);
        }
      }
    ]
  );
};

// Zavolej při startu app
useEffect(() => {
  if (user) {
    checkPendingNotifications();
  }
}, [user]);
```

---

## 🧪 Testování

### 1️⃣ **Manuální test v SQL Editoru:**

```sql
-- Vytvoř testovací notifikaci
INSERT INTO record_notifications (user_id, record_id, action)
VALUES (
  'user-uuid-zde',
  'record-uuid-zde',
  'open_record'
);

-- Zkontroluj nepřečtené notifikace
SELECT * FROM record_notifications
WHERE user_id = 'user-uuid-zde'
  AND opened_at IS NULL;
```

### 2️⃣ **Test v aplikaci:**

1. Otevři záznam na PC (web app)
2. Klikni "📱 Odeslat do telefonu"
3. Otevři mobilní app
4. Měl by se objevit alert s novým záznamem

---

## 📊 Monitoring

### Nepřečtené notifikace:

```sql
SELECT 
  u.email,
  COUNT(*) as unread_count
FROM record_notifications rn
JOIN auth.users u ON u.id = rn.user_id
WHERE rn.opened_at IS NULL
GROUP BY u.email;
```

### Statistiky:

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  COUNT(opened_at) as opened,
  COUNT(*) - COUNT(opened_at) as pending
FROM record_notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🔧 Troubleshooting

### ❌ "Notifikace nepřichází"

1. Zkontroluj RLS politiky:
```sql
SELECT * FROM record_notifications WHERE user_id = 'your-user-id';
```

2. Zkontroluj Realtime publikaci:
```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

3. Zkontroluj channel subscription v mobilní app (console.log)

### ❌ "App neotevírá záznam"

- Zkontroluj, že `loadAndOpenRecord()` funguje správně
- Zkontroluj console.log v mobilní app

---

## 💰 Cena

- **Supabase Realtime:** FREE tier (2M messages/měsíc)
- **Pro tvůj use case:** ~3,000 messages/měsíc
- **→ ZDARMA!** ✅

---

## 🔙 Rollback

Pokud potřebuješ vrátit změny:

```bash
# Smaž tabulku
DROP TABLE record_notifications CASCADE;

# Nebo se vrať na checkpoint tag
git checkout v1.0-realtime-checkpoint
```

