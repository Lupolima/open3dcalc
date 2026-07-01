# 🗺️ Open3DCalc — Roadmap

> **Data:** Julho 2026
> **Propósito:** Guia de prioridades para evolução do Open3DCalc.
> **Fluxo:** Toda funcionalidade segue → branch → PR → review → merge (`BRANCH-POLICY.md`)

---

## Prioridades (Ordem de Execução)

### 🔴 Fase 1: Usabilidade & Tutoriais

**Problema:** Tutoriais e onboarding atuais não são bons. Precisamos de uma experiência mais fluida que ensine o usuário a usar a calculadora sem atrapalhar.

**O que investigar primeiro (USO real):**
- [x] Tooltips em 52+ campos da calculadora
- [x] LevelToggle renomeado (Rápido/Detalhado/Completo)
- [x] Tutorial interativo não-bloqueante
- [x] Onboarding com CTA para tutorial
- [x] Skip link + heading hierarchy + acessibilidade
- [x] Tooltips migrados para i18n (pt-BR + en-US)
- [x] Touch targets mínimos (44px) em botões

**Entregáveis:**
- [ ] Telemetria opcional anônima (opt-in) para entender uso real
- [ ] Tutorial interativo reescrito (step-by-step, non-blocking)
- [ ] Onboarding progressivo (mostra features conforme o usuário avança)
- [ ] Tooltips contextuais nos campos da calculadora
- [ ] Empty states informativos (quando não há dados)
- [ ] Feedback visual de ações (undo, confirmação, animações)
- [ ] Modo "Quick Start" com valores pré-preenchidos para teste

**Critérios de aceite:**
- Tutorial pode ser ignorado/dispensado a qualquer momento
- Não blockers — o usuário consegue usar a calculadora sem passar pelo tutorial
- Telemetria é opt-in com consentimento explícito

---

### 🔶 Fase 1.5: Usabilidade Avançada (PR #7)

**Features entregues no PR #6:** Tooltips, LevelToggle, Tutorial, Skip link, i18n tooltips, acessibilidade.

**Próximo ciclo — refinamentos de UX:**

#### 5. Quick Start com valores pré-preenchidos
- [ ] Botão "Quick Start" que preenche a calculadora com valores realistas
  - PLA R$90/kg, 150g, 2h impressão, 10% taxa de falha
  - Margem de 50%, embalagem R$5, frete R$15
- [ ] Modo "Exemplo" vs "Começar do zero"
- [ ] Tooltip no botão explicando que valores são editáveis
- **Arquivos:** CalculatorStore (reset/quickStart action), UI button
- **Testes:** Verificar se quickStart preenche corretamente

#### 6. Empty states para seções sem dados
- [ ] Histórico vazio: "Nenhum cálculo salvo ainda. Seu primeiro resultado aparecerá aqui."
- [ ] Inventário vazio: "Adicione filamentos ao seu inventário para agilizar os cálculos."
- [ ] Orçamentos vazios: "Crie seu primeiro orçamento para enviar ao cliente."
- [ ] Cotações vazias: mesma abordagem
- **Arquivos:** HistoryTab, InventorySection, QuoteSection
- **Testes:** Renderização com lista vazia

#### 7. Scroll suave entre seções
- [ ] `scroll-behavior: smooth` no CSS global
- [ ] Seção ativa destacada na navegação
- [ ] Scroll suave ao clicar no SectionNav
- **Arquivos:** index.css, SectionNav.tsx

#### 8. Atalhos de teclado
- [ ] `Ctrl+Z` — Desfazer última alteração (undo na calculatorStore)
- [ ] `Ctrl+Shift+Z` — Refazer
- [ ] `Ctrl+E` — Exportar resultado
- [ ] `Ctrl+P` — Imprimir/PDF
- [ ] `?` — Mostrar help de atalhos
- **Arquivos:** Novo hook `useKeyboardShortcuts.ts`, calculatorStore (undo stack)
- **Testes:** Simular keydown events

