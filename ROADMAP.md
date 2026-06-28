# 🗺️ Roadmap — Open3DCalc

> Planejamento de melhorias baseado na análise do estado atual do produto.

---

## 🔍 Diagnóstico atual

### ✅ O que funciona bem

- Cálculo FDM e Resina completamente funcional com 12+ seções
- Resultados em tempo real via Zustand com `computeStoreResults`
- Toggle por seção (habilitar/desabilitar custos individualmente)
- Export PDF / CSV / JSON
- Inventário de Filamentos com rastreio de peso e alertas de estoque
- Catálogo de impressoras, materiais e marketplaces editável
- Dashboard com KPIs, gráfico de pizza, projeção mensal e Print vs Buy
- Histórico com modal de detalhes e busca

---

### ⚠️ Problemas identificados

| Área             | Problema                                                                   | Impacto  |
| ---------------- | -------------------------------------------------------------------------- | -------- |
| **Histórico**    | Não é possível carregar um item do histórico de volta na calculadora       | Alto     |
| **Histórico**    | Sem ordenação (por data, preço, nome)                                      | Médio    |
| **Histórico**    | Sem comparativo lado a lado entre dois registros                           | Médio    |
| **Histórico**    | Sem importação de JSON (só exporta)                                        | Baixo    |
| **Dashboard**    | `printsPerMonth`, `buyPrice`, `targetSellPrice` resetam ao fechar          | Médio    |
| **Dashboard**    | Sem gráfico de tendência de lucro ao longo dos cálculos salvos             | Médio    |
| **Dashboard**    | Sem análise de break-even (quantidade mínima para cobrir custo fixo)       | Médio    |
| **Catálogo**     | Impressoras e materiais customizados não aparecem no select da calculadora | Alto     |
| **Catálogo**     | Sem edição inline de itens existentes (só adicionar/remover)               | Médio    |
| **Inventário**   | Nenhuma integração com a calculadora (carretel não preenche custo/kg)      | Alto     |
| **Inventário**   | Dedução de peso só tem botões fixos (-10g/-50g/-100g), sem campo livre     | Baixo    |
| **Inventário**   | Sem filtro por material ou marca                                           | Baixo    |
| **Inventário**   | Sem edição de um carretel existente                                        | Médio    |
| **UX Geral**     | Auto-save inexistente — usuário precisa clicar "Salvar Configurações"      | Alto     |
| **UX Geral**     | `confirm()` nativo para deletar/limpar (feio, sem acessibilidade)          | Médio    |
| **UX Geral**     | Quick Mode substituído por 3 níveis (Básico/Intermediário/Avançado)        | ✅ Feito |
| **UX Geral**     | Sem estado de onboarding para novos usuários (tela em branco sem contexto) | Médio    |
| **ResultsPanel** | Dois sistemas de histórico separados (sidebar vs HistoryTab) — duplicação  | Alto     |
| **Mobile**       | Navegação inferior funcional, mas sem acesso rápido a PDF/CSV no mobile    | Baixo    |

> ✅ Resolvido em v1.5.1: Responsividade aprimorada para tablet e mobile, scroll horizontal na calculadora, toast adaptativo, tipografia fluida, glassmorphism otimizado

---

## 🚀 Fases de Implementação

---

### Fase 1 — Fundação & Quick Wins

> **Meta:** Corrigir os problemas de maior impacto e integrar as partes soltas.

#### 1.1 Auto-save de configurações

- Salvar automaticamente no `localStorage` a cada alteração (com debounce de 800ms)
- Remover o botão "Salvar Configurações" ou transformá-lo em feedback visual passivo
- Adicionar indicador de "Salvo automaticamente" no canto do painel de resultados

#### 1.2 Integração Catálogo → Calculadora

- Impressoras e materiais adicionados no Catálogo devem aparecer nos selects da calculadora
- `calculatorStore.selectedPrinter` deve aceitar qualquer entrada de `catalogStore.printers`
- Mesma integração para materiais: ao trocar no Catálogo, refletir no select da calculadora

#### 1.3 Integração Inventário → Calculadora

- Botão "Usar neste cálculo" em cada carretel do Inventário
- Ao clicar: preenche automaticamente `fdmMaterial.costPerKg` e `fdmMaterial.materialType` na calculadora
- Após cálculo: botão "Deduzir peso estimado" no ResultsPanel para descontar do carretel ativo

