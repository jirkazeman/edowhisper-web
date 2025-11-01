# 🎯 Fine-Tuning AI - Průvodce pro hygienistky

Jednoduchý návod, jak hodnotit AI výstupy a zlepšovat systém.

---

## 🤔 Proč hodnotíme AI?

Každé vaše hodnocení pomáhá AI učit se lépe vyplňovat záznamy.

**Představte si:**
- 🎯 AI, která dělá **méně chyb**
- ⏱️ **Méně času** stráveného opravami
- ✅ **Přesnější** záznamy hned napoprvé

**Jak?** Porovnáváme, co AI napsal vs. co jste opravili → AI se učí!

---

## 📱 Jak hodnotit (krok za krokem)

### Krok 1: Otevřete záznam

Klikněte na jakýkoliv záznam v seznamu.

```
/dashboard/records → Vyberte záznam
```

### Krok 2: Najděte modrý box

Pokud záznam byl vytvořen pomocí AI, uvidíte **modrý box** s názvem:

```
┌──────────────────────────────────────────┐
│ 🤖 Hodnocení AI výstupu pro Fine-Tuning │
│                                          │
│ Kvalita AI výstupu (1-5 hvězdiček)      │
│ ⭐⭐⭐⭐⭐                                    │
└──────────────────────────────────────────┘
```

### Krok 3: Klikněte na hvězdičky

Vyberte, jak kvalitní byl původní AI výstup:

| Hodnocení | Popis | Kdy použít |
|-----------|-------|------------|
| ⭐ | **Velmi špatné** | Museli jste úplně přepsat celý záznam |
| ⭐⭐ | **Špatné** | Hodně chyb, chybí důležité informace |
| ⭐⭐⭐ | **Průměrné** | Několik chyb, potřebovalo úpravy |
| ⭐⭐⭐⭐ | **Dobré** | Jen drobné úpravy |
| ⭐⭐⭐⭐⭐ | **Vynikající** | Téměř perfektní, žádné nebo minimální úpravy |

### Krok 4: Přidejte zpětnou vazbu (důležité!)

Do textového pole napište, **co bylo špatně** nebo **co chybělo**.

#### ✅ Příklad DOBRÉ zpětné vazby:

```
AI správně identifikovala gingivitidu a uvedla PBI 65%.
Chybělo však konkrétní doporučení čistící techniky.
Správně by měla zmínit techniku Bass a frekvenci čištění 2× denně.
```

#### ❌ Příklad ŠPATNÉ zpětné vazby:

```
Špatné.
```
```
Chyby.
```

**Proč je detailní zpětná vazba důležitá?**
- AI se z ní učí konkrétní věci
- Pomáhá identifikovat opakující se problémy
- Zlepšuje kvalitu budoucích výstupů

### Krok 5: Uložte hodnocení

Klikněte na **"Uložit hodnocení"**.

Hotovo! ✅

---

## 💡 Tipy pro správné hodnocení

### ✅ CO hodnotit:

1. **Přesnost údajů**
   - Správné hodnoty PBI, CPITN?
   - Správná čísla a údaje?

2. **Úplnost**
   - Nezapomněla AI něco důležitého?
   - Jsou tam všechny nálezy?

3. **Odbornost**
   - Správná terminologie?
   - Profesionální formulace?

4. **Logika**
   - Dává diagnóza smysl?
   - Odpovídá léčebný plán nálezům?

### ❌ CO NEhodnotit:

- ❌ Vaše vlastní chyby při dikování
- ❌ Špatná kvalita audio nahrávky
- ❌ Technické problémy aplikace

---

## 📊 Příklady hodnocení

### Příklad 1: ⭐⭐⭐⭐⭐ (Vynikající)

**Co AI udělala:**
```
Pacient: Jan Novák, 35 let
PBI: 65%
CPITN: Sextant 1-6 = 3,3,2,3,3,2
Diagnóza: Generalizovaná chronická gingivitida středního stupně
Doporučení: Profesionální hygiena, instruktáž techniky Bass...
```

**Vaše úpravy:** Žádné nebo minimální

**Zpětná vazba:**
```
Vynikající výstup, všechny údaje správné, diagnóza přesná,
doporučení konkrétní a relevantní. Žádné úpravy nebyly potřeba.
```

