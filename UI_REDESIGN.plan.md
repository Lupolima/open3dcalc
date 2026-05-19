# Plano de Redesign UI/UX — Open3DCalc

Baseado em auditoria aprofundada do site ao vivo (https://ils15.github.io/open3dcalc/).

## Diagnóstico

**Nota geral: 7/10** — Engine excelente, mas seguração por:
- Acessibilidade: 4/10 (múltiplas falhas WCAG)
- Mobile: 6/10 (summary no fim do scroll)
- Onboarding: inexistente (20+ campos visíveis de uma vez)

---

## 🔴 Dia 1 — Correções Críticas (esforço baixo, impacto alto)

### A-1: Foco de teclado invisível
**O quê**: Toggle switches, abas de navegação, botões de idioma — todos sem `focus-visible`
**Como**: Adicionar `focus-visible:ring-2 focus-visible:ring-purple-500` nos componentes
**Arquivos**: `ToggleCard.tsx`, `InputGroup.tsx`, `App.tsx`
**Esforço**: 5min

### A-2: Touch targets muito pequenos (mobile)
**O quê**: Botões ON/OFF (20px altura), ToggleSwitch (28px), botões ação (40px) — falham 44px mínimo WCAG
**Como**: 
- `h-7` → `h-11` no ToggleSwitch
- `py-1` → `py-2` nos botões ON/OFF
- `py-2.5` → `py-3.5` nos botões de ação
**Arquivos**: `ToggleCard.tsx`, `Calculator.tsx`
**Esforço**: 15min

### A-3: Contraste do placeholder
**O quê**: `text-gray-500` em input `rgba(0,0,0,0.2)` → ~4.1:1 (falha WCAG AA)
**Como**: Mudar placeholder para `text-gray-400`
**Arquivos**: `index.css` ou `InputGroup.tsx`
**Esforço**: 1min

### A-4: Modal sem Escape nem focus trap
**O quê**: DetailModal no HistoryTab não fecha com Escape, não tem `aria-modal`
**Como**: Adicionar `onKeyDown={e => e.key === 'Escape' && onClose()}`, `role="dialog"`, `aria-modal="true"`
**Arquivos**: `HistoryTab.tsx`
**Esforço**: 10min

---

## 🟠 Semana 1 — UX Mobile & Onboarding

### B-1: Sticky Results Bar (mobile)
**O quê**: Barra inferior fixa mostrando Custo Total | Preço Venda | Lucro, sempre visível ao scrollar
**Como**: 
- Detectar mobile via `useMediaQuery` ou classe CSS
- `position: fixed; bottom: 0` com glass styling
- Mostrar apenas quando resultados > 0
**Arquivos**: `Calculator.tsx`
**Esforço**: 1-2h

### B-2: Campo "Nome do Produto"
**O quê**: Input no topo do formulário, usado no histórico em vez de "PLA - 50g"
**Como**: Adicionar input simples + atualizar `addToHistory` para incluir o nome
**Arquivos**: `Calculator.tsx`, `calculatorStore.ts`
**Esforço**: 30min

### B-3: Modo Rápido vs Completo
**O quê**: Toggle no topo: "Rápido" (5 seções essenciais) vs "Completo" (todas 8)
**Como**: Estado `quickMode` no store; render condicional das seções
**Arquivos**: `Calculator.tsx`, `calculatorStore.ts`
**Esforço**: 2-3h

### B-4: Labels com htmlFor/id
**O quê**: InputGroup e SelectGroup sem associação programática label↔input
**Como**: Gerar ID único (ex: `input-${label}`), adicionar `htmlFor` no label
**Arquivos**: `InputGroup.tsx`
**Esforço**: 20min

---

## 🟡 Semana 2 — Polimento

### C-1: Confirm antes de limpar histórico
**O quê**: `clearHistory` remove tudo sem confirmação
**Como**: Adicionar `confirm(t('calc.clearConfirm'))`
**Esforço**: 5min

### C-2: Diferenciar defaults de valores editados
**O quê**: Usuário não sabe se o valor é default ou foi alterado
**Como**: Badge sutil "default" ou borda diferente em valores modificados
**Esforço**: 2h

### C-3: Link do GitHub no footer
**O quê**: Footer sem link para o repositório
**Como**: Adicionar `<a href="...">` com ícone do GitHub
**Esforço**: 5min

---

## Ordem de Implementação Sugerida

```
A-3 (placeholder) → A-1 (foco) → A-4 (modal) → A-2 (touch targets)
        ↓
B-4 (labels) → B-1 (sticky bar) → B-2 (nome produto)
        ↓
B-3 (modo rápido) → C-1 (confirmar limpar) → C-2 (defaults) → C-3 (GitHub)
```

Começar pelos **A** (5 minutos cada, impacto alto em acessibilidade), depois **B** (melhorias mobile), depois **C** (polimento).
