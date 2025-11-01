# 📺 TV Display - Rychlý start

## 🚀 Jak spustit na TV:

### **1. Otevři prohlížeč na TV**
```
Chrome / Edge / Firefox
```

### **2. Jdi na URL:**
```
http://localhost:3000/dashboard/tv-display
```
Nebo produkční URL:
```
https://your-domain.com/dashboard/tv-display
```

### **3. Fullscreen:**
```
Zmáčkni F11 (nebo Fn + F11)
```

### **4. Hotovo! 🎉**
Stránka se automaticky:
- ✅ Obnovuje každých 30 sekund
- ✅ Přepíná záznamy každých 10 sekund
- ✅ Zobrazuje poslední záznamy

---

## 🎨 Co uvidíš:

```
┌──────────────────────────────────────────────────────────┐
│  🦷 Dental AI Scribe          Jan Novák | 123456/1234   │
├────────────┬─────────────────────────────┬───────────────┤
│ Základní   │    🦷 ZUBNÍ KŘÍŽ 🦷       │  PBI Index    │
│ údaje      │                             │               │
│            │   18 17 16...21 22 23      │  Datum: dnes  │
│ Kuřák: Ne  │   [🦷][🦷][🦷]...[🦷][🦷]  │  Výsledek: 0.5│
│ Hygiena: ✓ │                             │               │
│            │   48 47 46...31 32 33      │  CPITN:       │
│ Anamnéza   │   [🦷][🦷][🦷]...[🦷][🦷]  │  HP:1  HL:0   │
│            │                             │  DL:2  DP:1   │
│ - Žádné    │   Legenda:                 │               │
│   alergie  │   🔴 Kaz  👑 Korunka       │  Ošetření:    │
│            │   🔧 Výplň ✕ Chybí        │               │
│ Vyšetření  │   🔴 Endodont 🔩 Implant │  - Hygiena    │
│            │                             │  - Leštění    │
│ - Kaz: Ne  │   📝 Poznámky:             │  - Fluoridace │
│ - Sliznice │   Zub 36 má korunku        │               │
└────────────┴─────────────────────────────┴───────────────┘
             ← ● ○ ○ ○ →
```

---

## ⚙️ Nastavení:

### **Přizpůsob si rychlost rotace:**

V souboru `app/dashboard/tv-display/page.tsx` na řádku ~23:

```typescript
// Změň 10000 na jiné číslo (v milisekundách)
const interval = setInterval(() => {
  setCurrentIndex((prev) => (prev + 1) % records.length);
}, 10000); // ← Tady! (10s = 10000ms)
```

**Příklady:**
- `5000` = 5 sekund
- `15000` = 15 sekund
- `30000` = 30 sekund

---

## 🎯 Tipy pro nejlepší výsledek:

### **1. Nastavení TV:**
```
✅ Režim: PC / Gaming (ne Cinema)
✅ Jas: 80-100%
✅ Kontrast: Vysoký
✅ Overscan: OFF
✅ Auto-sleep: OFF
```

### **2. Prohlížeč:**
```
✅ Vypni notifikace
✅ Vypni auto-update (nebo nastav na noc)
✅ Nastav jako homepage
✅ Zakáž sleep mode
```

### **3. Umístění TV:**
```
✅ Výška: Oční úroveň vsedě
✅ Vzdálenost: 2-3 metry
✅ Bez přímého slunce
✅ Dobré osvětlení místnosti
```

---

## 🔧 Troubleshooting:

### **Problém: Nic se nezobrazuje**
```
Řešení:
1. Zkontroluj URL (správně /dashboard/tv-display)
2. Otevři konzoli (F12) - jsou chyby?
3. Zkontroluj Supabase připojení
4. Refresh (Ctrl+R)
```

### **Problém: Nezobrazuje poslední záznamy**
```
Řešení:
1. Počkej 30s (auto-refresh)
2. Nebo manuální refresh (Ctrl+R)
3. Zkontroluj Supabase RLS politiky
```

### **Problém: Rotace nefunguje**
```
Řešení:
1. Zkontroluj, že máš více než 1 záznam
2. Otevři konzoli (F12) - jsou chyby?
3. Refresh stránky
```

### **Problém: Zubní kříž je prázdný**
```
Řešení:
1. Zkontroluj, že záznam má vyplněný dentalCross
2. V mobilu zkontroluj data
3. Otevři konzoli - loguje se dentalCross?
```

---

## 📱 Alternativní použití:

### **Tablet v ordinaci:**
```
1. Otevři na iPadu/Android tabletu
2. Landscape orientace
3. Pinned tab v prohlížeči
4. Držák na stůl
```

### **Monitor na recepci:**
```
1. Druhý monitor k PC
2. Fullscreen browser
3. Auto-start při zapnutí PC
4. Vždy aktuální přehled
```

### **Projektor na přednášky:**
```
1. Pro edukaci pacientů
2. Školení nových hygienistek
3. Prezentace výsledků
```

---

## 💡 Pro tips:

### **1. Klávesové zkratky:**
```
F11          = Fullscreen
Ctrl+R       = Refresh
←/→          = Ruční přepínání (funguje!)
Esc          = Exit fullscreen
```

### **2. Bookmark pro rychlý start:**
```
1. Ulož URL jako záložku
2. Přejmenuj na "📺 TV Display"
3. Klikni při startu
```

### **3. Auto-start při zapnutí:**

**Windows:**
```
1. Win+R
2. Napi: shell:startup
3. Vytvoř shortcut na Chrome s URL
```

**Mac:**
```
1. System Settings → Users & Groups
2. Login Items
3. Přidej Chrome s URL
```

---

## ✅ Checklist před nasazením:

```
[ ] TV je připojená k internetu
[ ] Prohlížeč je nainstalovaný
[ ] URL funguje (test v normálním okně)
[ ] Fullscreen funguje (F11)
[ ] Auto-rotate běží (počkej 10s)
[ ] Auto-refresh funguje (počkej 30s)
[ ] Barvy jsou čitelné
[ ] Fonty jsou dostatečně velké
[ ] TV má vypnutý auto-sleep
```

---

## 🎉 Hotovo!

Teď máš v ordinaci profesionální zobrazení záznamů!

**Otázky? Problémy?**
→ Otevři issue nebo kontaktuj support

---

**Verze:** 1.0  
**Datum:** 31. října 2024

