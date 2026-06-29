# Open3DCalc 🖨️💰

Calculadora de custos de impressão 3D gratuita, open-source e segura.
Free, open-source 3D printing cost calculator.

[![CI/CD](https://github.com/ils15/open3dcalc/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ils15/open3dcalc/actions/workflows/ci-cd.yml)
[![Licença](https://img.shields.io/badge/licença-MIT-blue)](LICENSE)
[![Versão](https://img.shields.io/github/v/release/ils15/open3dcalc)](https://github.com/ils15/open3dcalc/releases)

## 🌐 Web App
**https://ils15.github.io/open3dcalc/** — PWA com suporte offline.

## 📦 Desktop App
Windows (NSIS installer) + Linux (AppImage). Baixe na [página de releases](https://github.com/ils15/open3dcalc/releases).

## ✨ Funcionalidades
- Cálculo de custos FDM e Resina (material, mão-de-obra, máquina, falhas, markup)
- Catálogo de impressoras, filamentos e materiais
- Orçamentos em PDF
- Clientes e histórico de cotações
- Gráficos e dashboard
- Multi-moeda (auto-detecção por IP)
- Internacionalização (pt-BR / en-US)
- Tema claro/escuro
- PWA com suporte offline

## 🏗️ Estrutura do Projeto

```
open3dcalc/
├── src/
│   ├── shared/           # Código compartilhado entre web e desktop
│   │   ├── components/   # Componentes React (Calculator, Catalog, Dashboard, UI)
│   │   ├── stores/       # Zustand stores (calculator, catalog, customer, history, etc)
│   │   ├── lib/          # Bibliotecas (calculator logic, PDF export, CSV, STL parser)
│   │   ├── hooks/        # React hooks (useCurrency, useTheme, useReducedMotion)
│   │   ├── types/        # TypeScript tipos
│   │   ├── i18n/         # Internacionalização (pt-BR, en-US)
│   │   └── test/         # Test utilities
│   └── platform/
│       ├── desktop/      # Electron-specific (IPC, SQLite persistence bridge)
│       └── web/          # PWA-specific (service worker, PWA manifest)
├── db/                   # Database schema (Drizzle ORM + SQLite migrations)
├── electron/             # Electron main process (TypeScript)
└── web/                  # Stale web-only codebase (git history)
```

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 22+
- npm 10+

### Instalação
```bash
git clone https://github.com/ils15/open3dcalc.git
cd open3dcalc
npm install
```

### Desenvolvimento
```bash
# Web (com hot-reload)
npm run dev:web

# Desktop (Electron + hot-reload)
npm run dev:desktop
```

### Build
```bash
# Ambos
npm run build:all

# Apenas web
npm run build:web

# Apenas desktop + electron-builder
npm run build:desktop && npm run build:electron && npx electron-builder --win --linux
```

### Testes
```bash
npm test
npm run test:run  # single run (sem watch)
```

## 🧪 Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **Build:** Vite 8
- **Desktop:** Electron 42, better-sqlite3 (via Drizzle ORM)
- **Web:** PWA com service worker (Workbox)
- **Testes:** Vitest + Testing Library
- **Tradução:** react-i18next
- **Gráficos:** Recharts
- **3D:** Three.js (STL preview)
- **PDF:** @react-pdf/renderer

## 🤝 Contribuindo
Veja [CONTRIBUTING.md](CONTRIBUTING.md)

## 📜 Changelog
Veja [CHANGELOG.md](CHANGELOG.md)

## 📄 Licença
MIT — veja [LICENSE](LICENSE)