#### 1.4 Carregar histórico de volta na calculadora

- Botão "Recarregar" em cada item do HistoryTab
- Restaura todos os valores de store (`fdmMaterial`, `fdmPrintParams`, etc.) do snapshot salvo
- Navega automaticamente para a aba Calculadora

#### 1.5 Diálogos de confirmação sem `confirm()` nativo

- Criar componente `<ConfirmDialog>` com glass morphism
- Substituir todos os `confirm(...)` da aplicação por esse componente
- Suportar título, descrição e botões de ação customizáveis

---

### Fase 2 — Histórico & Dashboard Evoluídos

> **Meta:** Transformar dados salvos em inteligência acionável.

#### 2.1 Histórico unificado

- Mesclar `calculatorStore.history` (snapshot rápido no ResultsPanel) com `productStore` (HistoryTab)
- Uma única fonte de verdade: `historyStore` com persistência completa
- O ResultsPanel usa esse store para exibir o mini-histórico e o HistoryTab para a lista completa

#### 2.2 Ordenação e filtros no HistoryTab

- Filtro por tipo (FDM / Resina)
- Ordenação por: data ↑↓ · preço de venda ↑↓ · lucro ↑↓ · nome A-Z
- Pill de filtro ativo com botão "Limpar filtros"

#### 2.3 Comparativo de registros

- Checkbox em cada item do histórico para selecionar até 2 registros
- Botão "Comparar selecionados" → abre modal com tabela lado a lado
- Diferenças destacadas em verde (melhor) / vermelho (pior)

#### 2.4 Dashboard persistente e enriquecido

- Persistir `printsPerMonth`, `buyPrice`, `targetSellPrice` no `localStorage`
- Novo card: **Break-even** — exibe quantas unidades precisam ser vendidas para cobrir o custo fixo mensal (máquina + energia + software)
- Gráfico de linha: lucro médio dos últimos N cálculos salvos (usa `historyStore`)
- Card de **Margem média** calculada sobre todos os itens no histórico

#### 2.5 Import JSON no HistoryTab

- Botão "Importar JSON" que aceita arquivo gerado pelo próprio Export
- Merge inteligente: não duplica registros com mesmo `id`

---

### Fase 3 — Usabilidade & Experiência

> **Meta:** Polir a experiência para que o app seja autoexplicativo e rápido de usar.

#### 3.1 Onboarding para novos usuários

- Detectar primeira visita via `localStorage`
- Modal de boas-vindas com 3 slides: "O que é", "Como calcular", "Como salvar"
- Botão "Pular" persistente

#### 3.2 Tooltips informativos

- Ícone `ⓘ` em campos com lógica não-óbvia:
  - **Taxa de falha** — "% estimada de impressões descartadas"
  - **Quick Mode** — "Usa valores padrão para máquina, energia e mão de obra"
  - **Vida útil da máquina** — "Horas estimadas de operação até depreciação total"
  - **Break-even** — explicação de como o valor é calculado
- Tooltips com delay de 400ms, posicionados via Floating UI / Popper

#### 3.3 Inventário — Edição e dedução livre

- Ícone de lápis em cada carretel → formulário inline de edição
- Campo de input livre para dedução de peso (`X gramas`)
- Filtro por material e marca (pills clicáveis no topo)

#### 3.4 Catálogo — Edição inline

- Ícone de lápis em cada card de impressora/material/marketplace
- Edição inline com `<input>` substituindo o texto, confirmação com Enter ou blur
- Somente campos editáveis (`power`, `value`, `price`, `feePercent`, etc.)

#### 3.5 Atalhos de teclado

- `Ctrl/Cmd + S` → salvar configurações
- `Ctrl/Cmd + H` → navegar para Histórico
- `Ctrl/Cmd + D` → navegar para Dashboard
- `Escape` → fechar qualquer modal aberto
- Indicador de atalho visível em tooltips dos botões principais

#### 3.6 Calculadora de 3 Níveis

- Toggle de 3 botões: Básico / Intermediário / Avançado
- **Básico:** 4 seções essenciais (Material, Parâmetros, Vendas, Resultados)
- **Intermediário:** 5 seções (+ Falhas) com campos intermediários
- **Avançado:** Todas as 10 seções com campos completos
- Engrenagem (⚙️) no header de cada seção para customizar campos individuais
- Persistência do nível e campos ocultos no localStorage
- Migração automática do modo rápido antigo (quickMode → calcLevel)

