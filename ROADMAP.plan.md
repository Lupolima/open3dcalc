# Open3DCalc — Roadmap

> **Stack:** React 19 + Vite 8 + TypeScript strict + Tailwind CSS v4 + Three.js + Zustand + i18n + PWA
> **Host:** GitHub Pages (GitHub Actions CI/CD)
> **Ao vivo:** https://ils15.github.io/open3dcalc/

---

## Fase 0 — Fundação ✅ (Concluída)

- [x] Scaffold React + Vite + TypeScript strict
- [x] Tailwind v4 + design system (glassmorphism)
- [x] i18n pt-BR / en-US (react-i18next)
- [x] PWA (vite-plugin-pwa)
- [x] Vitest + React Testing Library
- [x] Storybook config

## Fase 1 — Engine de Cálculo ✅ (Concluída)

- [x] Motor completo: material, energia, depreciação, manutenção, mão de obra, embalagem, acabamento, falha, frete, impostos, taxa de cartão, marketplace
- [x] 23 materiais cadastrados (PLA, ABS, PETG, Nylon, PC, TPU, etc.)
- [x] 7 presets de impressoras (Ender 3 V2, Bambu A1 Mini, Bambu P1S, etc.)
- [x] 5 modelos de marketplace (Direto, Shopee, ML, Amazon, Etsy)
- [x] 7 testes unitários passando

## Fase 2 — Análise STL / Preview 3D ✅ (Concluída)

- [x] Parser STL + OBJ + 3MF (volume, área, validade, manifold)
- [x] Visualização 3D interativa (react-three-fiber + drei)
- [x] 5 STLs de exemplo em `/public/stl/`

## Fase 3 — Interface Glassmorphism ✅ (Concluída)

- [x] Dashboard com gráfico de pizza (Recharts) + cards de estatísticas
- [x] Abas: Peça | Máquina | Precificação | Salvos
- [x] Modal de detalhes
- [x] Hover e animações de transição

## Fase 4 — Histórico de Produtos ✅ (Concluída)

- [x] Produtos salvos no localStorage
- [x] Busca/filtro
- [x] Exportar JSON
- [x] Excluir produto

## Fase 5 — Infraestrutura Open Source ✅ (Concluída)

- [x] LICENSE (MIT)
- [x] README.md
- [x] CONTRIBUTING.md
- [x] CODE_OF_CONDUCT.md
- [x] CI/CD: lint → test → build → deploy (GitHub Actions)
- [x] Imagens de impressoras (Bambu, Creality, Anycubic)
- [x] Ícones PWA profissionais
- [x] mesh-analysis.service expandido (STL + OBJ + 3MF)
- [x] Engine expandido: taxas, frete, cartão, pós-processamento

---

## Fase 6 — Performance & Profissionalização 🔜

### 6.1 — Code-split Three.js
- **Problema:** Chunk Three.js ~1.5MB no bundle inicial
- **Solução:** Dynamic import (`React.lazy` + `Suspense`) no componente `StlPreview`
- **Impacto:** Redução drástica no tamanho do bundle inicial
- **Prioridade:** Alta

### 6.2 — PDF Export
- **Dependência já instalada:** `@react-pdf/renderer`
- **O quê:** Gerar PDF com resumo do orçamento (peça, materiais, custos, markup, preço final)
- **Prioridade:** Média

### 6.3 — IndexedDB para Histórico
- **Problema:** localStorage tem limite de ~5-10 MB
- **Solução:** Migrar histórico de produtos para IndexedDB (via `idb-keyval` ou wrapper simples)
- **Benefício:** Suporta centenas de produtos sem estourar cota
- **Prioridade:** Média

### 6.4 — CRUD de Perfis de Impressora
- **O quê:** Interface para criar/editar/excluir perfis de impressora personalizados
- **Por quê:** Usuários têm impressoras além dos 7 presets fixos
- **Prioridade:** Média

### 6.5 — Dark/Light Theme Toggle
- **O quê:** Alternador de tema claro/escuro com persistência
- **Abordagem:** CSS custom properties + Tailwind `darkMode: 'class'` + localStorage
- **Prioridade:** Baixa

---

## Fase 7 — Funcionalidades Avançadas 🔮

### 7.1 — Suporte a Resina (MSLA)
- **Desafio:** Engenharia de custos diferente (custo por ml de resina, diferentes tipos de resina, lavagem, cura UV)
- **Requer:** Novos materiais, nova máquina (impressoras MSLA), parâmetros de pós-processamento
- **Prioridade:** Média

### 7.2 — Cloudflare na Frente
- **O quê:** Configurar Cloudflare como proxy DNS para o domínio do projeto
- **Benefícios:** Banda ilimitada, security headers (CSP, HSTS), analytics, DDoS protection
- **Custo:** $0 (plano Free)
- **Prioridade:** Baixa (fazer quando o tráfego justificar)

### 7.3 — Analytics (Umami / Plausible)
- **O quê:** Self-host Umami para métricas de uso
- **Por quê:** GitHub Pages não fornece logs de acesso
- **Prioridade:** Baixa

### 7.4 — Cloudflare Pages (futura migração)
- **Quando:** Tráfego > 50 GB/mês ou necessidade de deploy previews
- **Benefício:** Build automático, banda ilimitada, workers serverless leves
- **Prioridade:** Futuro (gatilho: métricas)

---

## Fase 8 — Infraestrutura & Qualidade 🏗️

### 8.1 — Templates de Issue e PR
- `ISSUE_TEMPLATE/` (bug_report.md, feature_request.md)
- `PULL_REQUEST_TEMPLATE.md`
- **Prioridade:** Média

### 8.2 — Validação de Contribuição (CI)
- [ ] Lint automático em PRs (já existe)
- [ ] Testes obrigatórios passando (já existe)
- [ ] Verificação de build (já existe)
- [ ] Adicionar `size-label` para PRs
- [ ] Adicionar `dependabot.yml` para atualizações de dependência
- **Prioridade:** Média

### 8.3 — Testes
- [ ] Aumentar cobertura de testes unitários (engine)
- [ ] Adicionar testes de componentes (Storybook test runner / Vitest)
- [ ] Testes E2E (Playwright) — futuramente
- **Prioridade:** Baixa

### 8.4 — Acessibilidade
- [ ] Auditoria WCAG 2.1 (axe-core)
- [ ] Navegação por teclado
- [ ] Contraste de cores
- **Prioridade:** Baixa

---

## Próximo Passo Imediato

**Code-split Three.js (6.1)** — maior impacto com menor esforço. Reduz o bundle inicial de ~2 MB para ~500 KB. Os demais itens podem ser priorizados conforme interesse.

---

## Contexto Crítico

| Item | Detalhe |
|---|---|
| **CI/CD** | lint → test → build → deploy. Push to `main` → auto-deploy |
| **Dev** | `npm run dev` |
| **Build** | `npm run build` |
| **Testes** | `vitest run` (7/7 passando) |
| **TypeScript** | `tsc -b` compila limpo |
| **Storybook** | `npm run storybook` |
| **Git remote** | `git@github.com:ils15/open3dcalc.git` |
| **Repo de assets** | `/tmp/impressao3dagent/` (clone do ils15/Impressao3DAgent) |
| **Three.js warning** | Chunk de ~1.5MB — plan: lazy-load StlPreview |
| **Base URL** | `./` (relativo, compatível com GitHub Pages subpath) |
| **Branch deploy** | `gh-pages` via `actions/deploy-pages@v4` |
