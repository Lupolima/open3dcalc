# Changelog

## [1.5.1] — 2026-06-12

### ✨ Novo

- **Responsividade aprimorada** — layout adaptável para celular (320px), tablet (768px) e desktop (1024px+). Sidebar compacta com ícones em tablet. Tipografia fluida com clamp(). Scroll horizontal na barra inferior da calculadora com indicador de fade.
- **Acessibilidade** — suporte a prefers-reduced-motion (CSS + hook React useReducedMotion). Roles ARIA nos tabs do Catálogo (role="tablist", role="tab", aria-selected). Navegação por teclado com setas nos tabs.
- **Performance mobile** — glassmorphism reduzido em telas pequenas (3 tiers: 768px, 480px, reduced-motion). background-attachment: scroll em <768px.
- **Print stylesheet** — impressão limpa sem elementos de navegação, resultados destacados.
- **Calculator.tsx decomposto**: de 2225 para 1395 linhas, com 6 componentes de seção extraídos (FixedCostsSection, LaborSection, MachineSection, MaterialSection, PrintSection, FailureSection)
- **Dynamic imports**: loaders STL/OBJ agora são carregados sob demanda, reduzindo o bundle inicial em ~60-100KB
- **ReportDoc.tsx**: locale e moeda agora são configuráveis via props (antes hardcoded BRL)

### 🎨 UX

- Toast notifications posicionadas no centro-inferior em mobile, canto-superior em desktop.
- ComparisonModal com layout responsivo (grid empilha abaixo de 400px).
- Filtros do Histórico com scroll horizontal em telas estreitas.
- Dropdown e inventário com nomes longos agora quebram linha ao invés de truncar.

### 🐛 Correções

- **gcodeParser.ts**: corrigida duplicação no parsing de filament (dois blocos `;Filament used:` mesclados)

### 🔧 Técnico

- `src/hooks/useReducedMotion.ts` — hook SSR-safe para detecção de prefers-reduced-motion.
- `src/test/setup.ts` — mock global de window.matchMedia para testes.
- Sticky sidebars agora usam `--header-height` (CSS custom property) em vez de valores hardcoded.

### 🧪 Testes

- **264 testes** (era 207) — 22 arquivos de teste, 100% passando.
- Novos testes: useReducedMotion (6), CatalogTab ARIA (5), HistoryTab overflow (3), TabletOptimization (10), TabletSectionNav (5).
- Cobertura de seções da calculadora (MaterialSection, FailureSection, PrintSection, MachineSection, FixedCostsSection, LaborSection).
- **calculatorStore**: cobertura de 60.67% para 93.25%
- **marketplace.ts**: cobertura de 16.66% para 100%
- **printers.ts**: cobertura de 33.33% para 100%

## [1.5.0] — 2026-05-28

### ✨ Novo

- **Onboarding para Novos Usuários** — modal de boas-vindas com 3 slides ("O que é", "Como calcular", "Como salvar"), detecção de primeira visita via localStorage, navegação entre slides com bolinhas, botão "Pular" persistente.
- **Tooltips Informativos** — sistema de tooltips com Floating UI, delay 400ms, posicionamento inteligente em campos não-óbvios (taxa de falha, vida útil da máquina, break-even).
- **Atalhos de Teclado** — Ctrl/Cmd+S (salvar configurações), Ctrl/Cmd+H (navegar para histórico), Ctrl/Cmd+D (navegar para dashboard), Escape (fechar modais). Indicadores visuais nos botões de navegação.
- **Inventário — Dedução Livre** — campo de input numérico para deduzir peso exato em cada carretel, validação de saldo, combinado com filtro por marca (pills clicáveis) e filtro de material.
- **Catálogo — Edição Inline** — ícone ✏️ em cards de impressora/material/marketplace, input substitui texto com Enter/blur para salvar, Escape para cancelar.
- **Error Boundaries** — envolve ResultsPanel, Dashboard e StlPreview com fallback estilizado, botões "Tentar novamente" e "Resetar calculadora".
- **PWA & Offline** — service worker com cache total de assets, notificação "Nova versão disponível" com botão de atualização.

### 🎨 UX

- Tooltips com ícone ⓘ nos InputGroup com delay de 400ms e posicionamento automático (Floating UI).
- Filtro combinado de material + marca no inventário com feedback visual.
- Indicadores de atalho de teclado nos botões de navegação (Ctrl+H, Ctrl+D).
- Glassmorphism consistente em todos os novos componentes (OnboardingModal, Tooltip, ErrorBoundary, PwaUpdatePrompt).
- Edição inline no catálogo com confirmação visual (check verde / X vermelho).

### 🔧 Técnico

- `src/hooks/useKeyboardShortcuts.ts` — hook de atalhos com supressão em inputs/textarea/select.
- `src/hooks/usePwaUpdate.ts` — hook de atualização PWA com service worker registration.
- `src/components/ui/OnboardingModal.tsx` — modal com 3 slides, Framer Motion `AnimatePresence`, lazy initializer.
- `src/components/ui/Tooltip.tsx` — tooltip com Floating UI, `useMergeRefs`, suporte a 4 direções.
- `src/components/ui/ErrorBoundary.tsx` — ErrorBoundary classe com `componentDidCatch`, fallback com retry e reset.
- `src/components/ui/PwaUpdatePrompt.tsx` — banner de atualização com `skipWaiting()` + reload.
- `src/components/Catalog/FilamentInventory.tsx` — input de dedução livre + brand filter pills.
- `src/components/Catalog/CatalogTab.tsx` — componente `InlineField` para edição inline nos 3 gerenciadores.
- `vite.config.ts` — PWA config com runtime caching e globPatterns completo.
- `src/main.tsx` — integração do PwaUpdatePrompt no root.

### 📚 Qualidade

- **53 testes unitários** em `calculator.ts` — cobertura de **99.19%** (statements) e **82.95%** (branches).
- **25 testes de integração** nas stores (calculatorStore 8, historyStore 9, filamentInventory 8).
- **79 testes no total** passando, 0 lint errors, build limpo.
- Performance: memoização com `useMemo`/`useShallow`, lazy loading de StlPreview e PDF.
- Error Boundaries nos 3 componentes críticos com fallback padronizado.

### 🤖 CI & Automação

- **changelogen** configurado para geração de changelog a partir de conventional commits.
- `.changelogenrc` com categorias em português e emojis personalizados.
- Workflow de Release manual no GitHub Actions (`release.yml`) com bump semântico e GitHub Release.

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