**Critérios de aceite:**
- Quick Start preenche todos os campos essenciais
- Empty states têm ilustração/ícone + texto + CTA
- Scroll suave não quebra navegação por âncoras
- Atalhos não conflitam com atalhos do navegador
- Todos os 448+ testes passam

### 🟡 Fase 2: STL Upload + Preview 3D Interativo

**Problema:** O preview 3D existe mas é limitado — não há upload de STL do usuário, nem visualização interativa integrada ao cálculo.

**O que já existe:**
- `src/shared/components/StlPreview/StlPreview.tsx` — componente Three.js básico
- `src/shared/lib/stlParser.ts` — parser STL (374 linhas)
- Three.js + React Three Fiber + Drei já configurados

**O que precisa ser feito:**
- [ ] Upload de arquivo STL/OBJ/3MF com drag & drop
- [ ] Preview 3D interativo (rotação, zoom, pan)
- [ ] Cálculo automático de volume a partir do modelo 3D
- [ ] Estimativa de peso e material baseado no volume
- [ ] Visualização de camadas (slicing simulation)
- [ ] Detecção automática de FDM vs Resina baseado no modelo
- [ ] Suporte a múltiplos uploads e comparação

**Critérios de aceite:**
- Upload via clique + drag & drop
- Preview 3D responsivo (funciona em mobile)
- Volume calculado corretamente (validação com modelos conhecidos)
- Custo estimado aparece automaticamente no cálculo

---

### 🟢 Fase 3: Dashboard Avançado

**Problema:** O dashboard atual existe mas é básico — faltam projeções, métricas de negócio e análises que ajudem o usuário a tomar decisões.

**O que já existe:**
- `src/shared/components/Dashboard/Dashboard.tsx`
- `src/shared/components/Dashboard/RechartsLazy.tsx`
- Recharts 2 já configurado
- `historyStore.ts` com dados históricos

**O que precisa ser feito:**
- [ ] KPIs principais: lucro total, custo médio por impressão, margem média
- [ ] Gráfico de evolução de lucro (linha do tempo)
- [ ] Distribuição de custos por categoria (pizza/barras)
- [ ] Projeções: "se você imprimir X peças por mês..."
- [ ] Comparação de períodos (mês atual vs anterior)
- [ ] Top impressoras mais lucrativas
- [ ] Top materiais mais usados
- [ ] Exportação de relatório executivo (PDF)
- [ ] Metas personalizadas (ex: "quero lucrar R$500/mês")
- [ ] Alertas de baixa margem em peças recorrentes

**Critérios de aceite:**
- Dashboard carrega rápido com dados históricos
- Gráficos responsivos
- Export PDF funcional
- Dados reais (não mockados)

---

## 📊 Métricas de Qualidade

| Métrica | Atual | Meta |
|---------|-------|------|
| Cobertura de testes (geral) | ~33% | ≥60% |
| Cobertura (cálculo) | ~85% | ≥90% |
| Testes | 417 | 500+ |
| Componentes com testes | Parcial | 100% |
| Acessibilidade (a11y) | — | WCAG A |

## 🔒 Não escopo (por enquanto)

- ❌ Cloud sync / multi-usuário
- ❌ Integração com APIs de fornecedores
- ❌ FDM vs Resina comparativo (não faz sentido — cada um é para um propósito)
- ❌ Marketplace de modelos 3D

---

## Como contribuir

1. Escolha uma issue ou feature deste roadmap
2. Crie branch: `feat/<nome-da-feature>`
3. Desenvolva com TDD (RED → GREEN → REFACTOR)
4. Commit seguindo [Conventional Commits](https://www.conventionalcommits.org/)
5. Abra PR → aguarde review → merge

---

_Atualizado em Julho 2026. Este roadmap é vivo e muda conforme o feedback dos usuários._
