# Open3DCalc

**Calculadora de custos de impressão 3D — gratuita, open-source e 100% local.**

![Build](https://github.com/YOUR_USERNAME/open3dcalc/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)

Open3DCalc é uma calculadora profissional de custos para impressão 3D. Faça upload de arquivos STL para extrair volume automaticamente, calcule custos de material, energia, depreciação, mão de obra e muito mais — tudo no seu navegador, sem enviar dados para servidor.

## Funcionalidades

- 📦 **Análise de STL** — Upload de arquivos STL/OBJ com preview 3D interativo (Three.js)
- 🧮 **Engine de Cálculo Completa** — Material, energia, depreciação, manutenção, mão de obra, embalagem, acabamento, taxa de falhas
- 🏪 **Marketplace Pricing** — Shopee, Mercado Livre, Amazon, Etsy + Venda Direta
- 🖨️ **Perfis de Impressora** — Presets para Bambu Lab, Creality, Prusa, Elegoo e personalizados
- 🧵 **Banco de Materiais** — PLA, PETG, ABS, TPU, Nylon, PC, PEEK, Ultem e mais (23 materiais)
- 📊 **Dashboard Interativo** — Gráfico de pizza com breakdown de custos, ROI, margem
- 🌐 **Multi-idioma** — PT-BR e English
- 📱 **PWA** — Funciona offline, instalável como app
- 📄 **Exportação** — JSON, CSV, PDF (em breve)
- 🔒 **100% Local** — Seus dados nunca saem do navegador. Sem LGPD, sem servidor.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| UI | React 19 + TypeScript + Tailwind CSS v4 |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Estado | Zustand |
| i18n | react-i18next |
| PWA | vite-plugin-pwa |
| Testes | Vitest + React Testing Library |
| Build | Vite 8 |

## Começando

```bash
git clone https://github.com/YOUR_USERNAME/open3dcalc.git
cd open3dcalc
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm test` | Testes (watch) |
| `npm run test:run` | Testes (CI) |
| `npm run lint` | ESLint |
| `npm run storybook` | Storybook |
| `npm run build-storybook` | Build Storybook |

## Estrutura

```
src/
├── components/       # Componentes React
│   ├── Calculator/   # Abas da calculadora
│   ├── Dashboard/    # Dashboard com gráficos
│   ├── Header/       # Header com seletor de idioma
│   └── StlPreview/   # Preview 3D com Three.js
├── hooks/            # Custom hooks
├── i18n/             # Traduções PT-BR + EN
├── lib/              # Engine de cálculo, STL parser, presets
├── stores/           # Zustand stores
└── types/            # TypeScript types
```

## Roadmap

- [x] Engine de cálculo + testes
- [x] STL upload + preview 3D
- [x] Multi-idioma (PT-BR + EN)
- [x] PWA + offline
- [x] Perfis de impressora e materiais
- [ ] Exportação PDF
- [ ] Suporte a resina (MSLA)
- [ ] Histórico com IndexedDB
- [ ] Sincronização via GitHub Gist (opcional)
- [ ] Dark mode toggle

## Licença

MIT — use, modifique e distribua livremente.