---

### Fase 4 — Qualidade & Infraestrutura

> **Meta:** Garantir que o produto não quebre ao escalar e seja confiável.

#### 4.1 Testes unitários — calculator.ts

- Cenários: FDM básico, Resina básica, seções desabilitadas, margem zero, custo zero
- Cobertura mínima de 80% em `calculator.ts`
- Rodar em CI com `vitest`

#### 4.2 Testes de integração — stores

- Testar `calculatorStore`: toggle de seção afeta resultado
- Testar `historyStore`: add, remove, merge, export, import
- Testar `filamentInventory`: addSpool, deductWeight, getLowStock

#### 4.3 Error Boundaries

- `<ErrorBoundary>` envolvendo `<ResultsPanel>`, `<Dashboard>` e `<StlPreview>`
- Fallback amigável com opção de "Resetar calculadora"

#### 4.4 Performance — Memoization

- Auditar `useCalculatorStore` para evitar re-renders desnecessários
- `useMemo` em `chartData` (já existe em alguns lugares, verificar cobertura)
- Lazy load de `pdfExport` e `csvExport` (já feito) — verificar `StlPreview` e `recharts`

#### 4.5 PWA & Offline

- Revisar service worker — garantir que o app funciona 100% offline
- Adicionar notificação de "Nova versão disponível" com botão de atualizar

---

## 📊 Matriz de Prioridade

```
                IMPACTO
                Alto         Médio        Baixo
        ┌─────────────────────────────────────────┐
  Alta  │  1.2 Catálogo   2.1 Histórico  3.2 Tooltips  │
        │  1.3 Inventário 2.2 Filtros    3.5 Atalhos   │
        │  1.4 Carregar   2.4 Dashboard               │
        ├─────────────────────────────────────────┤
  Média │  1.5 Dialogs    3.1 Onboarding 3.3 Inventário│
        │  1.1 Auto-save  2.3 Compare    3.4 Catálogo  │
        ├─────────────────────────────────────────┤
  Baixa │  4.3 Boundaries 4.1 Testes     4.5 PWA      │
        │  4.4 Perf.      4.2 Int. tests 2.5 Import   │
        └─────────────────────────────────────────┘
  ESFOR
  ÇO
```

---

## 🏷️ Status

### ✅ Concluído (Fase 1 + parte da Fase 2)

- **Sistema Multi-Moeda** — BRL/USD/EUR/GBP com auto-detecção, seletor no header, hook `useCurrency` unificado
- **Seção de Falhas** — toggle, modo percentual/fixo, valor, risk multiplier com UI completa
- **Custos Fixos Mensais** — seção na calculadora, integrado ao cálculo de custo por hora
- **StoreBridge** — orquestração entre catálogo, inventário, calculadora e histórico
- **Catálogo → Calculadora** — impressoras, materiais e marketplaces customizados aparecem nos selects
- **Inventário → Calculadora** — selecione carretéis para preencher tipo e custo/kg
- **Inventário Reformulado** — SVG spool icons, busca, filtros, edição, status badges, paleta de cores
- **Histórico Unificado** — historyStore com persistência, calculatorStore usa o mesmo store
- **Carregar do Histórico** — restore completo do snapshot na calculadora
- **Ordenação e Filtros no HistoryTab** — filtro por tipo, ordenação por data/preço/lucro/nome, busca
- **Auto-save** — formulário salvo a cada 800ms + beforeunload
- **ConfirmDialog** — componente modal estilizado substituindo `confirm()` nativo
- **Exportar Cotação** — botão no ResultsPanel com JSON de cotação
- **Estimador de Tempo via STL** — tempo de impressão estimado ao carregar 3D
- **AMS Multi-material** — suporte a impressoras multifilamento com até 4 slots
- **Responsividade** — grids 2 itens/linha, padding reduzido, unidades fora dos inputs
- **UX** — modo rápido reposicionado, headers sem toggle, seções colapsáveis
- **3-Level Calculator** — sistema Básico/Intermediário/Avançado com toggle de 3 botões, campos customizáveis por seção via engrenagem (⚙️), persistência localStorage
- **Fix: Nomes longos no dropdown** — nomes de materiais (ex: "PETG + Fibra de Carbono") agora quebram linha no Select ao invés de truncar
- **Fix: Sidebar de preço sticky** — painel ResultsPanel agora acompanha o scroll no desktop (sticky top-6)
- **Onboarding para Novos Usuários** — modal de boas-vindas com 3 slides, detecção de primeira visita via localStorage
- **Tooltips Informativos** — Floating UI, delay 400ms, 4 direções
- **Atalhos de Teclado** — Ctrl/Cmd+S, Ctrl/Cmd+H, Ctrl/Cmd+D, Escape com indicadores visuais
- **Inventário — Dedução Livre** — input numérico livre, filtro por marca e material
- **Catálogo — Edição Inline** — ✏️ em cards, Enter/blur salva, Escape cancela
- **Error Boundaries** — ResultsPanel, Dashboard e StlPreview com fallback estilizado
- **PWA & Offline** — service worker, notificação "Nova versão disponível"
- **Markdown na página Novidades** — renderização de `**bold**` e `` `code` `` inline
- **v1.5.1: Responsividade Aprimorada** — layout tablet (768px-1024px) com sidebar de ícones, bottom bar com scroll horizontal e fade, tipografia fluida com clamp()
- **v1.5.1: Acessibilidade** — prefers-reduced-motion (CSS + hook useReducedMotion), ARIA roles no Catálogo (role="tablist", role="tab"), navegação por teclado com setas
- **v1.5.1: Performance Mobile** — glassmorphism em 3 tiers (768px/480px/reduced-motion), background-attachment: scroll em <768px
- **v1.5.1: Print Stylesheet** — impressão limpa sem navegação, resultados destacados
- **v1.5.1: UI Responsiva** — Toast posicionado bottom-center em mobile, ComparisonModal empilha abaixo de 400px, filtros do Histórico com scroll horizontal
- **v1.5.1: Testes** — 264 testes (22 arquivos), todos passando, 100% de aprovação

