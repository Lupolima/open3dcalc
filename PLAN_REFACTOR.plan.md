# Plano de Refactoring — Open3DCalc

## Objetivo
Herdar a estrutura superior de cálculo do Impressao3DAgent (FDM + Resina, seções colapsáveis, hardware wear, pós-processamento, EPI, software, validação, tooltips) mantendo o que já temos de bom: STL/OBJ/3MF + preview 3D, glassmorphism, i18n, PWA, TypeScript strict, Tailwind v4, Storybook, marketplace models.

---

## O que MANTER do Open3DCalc atual

- ✅ STL/OBJ/3MF parser + mesh analysis (`mesh-analysis.service`)
- ✅ 3D preview (Three.js, react-three-fiber, drei)
- ✅ Glassmorphism design system (Tailwind v4)
- ✅ i18n pt-BR / en-US
- ✅ PWA + service worker
- ✅ TypeScript strict + Vite 8
- ✅ Storybook
- ✅ Própias presets de impressoras (Ender 3, Bambu, etc.) + imagens PNG/WebP
- ✅ Modelos de marketplace (Direto, Shopee, ML, Amazon, Etsy)
- ✅ 23 materiais cadastrados
- ✅ Dashboard com Recharts
- ✅ Histórico de produtos (ProductStore + localStorage)

## O que HERDAR do Impressao3DAgent

### Tipos (substituir `src/types/index.ts`)
Herança de `src/components/common/calculator/types.ts`:
- `MaterialStateFDM` (tipo, peso, custo/kg, densidade, eficiência carretel, purga)
- `MaterialStateResin` (tipo, volume ml, custo/L, densidade, margem perda)
- `PrintParameters` (tempo, potência, custo kWh, modo falha, taxa falha, multiplicador risco)
- `MachineCosts` (custo máquina, meses depreciação, horas/mês, manutenção)
- `FDMHardware` (bico: custo + vida kg, mesa: custo adesão)
- `ResinHardware` (LCD: custo + vida h, FEP: custo + vida prints)
- `FDMFinishing` (insumos lixa/pintura)
- `PostProcessingResin` (álcool: custo/L + vol, cura: minutos + watts)
- `LaborCosts` (setup min, pós min, valor hora)
- `OperationalCosts` (custo EPI/print)
- `SoftwareCosts` (mensalidade slicer, custo arquivo STL)
- `AdditionalCosts` (extras)
- `SalesParameters` (embalagem, frete, imposto %, marketplace %, margem %)
- `CalculationResult` (todos os campos de retorno)
- `HistoryItem` (tipo, timestamp, resumo, custo total, preço, lucro)

### Engine de Cálculo (substituir `src/lib/calculator.ts`)
Herança da lógica em `UnifiedCalculatorModule.tsx`:
- Material (FDM com eficiência + purga; Resina com margem perda)
- Energia (potência × tempo × custo kWh)
- Pós-processamento (álcool + cura UV para resina; insumos acabamento para FDM)
- Depreciação máquina (custo / meses / horas mês × tempo print)
- Desgaste hardware (bico proporcional ao peso; LCD proporcional às horas; FEP por print)
- EPI/Operacional
- Mão de obra (setup + pós × valor hora)
- Software (mensalidade diluída + custo arquivo)
- Extras
- Falha (percentual com multiplicador de risco ou valor fixo)
- Preço final (custo + margem) / (1 - taxas - marketplace)
- Lucro líquido

### Componente Calculador (substituir/refatorar `src/components/Calculator/`)
Herança da estrutura do `UnifiedCalculatorModule.tsx`:
- Aba FDM | Aba Resina (em vez de abas Peça/Máquina/Precificação)
- `ToggleCard` — seções colapsáveis com enable/disable
- `InputGroup` + `SelectGroup` — inputs padronizados com tooltip, erro, prefixo, unidade
- `ToggleSwitch` — toggles individuais dentro de seções
- Painel resumo com gráfico PieChart + breakdown hierárquico + copy-to-clipboard

### Funcionalidades Novas
- Salvar/carregar configurações entre sessões (localStorage)
- Salvamento automático com nome
- Multiplicador de complexidade/risco
- Eficiência do carretel (%)
- Purga para AMS/multicolor
- Botões Exportar PDF + DOCX (já temos @react-pdf/renderer instalado)

---

## Fases da Implementação

### Fase R1 — Tipos + Engine (backend)
- [ ] Substituir `src/types/index.ts` pelos tipos unificados (FDM + Resina)
- [ ] Reescrever `src/lib/calculator.ts` com engine completo herdado
- [ ] Atualizar `src/lib/materials.ts` (separar FDM de Resina)
- [ ] Atualizar `src/lib/printers.ts` com novos campos
- [ ] Adicionar `src/lib/__tests__/calculator.test.ts` com testes para FDM + Resina

### Fase R2 — Componentes Compartilhados (UI kit)
- [ ] Criar `ToggleCard` (seção colapsável com toggle)
- [ ] Criar `ToggleSwitch` (switch individual)
- [ ] Criar `InputGroup` (input + label + prefixo + unidade + tooltip + erro)
- [ ] Criar `SelectGroup` (select + label + tooltip)
- [ ] Criar `SummaryRow` + `SummarySectionHeader` (breakdown hierárquico)
- [ ] Criar `Validation` helper (useValidation hook)

### Fase R3 — Substituir o Calculator (frontend)
- [ ] Refatorar `src/components/Calculator/`:
  - `ProductTab` → incorporado como seção Material FDM
  - `MachineTab` → seções Máquina + Hardware + Mão de obra
  - `PricingTab` → seção Vendas + Extras
  - `HistoryTab` → sidebar histórico + salvar config
- [ ] Adicionar aba Resina com todos os campos específicos
- [ ] Integrar PieChart no sidebar (junto com resumo)
- [ ] Adicionar save/load configurações
- [ ] Adicionar Export PDF + DOCX

### Fase R4 — Limpeza
- [ ] Remover arquivos antigos do calculator que não são mais usados
- [ ] Atualizar stories do Storybook
- [ ] Atualizar testes
- [ ] Verificar i18n (novas chaves para resina, hardware, etc.)

---

## Após Refactoring — Próximas Features

### Fase 6 — Performance & Profissionalização
1. **Code-split Three.js** — `React.lazy` + `Suspense` no StlPreview
2. **PDF Export** — conectar botão com `@react-pdf/renderer`
3. **IndexedDB** — migrar histórico de localStorage para IndexedDB
4. **CRUD Impressoras** — criar/editar/excluir perfis personalizados
5. **Dark/Light Theme** — Tailwind `darkMode: 'class'` + localStorage

### Fase 7 — Avançadas
6. **Cloudflare na frente** — proxy DNS + security headers
7. **Umami analytics** — self-host gratuito
8. **Issue/PR templates** — para contribuição externa
9. **Dependabot** — atualizações automáticas de dependência

---

## Riscos e Decisões

| Risco | Mitigação |
|---|---|
| Perder a estrutura de marketplace (5 modelos) | Manter `marketplace.ts` e integrar no SalesParameters |
| Perder a integração com STL preview | Manter `stlParser.ts` / `mesh-analysis.service.ts` intacto; o peso do STL alimenta o `MaterialStateFDM.weightUsed` |
| Quebrar i18n | Mapear TODAS as novas chaves nos dois idiomas antes de trocar |
| Bundle aumentar com o novo código | Code-split Three.js é prioridade pós-refactoring |
| Testes existentes quebrarem | Manter teste do `calculator.ts` e adapter ao novo engine |
