# Changelog

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
