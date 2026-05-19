# Análise de Interface — Open3DCalc

## Problemas Identificados

### 1. Header desalinhado
- Header usa `max-w-2xl`, conteúdo usa `max-w-5xl` — no desktop o título não alinha com o conteúdo

### 2. Mobile: resultados no fim do scroll
- No mobile, o chart + resumo ficam DEPOIS de todos os inputs. Usuário preenche tudo sem ver feedback até rolar até o fim
- Sidebar de ações (salvar/exportar) também no fim — difícil acesso

### 3. Layout 3 colunas subutilizado no desktop
- `lg:grid-cols-3` com left col-span-2 → right col-span-1
- No desktop a coluna direita é estreita (chart + summary comprimidos)
- Poderiam ser 2 colunas iguais ou 60/40

### 4. STL upload escondido
- Dentro do ToggleCard de Material, se o usuário colapsar a seção não vê o drop zone

### 5. Sem estado vazio / onboarding
- Inputs carregam com valores default (50g PLA, 5h), mas sem explicação do que fazer primeiro

### 6. Glassmorphism pesado no mobile
- `backdrop-filter: blur(12px)` em mobile pode causar lag em dispositivos mais fracos
- Muitos cards glass empilhados visualmente poluídos

### 7. Sem light mode
- Só tema escuro — para calculadora de custos, contraste poderia ser melhor

### 8. Live results sem feedback
- Resultados atualizam em tempo real (useMemo), mas sem indicação visual de que mudaram
- Usuário não sabe se o cálculo já aconteceu

---

## Proposta de Redesign

### Fase UI-1: Mobile First (prioridade máxima)

**Header responsivo:**
- Header adapta largura ao conteúdo (mesmo max-w-5xl)

**Sticky Results Bar (mobile):**
- Barra inferior fixa com [Custo Total] [Preço Venda] [Lucro]
- Sempre visível ao scrollar, independente de onde o usuário está no formulário

**Layout mobile (stack otimizado):**
1. Tabs FDM/Resina
2. Sticky Results Bar (sempre visível)
3. Inputs (agrupados, sem espaçamento excessivo)
4. "Ver resultados completos" → expande chart + breakdown
5. Ações (salvar/exportar)

**Touch targets maiores:**
- Input height mínimo 44px (padrão iOS/Android)
- Botões com padding mais generoso no mobile

### Fase UI-2: Desktop Refinado

**Layout 2-colunas balanceado:**
- 60% inputs | 40% resultados (chart + summary + ações)
- Chart maior, legendas legíveis
- Coluna direita sticky no scroll

**Seções colapsadas por padrão:**
- Material + Print Parameters abertos
- Hardware, Labor, OPS/Software, Sales fechados (expandíveis)
- Reduz poluição visual inicial

**Melhor hierarquia visual:**
- Títulos das seções com ícones maiores e cores diferentes por categoria
- Inputs agrupados visualmente com bordas sutis

### Fase UI-3: Experiência Geral

**Empty state:**
- Ao carregar, mostrar "Bem-vindo! Preencha os dados abaixo para calcular seus custos"
- Sugestões de valores reais (tooltips mais visíveis)

**Feedback de cálculo:**
- Transição suave nos valores do resumo quando mudam
- Pequeno indicador "🔄 Atualizado" no resumo

**Light mode:**
- Respeitar `prefers-color-scheme`
- Tema claro com glassmorphism invertido (bg claro com blur)
- Toggle no header

**Micro-animações:**
- Seções expandem com altura animada
- Números do summary contam ao mudar
- Chart fade-in nos dados

---

### Prioridade de Implementação

| Prioridade | Item | Esforço | Impacto |
|---|---|---|---|
| 🔴 P0 | Sticky Results Bar (mobile) | Pequeno | Alto |
| 🔴 P0 | Layout mobile reordenado | Médio | Alto |
| 🔴 P0 | Empty state / onboarding | Pequeno | Alto |
| 🟡 P1 | Layout desktop 60/40 | Médio | Médio |
| 🟡 P1 | Seções colapsadas por padrão | Pequeno | Médio |
| 🟡 P1 | Touch targets maiores | Pequeno | Médio |
| 🟢 P2 | Feedback de cálculo animado | Médio | Baixo |
| 🟢 P2 | Light mode | Grande | Médio |
| 🟢 P2 | Micro-animações | Grande | Baixo |

---

Quer que eu implemente essas melhorias? Sugiro começar pelos **P0** (impacto mais alto, esforço menor) e ir subindo.