### v1.6.0 — Tutorial Interativo & Comunidade

- 🎓 Tutorial interativo com 7 passos, spotlight/tooltip, navegação por teclado
- 📲 Canal Telegram Impressão 3D BR no header e sidebar
- 🌐 Créditos do desenvolvedor (ofertachina.com.br) no rodapé
- 🌍 i18n completa — todas as strings hardcoded extraídas para tradução

### ✅ Itens da Fase 4 já resolvidos

Os seguintes itens marcados como pendentes foram verificados e **já estão implementados**:

- ✅ **Fase 4.2: Testes de integração** — `historyStore.test.ts` e `filamentInventory.test.ts` existem com cobertura completa (add, remove, merge, export, import, addSpool, deductWeight, getLowStock)
- ✅ **PDF/CSV acesso rápido no mobile** — já existe no `MobileBottomBar.tsx` com lazy loading de `pdfExport` e `csvExport`
- ✅ **Dedução automática de estoque** (T-003) — implementada no ResultsPanel com dropdown e ConfirmDialog
- ✅ **ComparisonModal** (T-006) — componente completo com 224 linhas de teste
- ✅ **Dashboard persistente + break-even** (T-007) — implementado com localStorage e card break-even
- ✅ **Import JSON no HistoryTab** (T-010) — implementado com merge inteligente

### 📋 Backlog Técnico (Fase 4)

- **Fase 4.4: Performance — Memoization** — auditar `useCalculatorStore` para re-renders, verificar cobertura de lazy loading (StlPreview, recharts)
- **Clean up técnico** — revisar tipos, remover dead code, padronizar padrões de componentes

---

## 🚀 Fase 5 — Orçamentos & Clientes (LGPD-Safe)

> **Meta:** Transformar o Open3DCalc em uma ferramenta de orçamento profissional **sem abrir mão da privacidade**. Tudo continua 100% no navegador do usuário — zero servidor, zero coleta de dados, zero backend.

---

### 🔒 Contexto de Privacidade

O Open3DCalc é, e continuará sendo, uma aplicação **exclusivamente client-side**. Nenhum dado digitado pelo usuário — sejam parâmetros de cálculo, imagens de STL, dados de clientes ou logs de orçamento — trafega para qualquer servidor. Tudo permanece no `localStorage` do navegador.

Isso é uma **vantagem competitiva e de compliance**: diferente de SaaS como Orçamento Fácil, Klipify ou Conta Azul, o Open3DCalc **não armazena dados em servidores externos**. A responsabilidade sobre os dados é integralmente do usuário, que pode exportar, importar ou limpar seus dados a qualquer momento.

