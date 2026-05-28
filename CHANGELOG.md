# Changelog

## v1.5.0

### 🚀 Enhancements

- SelectDropdown compound + STL security + dead code removal ([f4371f9](https://github.com/ils15/open3dcalc/commit/f4371f9))
- Auto-preenchimento ao selecionar impressora no cadastro ([7d29062](https://github.com/ils15/open3dcalc/commit/7d29062))
- Auto-preenchimento materiais e marketplaces + formulario marketplaces ([02a8b40](https://github.com/ils15/open3dcalc/commit/02a8b40))
- Atualiza taxas marketplace 2026 - Shopee 14%+R6, ML 16%+R.50, Amazon/Etsy mantidos ([2fd524e](https://github.com/ils15/open3dcalc/commit/2fd524e))
- Duas faixas Shopee - ate R9 (20%+R) e R0+ (14%+R6) ([f6abf4c](https://github.com/ils15/open3dcalc/commit/f6abf4c))
- Waves 1-2 - dashboard, cost/gram, markup presets, failure cost, 3MF parser, G-code parser, CSV export, print time estimator ([4b6316a](https://github.com/ils15/open3dcalc/commit/4b6316a))
- Complete waves 1-2 - batch calc, infill input, update WAVES.md ([3215b51](https://github.com/ils15/open3dcalc/commit/3215b51))
- Complete waves 3-4 - target margin, monthly projection, print vs buy, infill calc, filament inventory, SKU manager, quote API ([0e6c15e](https://github.com/ils15/open3dcalc/commit/0e6c15e))
- Sections toggle + dashboard i18n fix + extensive README docs ([b384d87](https://github.com/ils15/open3dcalc/commit/b384d87))
- Improve accessibility, responsiveness and fix store results sync ([6676a88](https://github.com/ils15/open3dcalc/commit/6676a88))
- Responsividade — max-width 1400px, touch targets 44px, safe-areas, glass perf ([309617f](https://github.com/ils15/open3dcalc/commit/309617f))
- Section enable/disable toggle in each card header ([9dc20bd](https://github.com/ils15/open3dcalc/commit/9dc20bd))
- AMS multi-material + integração Catálogo/Inventário/Histórico + auto-save + UX overhaul ([95a2a22](https://github.com/ils15/open3dcalc/commit/95a2a22))
- **infra:** Add complete collaboration structure with PR workflows and quality gates ([aa8b63c](https://github.com/ils15/open3dcalc/commit/aa8b63c))
- **fase2:** Calculator improvements, unified history, and integrated tools ([#1](https://github.com/ils15/open3dcalc/pull/1))
- **fase-2:** Add inventory deduction, dashboard enhancements, comparison modal, and JSON import ([b0f10be](https://github.com/ils15/open3dcalc/commit/b0f10be))
- **fase-2:** Add history compare/import UI ([c256d43](https://github.com/ils15/open3dcalc/commit/c256d43))
- **changelog:** Add v1.4.0 changelog and in-app changelog page ([72b4d6f](https://github.com/ils15/open3dcalc/commit/72b4d6f))
- **changelog:** Internationalize all hardcoded strings in ChangelogPage ([1f291c9](https://github.com/ils15/open3dcalc/commit/1f291c9))
- Quick mode — basic/advanced segmented control for calculator ([234eca2](https://github.com/ils15/open3dcalc/commit/234eca2))
- Merge 3-level calculator system (basic/intermediate/advanced) ([5c828b1](https://github.com/ils15/open3dcalc/commit/5c828b1))
- Merge 3-level calculator system (basic/intermediate/advanced)" ([c2a3cd3](https://github.com/ils15/open3dcalc/commit/c2a3cd3))
- **calculator:** 3-level system (Basic/Intermediate/Advanced) with field customization ([974af0b](https://github.com/ils15/open3dcalc/commit/974af0b))

### 🩹 Fixes

- Lint errors - unused expression and unused param ([0fd9c47](https://github.com/ils15/open3dcalc/commit/0fd9c47))
- Lint errors - remove any type, add missing useEffect dependency ([7692155](https://github.com/ils15/open3dcalc/commit/7692155))
- Move CSS reset into @layer base so Tailwind utilities override correctly — fixes mx-auto centering and all margin/padding utilities ([cc7a7a3](https://github.com/ils15/open3dcalc/commit/cc7a7a3))
- Nav translations, Calculator UX, Catalog infinite re-render ([2e1ba45](https://github.com/ils15/open3dcalc/commit/2e1ba45))
- Infill dimensions grid 2-col so values aren't clipped by unit badge ([bdcfc36](https://github.com/ils15/open3dcalc/commit/bdcfc36))
- Items-end on all grid containers for consistent input alignment ([ed36919](https://github.com/ils15/open3dcalc/commit/ed36919))
- Label min-h for consistent input alignment across all sections ([aee5e71](https://github.com/ils15/open3dcalc/commit/aee5e71))
- Remove nav dots, strip icon boxes, fix printer select portal ([5fc88b4](https://github.com/ils15/open3dcalc/commit/5fc88b4))
- Monogram initials in printer select, remove duplicate results, slim toggle switches ([627b0f9](https://github.com/ils15/open3dcalc/commit/627b0f9))
- Resolve all code review feedback from fase-2 PR ([a6629ae](https://github.com/ils15/open3dcalc/commit/a6629ae))
- **catalog:** Allow free-text brand entry and add printer usefulLife/maintenance fields ([723f351](https://github.com/ils15/open3dcalc/commit/723f351))
- **changelog:** Replace invalid Github icon with inline SVG and guard changelogData type ([4a82af2](https://github.com/ils15/open3dcalc/commit/4a82af2))
- Address calculator review feedback ([959a89b](https://github.com/ils15/open3dcalc/commit/959a89b))
- **calculator:** Show friendly names in section field customizer popover ([9de141a](https://github.com/ils15/open3dcalc/commit/9de141a))

### 💅 Refactors

- Improve component structure, styling and accessibility across UI ([c6bf8d3](https://github.com/ils15/open3dcalc/commit/c6bf8d3))
- Extrai ResultsPanel, adiciona Toast, ToggleSwitch, modo completo e barras mobile consolidadas ([6350212](https://github.com/ils15/open3dcalc/commit/6350212))
- Move section toggles to sidebar dots, remove sticky bar, rename Ops to Soft/EPI, always fullView, fix input sizing ([9ec47aa](https://github.com/ils15/open3dcalc/commit/9ec47aa))

### 📖 Documentation

- Add ROADMAP with 4-phase improvement plan ([7e04659](https://github.com/ils15/open3dcalc/commit/7e04659))

### 🏡 Chore

- Add \*.plan.md to gitignore ([f9a3e35](https://github.com/ils15/open3dcalc/commit/f9a3e35))
- Remove old artifact plan files from repo ([89f859f](https://github.com/ils15/open3dcalc/commit/89f859f))

### 🎨 Styles

- **ui:** Overhaul dropdown visuals with glass effect and indigo accents ([250c7df](https://github.com/ils15/open3dcalc/commit/250c7df))
- Clean up calculator sales section formatting ([9e95e3e](https://github.com/ils15/open3dcalc/commit/9e95e3e))

### ❤️ Contributors

- Ils15 ([@ils15](https://github.com/ils15))

## [1.4.0] — 2026-05-25

### ✨ Novo

- **Dedução Automática de Estoque** — botão "Deduzir do Estoque" no ResultsPanel. Dropdown com carretéis disponíveis filtrados por material e estoque, confirmação via ConfirmDialog, feedback de sucesso com auto-hide.
- **Dashboard Aprimorado** — persistência de inputs (printsPerMonth, buyPrice, targetSellPrice) no localStorage. Card Break-Even (unidades necessárias para cobrir custo fixo). Card Margem Média sobre histórico. Gráfico de Tendência de Lucro (AreaChart recharts com gradiente).
- **Comparativo de Histórico** — checkboxes nos registros do histórico (máx 2). Botão "Comparar" abre modal com tabela lado a lado de 10 campos, destacando melhor (verde) e pior (vermelho) com ícones TrendingUp/TrendingDown.
- **Importação JSON** — botão "Importar JSON" no HistoryTab com file picker. Usa `importJson()` existente no historyStore com merge inteligente sem duplicatas.

### 🎨 UX

- Dropdown de carretéis com indicador visual de cor, marca, material e peso restante.
- Checkbox de seleção nos registros do histórico com destaque (ring indigo) quando selecionado.
- Contador de seleção no botão "Comparar" (ex: "Comparar (2/2)").
- Feedback temporário de resultado de importação (3s auto-hide).

### 🔧 Técnico

- `ResultsPanel.tsx`: integração com `useFilamentInventory`, dropdown de carretéis com click-outside, `deductWeight()`.
- `Dashboard.tsx`: persistência localStorage (`open3dcalc_dashboard_v1`), break-even com `fixedCosts.monthlyCost`, área chart com gradiente SVG, cálculo de margem média do histórico.
- `ComparisonModal.tsx` (novo): modal de comparação com focus trap, ESC close, highlight verde/vermelho, 10 campos comparativos.
- `HistoryTab.tsx`: estado `selectedForCompare` (max 2), `toggleCompare()`, `compareEntries` memo, file input + `FileReader` + `importJson()`.
- `i18n`: 14 novas chaves em pt-BR e en-US para inventário, dashboard, histórico e comparação.

## [1.3.0] — 2026-05-25

### ✨ Novo

- **Sistema Multi-Moeda** — suporte a BRL/USD/EUR/GBP com auto-detecção baseada no locale do navegador. Nova lib `src/lib/currency.ts` e hook `src/hooks/useCurrency.ts`.
- **Seletor de Moeda no Header** — dropdown no header com opções Automático, BRL, USD, EUR, GBP.
- **Inventário Reformulado** — reformulação completa do `FilamentInventory.tsx` com SVG spool icons, busca textual, filtros por material/status, edição de rolos, paleta de cores e badges de status.
- **Status de Carretéis** — novo campo `status` (Em estoque / A caminho / Vazio) e `purchaseStore` por rolo, com migração automática de dados legados.
- **Custos Fixos na Navegação** — seção "Custos Fixos" adicionada à navegação lateral da calculadora.

### 🎨 UX

- Seletor de moeda com fallback automático (pt-BR → BRL, demais → USD).
- Loader "Carregando..." quando resultados da calculadora estão nulos.
- Labels de navegação lateral e descrições de seção agora internacionalizadas via i18n.
- Labels do gráfico de pizza no ResultsPanel agora usam chaves i18n.

### 🔧 Técnico

- `lib/currency.ts` — sistema de moedas com formatação locale-aware via `toLocaleString`.
- `hooks/useCurrency.ts` — hook unificado consumindo `calculatorStore.currency` + i18n language.
- `stores/calculatorStore.ts` — novo campo `currency: CurrencySetting` com persistência em localStorage via auto-save.
- `stores/filamentInventory.ts` — novos campos `colorHex`, `status`, `purchaseStore`; novo método `updateSpool()`; função `migrateSpool()` para dados legados.
- `vite.config.ts` — exclude `three`, `@react-three/fiber`, `@react-three/drei` do `optimizeDeps` para evitar erros de build.
- Todas as ocorrências de `R$` hardcoded substituídas pelo `useCurrency` hook em 7 componentes.

## [1.2.0] — 2026-05-25

### ✨ Novo

- **Estrutura de Colaboração** — documentação completa de contribuição, templates de PR e issues, políticas de branch.
- **CONTRIBUTING.md** — guia completo com fluxo fork → branch → commit → PR → review → merge.
- **PULL_REQUEST_TEMPLATE.md** — template com checklist de qualidade para todos os PRs.
- **Issue Templates** — formulários estruturados para bug report e feature request.
- **SECURITY.md** — política de segurança e processo de report de vulnerabilidades.
- **CODEOWNERS** — revisão automática do mantenedor para todo o código.
- **MAINTAINERS.md** — documentação de papéis e responsabilidades.
- **README.md** — seção "Contribuindo" revisada com tabela de políticas.

### 🔧 Técnico

- CI/CD aprimorado com jobs paralelos (lint, typecheck, test, build) e relatório de coverage.
- Husky + commitlint + lint-staged para validação automática de commits.

### 📚 Qualidade

- Política de branches e proteção de main documentada.
- Regras claras de code review e merge.
- Conventional Commits padronizados e validados.

## [1.1.0] — 2026-05-20

### ✨ Novo

- **AMS Multi-material** — suporte a impressoras multifilamento (Bambu Lab AMS, Prusa XL). Até 4 slots com material, cor, peso, purga e densidade individuais. Cálculo automático de custo total incluindo purga por transição entre materiais.
- **Inventário → Calculadora** — selecione carretéis do inventário para preencher automaticamente tipo e custo/kg na calculadora.
- **Catálogo → Calculadora** — impressoras, materiais e marketplaces customizados no Catálogo aparecem nos selects da calculadora.
- **Carregar do Histórico** — cada item salvo no histórico pode ser restaurado completamente na calculadora (snapshot completo do estado).
- **Auto-save** — formulário salvo automaticamente a cada 800ms + salvamento síncrono no `beforeunload`.
- **ConfirmDialog** — componente modal estilizado substituindo `confirm()` nativo em todas as ações destrutivas.
- **StoreBridge** — camada de orquestração entre stores (catálogo, inventário, calculadora, histórico).

### 🎨 UX

- Unidades (g, %, R$/kg, etc.) movidas para fora das caixas de input — visual mais limpo.
- Headers de seção simplificados — remoção dos toggles "setinha" que ocupavam espaço.
- Grids responsivos — no máximo 2 itens por linha em todos os formulários.
- Padding reduzido em cards, grids e headers — mais conteúdo visível sem scroll.
- Modo rápido movido para linha própria abaixo dos abas FDM/Resina.

### 🔧 Técnico

- `types/index.ts`: novo tipo `AMSSlot`, `PrinterProfile.maxFilaments`, `CalculationSnapshot` com suporte a AMS.
- `stores/calculatorStore.ts`: auto-save com debounce, `loadHistoryItem()`, `fdmAmsEnabled`/`fdmAmsSlots` + setters.
- `stores/storeBridge.ts`: `selectSpool()`, `restoreAutoSnapshot()`.
- `stores/productStore.ts`: `save()` aceita `snapshot` opcional.
- `components/ui/ConfirmDialog.tsx`: componente reutilizável com focus trap, ESC close, 3 variantes.
- Cálculo AMS integrado ao `computeStoreResults()` — soma custo de slots ativos + purga por transição.
- Upload STL/G-code integrado com AMS — popula primeiro slot ativo.
