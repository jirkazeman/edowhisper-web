# 📺 TV Display - Přehled vyšetření pro ordinaci

**URL:** `/dashboard/tv-display`  
**Účel:** Zobrazení záznamů vyšetření na TV v ordinaci

---

## 🎯 Funkce:

### **Layout - 3 sloupce:**

```
┌─────────────────────────────────────────────────────────────┐
│  Header - Pacient, RČ                                      │
├──────────┬──────────────────────────────────┬──────────────┤
│          │                                  │              │
│  Levý    │       Zubní kříž (VELKÝ)       │    Pravý     │
│  sloupec │                                  │   sloupec    │
│          │                                  │              │
│  - Údaje │        32 zubů FDI              │  - PBI       │
│  - Anam. │                                  │  - CPITN     │
│  - Vyš.  │        Legenda                  │  - Ošetření  │
│          │                                  │              │
└──────────┴──────────────────────────────────┴──────────────┘
```

---

## ✨ Klíčové vlastnosti:

### **1. Automatická rotace:**
- Každých **10 sekund** se přepne na další záznam
- Plynulý přechod mezi pacienty
- Zobrazuje posledních 10 záznamů

### **2. Auto-refresh:**
- Každých **30 sekund** aktualizuje data z DB
- Vždy aktuální informace

### **3. Optimalizace pro TV:**
- **Velké fonty** - čitelné z dálky
- **Kontrastní barvy** - dobrá viditelnost
- **Zubní kříž uprostřed** - 60% šířky
- **Minimální scrollování** - vše viditelné najednou

### **4. Barevné kódování:**
- 🔴 **Kaz** - červená
- 👑 **Korunka** - žlutá
- 🔧 **Výplň** - modrá
- ✕ **Chybí** - šedá
- 🔴 **Endodont** - fialová
- 🔩 **Implantát** - zelená

---

## 📐 Rozložení:

### **Levý sloupec (25%):**
- ✅ Základní údaje (kuřák, hygiena, dásně, kámen)
- ✅ Anamnéza (všeobecná, alergie, stomatolog., medikace)
- ✅ Vyšetření (kaz, sliznice, jazyk, okluze...)

### **Střední sloupec (50% - HLAVNÍ):**
- ✅ **Zubní kříž** - 32 zubů v FDI notaci
- ✅ Horní řada: 18-11, 21-28
- ✅ Dolní řada: 48-41, 31-38
- ✅ Barevné označení stavů
- ✅ Ikony pro rychlou identifikaci
- ✅ Legenda dole

### **Pravý sloupec (25%):**
- ✅ PBI index (datum, výsledek, pomůcky)
- ✅ CPITN (4 kvadranty s barevným hodnocením)
- ✅ Záznam o ošetření

---

## 🎨 Design:

### **Barvy - podle sekce:**
- 🔵 **Modrá** - Základní údaje
- 🟢 **Zelená** - Anamnéza
- 🟣 **Fialová** - Vyšetření
- 🟠 **Oranžová** - PBI
- 🔷 **Tyrkysová** - CPITN
- 🟦 **Indigo** - Ošetření

### **Karty:**
- Zaoblené rohy (`rounded-2xl`)
- Jemný stín (`shadow-lg`)
- Barevný border podle typu

### **Header:**
- Gradient modrá → tmavě modrá
- Logo vlevo, pacient vpravo
- Bílý text, dobře čitelný

---

## 🔄 Navigace:

### **Automatická:**
- ⏰ 10s na jeden záznam
- 🔄 Nekonečná smyčka

### **Manuální:**
- ← → Šipky pro přepínání
- Tečky indikátory (jako carousel)
- Kliknutím na tečku = přechod na záznam

---

## 📱 Responsive:

**Optimalizováno pro:**
- 📺 **TV (1920x1080)** - hlavní use case
- 💻 **Desktop (1440p+)** - také funguje
- 📱 **Mobile** - ne optimalizováno (není účel)

---

## 🔐 Přístup:

**URL:** `https://yourdomain.com/dashboard/tv-display`

**Doporučení:**
1. Otevři v Chrome/Edge na TV
2. Zmáčkni **F11** (fullscreen)
3. Nech běžet 24/7
4. Auto-refresh zajistí aktuální data

---

## 🚀 Použití:

### **1. Základní:**
```
1. Jdi na /dashboard/tv-display
2. Fullscreen (F11)
3. Nech běžet
```

### **2. S URL parametry (budoucnost):**
```
/dashboard/tv-display?user=hygienist1
/dashboard/tv-display?limit=5
/dashboard/tv-display?interval=15
```

---

## 🔧 Konfigurace:

### **V kódu můžeš změnit:**

```typescript
// Auto-rotate interval (ms)
const ROTATE_INTERVAL = 10000; // 10s

// Refresh interval (ms)
const REFRESH_INTERVAL = 30000; // 30s

// Počet zobrazených záznamů
const RECORD_LIMIT = 10;
```

---

## 🎯 Use cases:

### **1. Čekárna:**
- Pacient vidí svůj záznam
- Transparentnost ošetření
- Edukace pacienta

### **2. Ordinace:**
- Hygienistka vidí aktuální stav
- Rychlý přehled bez otevírání app
- Velký zubní kříž pro přesnost

### **3. Konzultace:**
- Sdílený pohled lékař + pacient
- Vysvětlení nálezu
- Plánování ošetření

---

## 📊 Data flow:

```
Supabase DB
    ↓
Fetch každých 30s
    ↓
10 nejnovějších záznamů
    ↓
Rotace každých 10s
    ↓
Zobrazení na TV
```

---

## ✅ Výhody:

1. ✅ **Velký zubní kříž** - 50% plochy
2. ✅ **Přehledné** - 3 sloupce, jasná struktura
3. ✅ **Barevné** - rychlá identifikace
4. ✅ **Automatické** - žádné klikání
5. ✅ **Aktuální** - real-time data
6. ✅ **Profesionální** - moderní design
7. ✅ **Čitelné** - velké fonty

---

## 🔮 Budoucí vylepšení:

### **Verze 2.0:**
- [ ] QR kód pro pacientský přístup
- [ ] Filtrování podle hygienistky
- [ ] Export do PDF jedním kliknutím
- [ ] Fotografie z záznamu
- [ ] 3D zubní model
- [ ] Statistiky ordinace

### **Interaktivita:**
- [ ] Touch ovládání na tablet
- [ ] Hlasové ovládání
- [ ] Gesta pro zoom
- [ ] Poznámky stylus

---

**Verze:** 1.0  
**Datum:** 31. října 2024  
**Status:** ✅ Připraveno k použití