Referências do mercado que seguem o mesmo modelo:

- **Excalidraw** — desenhos ficam 100% no navegador (salvam em arquivo .excalidraw)
- **Tally Forms** — dados de formulários podem ser mantidos apenas localmente
- **JSON Crack** — diagramas ficam no navegador até export

**Importante**: O Open3DCalc não coleta telemetria, não usa cookies analíticos e não carrega scripts de terceiros que enviem dados para servidores externos. A única exceção é o cache de service worker para funcionamento offline, que nunca sai do dispositivo.

---

### 5.1 Cadastro de Clientes

CRUD completo de clientes, armazenado em `localStorage` via Zustand + persist middleware (mesmo padrão do `historyStore`).

| Item                                    | Descrição                                  | Prioridade | Esforço |
| --------------------------------------- | ------------------------------------------ | ---------- | ------- |
| `customerStore` com persist             | Store Zustand com persistência automática  | 🔴 Alta    | 2h      |
| Tipo `Customer` em `types/index.ts`     | Interface com campos definidos             | 🔴 Alta    | 30min   |
| CRUD UI: listar, criar, editar, excluir | Componente com tabela + formulário         | 🔴 Alta    | 6h      |
| Validação de formulário                 | Nome obrigatório, email com formato válido | 🟡 Média   | 2h      |
| Busca e filtro                          | Busca por nome, empresa, email             | 🟡 Média   | 2h      |

**Interface `Customer`:**

```typescript
interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  quoteCount: number;
}
```

---

### 5.2 Orçamento Multi-item

Suporte a **múltiplos itens (cálculos) no mesmo orçamento**, cada um com sua própria configuração, vinculado opcionalmente a um cliente.

| Item                               | Descrição                                       | Prioridade | Esforço |
| ---------------------------------- | ----------------------------------------------- | ---------- | ------- |
| `quoteStore` com persist           | Store de orçamentos (Zustand persist)           | 🔴 Alta    | 3h      |
| Tipo `Quote` em `types/index.ts`   | Interface multi-item                            | 🔴 Alta    | 1h      |
| Seleção de cliente                 | Dropdown searchable vinculado a `customerStore` | 🔴 Alta    | 2h      |
| Adicionar itens do histórico       | Pegar cálculos salvos e agrupar num orçamento   | 🔴 Alta    | 4h      |
| Campos: prazo, condições, validade | Datas, forma de pagamento, validade da proposta | 🟡 Média   | 2h      |
| Número de proposta sequencial      | Auto-incremento via localStorage                | 🟢 Baixa   | 1h      |
| Status do orçamento                | Rascunho / Enviado / Aprovado / Recusado        | 🟢 Baixa   | 1h      |

---

### 5.3 PDF Profissional

Template de orçamento profissional completo usando `@react-pdf/renderer` (já presente no projeto).

| Item                                 | Descrição                                | Prioridade | Esforço |
| ------------------------------------ | ---------------------------------------- | ---------- | ------- |
| `QuoteDoc.tsx` — novo componente PDF | Template completo de orçamento           | 🔴 Alta    | 6h      |
| Cabeçalho com logo                   | Upload de imagem (base64 → localStorage) | 🔴 Alta    | 3h      |
| Dados do cliente em destaque         | Nome, empresa, email, telefone           | 🔴 Alta    | 1h      |
| Tabela de itens no PDF               | Qtd, descrição, valor unitário, total    | 🔴 Alta    | 2h      |
| Condições de pagamento e prazo       | Seção no rodapé do PDF                   | 🟡 Média   | 1h      |
| Manter `ReportDoc.tsx` original      | Relatório técnico continua disponível    | 🟢 Baixa   | 30min   |

---

### 5.4 LGPD/GDPR Compliance — Comunicação de Privacidade

Como tudo fica no navegador, o foco é **comunicar com clareza** o modelo de dados para o usuário.