---

### Příklad 2: ⭐⭐⭐ (Průměrné)

**Co AI udělala:**
```
Pacient: Marie Svobodová
PBI: Vysoká hodnota
Dásně: Červené
Doporučení: Zlepšit hygienu
```

**Vaše úpravy:**
```
PBI: 65% (přidali jste konkrétní číslo)
Dásně: Červené, edematózní, s krvácením (doplnili jste detail)
Doporučení: Profesionální hygiena, instruktáž Bass techniky,
            kontrol za 14 dní (konkretizovali jste)
```

**Zpětná vazba:**
```
AI správně identifikovala hlavní problémy, ale použila obecné
formulace. Chyběly konkrétní číselné hodnoty PBI a detailní
popis dásní. Doporučení byla příliš vágní, měla by být
specifičtější s časovým plánem.
```

---

### Příklad 3: ⭐ (Velmi špatné)

**Co AI udělala:**
```
Pacient má zuby. Nějaké problémy s dásněmi.
```

**Vaše úpravy:** Kompletně přepsáno

**Zpětná vazba:**
```
Zcela nevyhovující výstup. AI nezachytila žádné konkrétní
údaje z vyšetření. Chyběly všechny důležité informace:
jméno, hodnoty PBI/CPITN, stav jednotlivých sextantů,
diagnóza, léčebný plán. Muselo být kompletně přepsáno ručně.
```

---

## 📈 Sledování pokroku

### Kolik hodnocení už máme?

Zeptejte se svého IT týmu nebo zkontrolujte v Supabase:

```sql
SELECT COUNT(*) FROM paro_records WHERE quality_rating IS NOT NULL;
```

### Cíl:
- ✅ **200+ hodnocení** pro první fine-tuning
- ✅ **500+ hodnocení** pro skvělé výsledky

---

## 🎯 Co se stane s hodnocením?

1. **Hodnotíte záznamy** ⭐⭐⭐⭐
2. **Systém sbírá data** 📊
3. **Po 200+ hodnoceních** → Spustíme fine-tuning
4. **AI se zlepší** 🤖✨
5. **Méně práce pro vás!** ⏱️💚

---

## ❓ Časté otázky

### Jak dlouho to trvá?

- **Hodnocení 1 záznamu:** ~1-2 minuty
- **Pro užitečná data:** Hodnoťte průběžně při práci

### Musím hodnotit všechny záznamy?

Ne! 

- **První 2 týdny:** Ideálně všechny (nebo většinu)
- **Poté:** 20-30% náhodně vybraných

### Co když si nejsem jistá hodnocením?

- Raději hodnoťte o hvězdičku níž
- Popište v zpětné vazbě, co vás trápilo
- Konzultujte s kolegyněmi

### Můžu změnit hodnocení?

Ano, jednoduše otevřete záznam a ohodnoťte znovu.

### Vidí někdo moje zpětné vazby?

- IT tým (pro zlepšování AI)
- Nikdo jiný nemá přístup
- Používá se jen pro trénování AI

---

## 🆘 Pomoc

### Nevidím modrý box s hodnocením

**Možné důvody:**
- Záznam nebyl vytvořen pomocí AI
- Chybí technická integrace (řekněte IT)

### Tlačítko "Uložit" nefunguje

**Zkuste:**
1. Zkontrolovat, že jste vybrali hodnocení (hvězdičky)
2. Obnovit stránku
3. Kontaktovat IT podporu

### Mám nápad na zlepšení

Super! Dejte vědět vašemu IT týmu. 💡

---

## 🏆 Motivace

### Vaše hodnocení pomáhá:

1. **Vám samotným**
   - Méně oprav v budoucnu
   - Kvalitnější záznamy
   - Úspora času

2. **Celému týmu**
   - Lepší AI pro všechny
   - Standardizace záznamů
   - Rychlejší workflow

3. **Pacientům**
   - Přesnější dokumentace
   - Lepší péče

---

## ✨ Děkujeme!

Každé hodnocení posouvá náš systém dopředu. 

**Jste součástí něčeho velkého!** 🚀

---

**Máte otázky?** Ptejte se vašeho IT týmu nebo kolegyň! 💬

