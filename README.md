# 🦷 EDO Whisper Web

Web aplikace pro parodontální záznamy s AI asistencí.

---

## 📚 Dokumentace

### 🚀 Quick Start

- **[Instalace Fine-Tuning systému](./documents/INSTALACE_FINE_TUNING.md)** - Start zde pro zprovoznění hodnocení AI

### Pro vývojáře

- **[Setup Guide](./documents/SETUP.md)** - Základní nastavení projektu
- **[Auth Setup](./documents/AUTH_SETUP.md)** - Nastavení autentizace
- **[Auth Connection Code](./documents/AUTH_CONNECTION_CODE.md)** - Kód pro připojení auth

### Fine-Tuning systém

- **[Fine-Tuning Overview](./documents/README_FINE_TUNING.md)** - Hlavní přehled systému
- **[Quick Start](./documents/FINE_TUNING_QUICKSTART.md)** - 5 kroků k spuštění
- **[Kompletní průvodce](./documents/FINE_TUNING_GUIDE.md)** - Detailní dokumentace
- **[Integrace](./documents/INTEGRATION_EXAMPLE.md)** - Příklady kódu
- **[SQL Queries](./documents/SQL_QUERIES.md)** - Užitečné databázové dotazy
- **[Struktura projektu](./documents/PROJECT_STRUCTURE.md)** - Přehled souborů
- **[Summary](./documents/SUMMARY.md)** - Shrnutí implementace

### Pro hygienistky

- **[Návod k hodnocení AI](./documents/FINE_TUNING_CZ.md)** - Jednoduchý návod v češtině

---

## 🏗️ Struktura projektu

```
edowhisper-web/
├── app/                    # Next.js aplikace
│   ├── api/               # API routes
│   └── dashboard/         # Dashboard stránky
├── lib/                   # Utility funkce
├── documents/             # 📖 Dokumentace
├── migrations/            # SQL migrace
└── scripts/              # Utility skripty
```

---

## 🚀 Spuštění

```bash
# Instalace
npm install

# Vývoj
npm run dev

# Build
npm run build
```

---

## 🤖 Fine-Tuning systém

Aplikace obsahuje **dedikovanou stránku** pro správu fine-tuningu:

- 📊 **Dashboard → Fine-Tuning** - Kompletní přehled a správa hodnocení
- 📈 Real-time statistiky kvality AI výstupů
- 🔍 Filtry pro efektivní práci
- 📥 Jednoduchý export dat pro OpenAI

**Začněte zde:** 
- [FINE_TUNING_PAGE_GUIDE.md](./documents/FINE_TUNING_PAGE_GUIDE.md) - Průvodce novou stránkou
- [INSTALACE_FINE_TUNING.md](./documents/INSTALACE_FINE_TUNING.md) - Základní instalace

---

## 📞 Podpora

Pro technickou dokumentaci a návody viz složka `documents/`.