| Item                            | Descrição                                      | Prioridade | Esforço |
| ------------------------------- | ---------------------------------------------- | ---------- | ------- |
| Banner "Dados no navegador"     | Banner fixo no topo da página de Clientes      | 🔴 Alta    | 2h      |
| Modal de termo de consentimento | Exibido na 1ª vez que acessa "Clientes"        | 🔴 Alta    | 3h      |
| Política de privacidade inline  | Texto completo explicando o modelo             | 🔴 Alta    | 2h      |
| Indicador "offline-first"       | Badge visual: "💻 Dados locais"                | 🟡 Média   | 1h      |
| Botão "Limpar todos os dados"   | Com confirmação dupla (via ConfirmDialog)      | 🟡 Média   | 1h      |
| Rodapé do orçamento com aviso   | Texto no PDF: "Gerado localmente no navegador" | 🟢 Baixa   | 30min   |

**Texto do banner:**

> 🔒 **Seus dados ficam apenas no seu navegador.** Nada do que você digita — dados de clientes, orçamentos ou logs — é enviado para servidores. Você tem controle total: exporte, importe ou apague seus dados quando quiser.

**Termo de consentimento (modal — 1 vez):**

> Ao utilizar o cadastro de clientes e orçamentos do Open3DCalc, você declara estar ciente de que:
>
> 1. Todos os dados inseridos ficam armazenados **exclusivamente no `localStorage` do seu navegador**.
> 2. Nenhum dado é transmitido, copiado ou armazenado em servidores externos.
> 3. A responsabilidade pelo backup e segurança dos dados é integralmente sua.
> 4. Os dados podem ser perdidos ao limpar o cache do navegador — recomendamos exportar backups periodicamente.
> 5. Este software não coleta telemetria, dados analíticos ou informações pessoais.

---

### 5.5 Migração / Backup de Dados

Ferramentas de export/import para backup voluntário.

| Item                       | Descrição                                                  | Prioridade | Esforço |
| -------------------------- | ---------------------------------------------------------- | ---------- | ------- |
| Export completo            | JSON unificado: clientes + orçamentos + histórico + config | 🔴 Alta    | 3h      |
| Import completo com merge  | Carregar JSON e mesclar sem duplicar                       | 🔴 Alta    | 3h      |
| Botão "Fazer backup agora" | Export automático com data no nome                         | 🟡 Média   | 1h      |
| Lembrete periódico         | Toast a cada 30 dias sem backup                            | 🟢 Baixa   | 1h      |

---

### 🧩 DAG de Dependências — Fase 5

```
Wave 1 (paralelo):
  ├── 5.4 Banner LGPD + Termo de Consentimento
  └── 5.1 CustomerStore + Customer CRUD UI

Wave 2 (depende de 5.1):
  ├── 5.2 QuoteStore + QuoteItem UI
  └── 5.4 Política de Privacidade

Wave 3 (depende de 5.2):
  ├── 5.3 QuoteDoc.tsx (PDF profissional)
  └── 5.2 Status + condições

Wave 4 (depende de 5.1 + 5.2):
  └── 5.5 Export/Import completo + backup
```

---

### ✅ Critérios de Aceitação — Fase 5

- [ ] `customerStore` com persistência localStorage, CRUD completo
- [ ] Busca por nome/empresa/email funcional
- [ ] `quoteStore` com suporte a múltiplos itens do histórico
- [ ] Dropdown de cliente no orçamento
- [ ] Orçamento PDF com cabeçalho, logo, dados do cliente, tabela de itens
- [ ] Banner LGPD no topo da seção Clientes/Orçamentos
- [ ] Modal de termo de consentimento na primeira visita
- [ ] Export completo do banco local em JSON unificado
- [ ] Botão "Limpar todos os dados" com confirmação dupla
- [ ] Todos os textos traduzidos (pt-BR + en-US)
- [ ] Cobertura de testes >80% nas novas stores e componentes
- [ ] Nenhuma chamada de rede introduzida — zero servidor, zero backend

---

### 🏷️ Status

| Item                                       | Status                                          |
| ------------------------------------------ | ----------------------------------------------- |
| Fase 1 — Fundação & Quick Wins             | ✅ Concluída                                    |
| Fase 2 — Histórico & Dashboard             | ✅ Concluída                                    |
| Fase 3 — Usabilidade & Experiência         | ✅ Concluída                                    |
| Fase 4 — Qualidade & Infraestrutura        | 🟡 Parcial (Memoization audit + cleanup restam) |
| Fase 5 — Orçamentos & Clientes (LGPD-Safe) | ✅ Concluída (v1.7.0)                           |
| Fase 6 — Edição Impressoras + Banco Dados  | ✅ Concluída (v1.7.0)                           |

> Atualizado em: 28 de Junho de 2026 (v1.7.0)
