# Contribuindo para o Open3DCalc

> Obrigado por considerar contribuir! 🎉 Este guia descreve o fluxo completo para contribuir com o projeto.

## 📋 Índice

- [Fluxo de Contribuição](#fluxo-de-contribuição)
- [Antes de Começar](#antes-de-começar)
- [Passo a Passo](#passo-a-passo)
  1. [Fork + Clone](#1-fork--clone)
  2. [Crie sua Branch](#2-crie-sua-branch)
  3. [Commit (Conventional Commits)](#3-commit-conventional-commits)
  4. [Testes & Lint](#4-testes--lint)
  5. [Abra o Pull Request](#5-abra-o-pull-request)
  6. [Code Review](#6-code-review)
  7. [Merge](#7-merge)
- [Política de Branches](#política-de-branches)
- [Regras de Proteção (main)](#regras-de-proteção-main)
- [Pull Request Checklist](#pull-request-checklist)
- [Code Review — O que Avaliamos](#code-review--o-que-avaliamos)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Reportando Bugs](#reportando-bugs)
- [Dúvidas](#dúvidas)

---

## Fluxo de Contribuição

Toda alteração no Open3DCalc segue este fluxo:

```
Fork → Branch → Commit → Push + PR → Code Review → Merge
```

⏱ **Meta:** PR revisado e mergeado em até 48h úteis.

---

## Antes de Começar

1. Leia o [README](README.md) para entender o estado atual
2. Verifique as [issues abertas](https://github.com/ils15/open3dcalc/issues) — alguém já está trabalhando nisso?
3. **Para features grandes**, abra uma issue primeiro para discussão antes de codificar
4. Confira se não há [PR duplicado](https://github.com/ils15/open3dcalc/pulls)

---

## Passo a Passo

### 1. Fork + Clone

```bash
# Faça o fork pelo GitHub, depois:
git clone https://github.com/seu-usuario/open3dcalc.git
cd open3dcalc
git remote add upstream https://github.com/ils15/open3dcalc.git
git fetch upstream
```

### 2. Crie sua Branch

Cada funcionalidade/correção = **uma branch + um Pull Request**.

| Prefixo     | Quando usar         | Exemplo                         |
| ----------- | ------------------- | ------------------------------- |
| `feature/`  | Nova funcionalidade | `feature/comparativo-historico` |
| `fix/`      | Correção de bug     | `fix/auto-save-loop`            |
| `docs/`     | Documentação        | `docs/contributing-guide`       |
| `refactor/` | Refatoração         | `refactor/storebridge`          |
| `test/`     | Testes              | `test/calculator-coverage`      |
| `chore/`    | Config/infra        | `chore/update-deps`             |

```bash
# Crie a branch a partir da main atualizada
git checkout main
git pull upstream main
git checkout -b feature/minha-feature
```

### 3. Commit (Conventional Commits)

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo opcional>): <descrição no imperativo>

[corpo opcional — explique o PORQUÊ, não o que]
```

**Tipos permitidos:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`

**Escopos comuns no monorepo:**
- Componentes React: `(calculator)`, `(catalog)`, `(dashboard)`
- Stores: `(stores)`, `(calculatorStore)`
- Infra: `(electron)`, `(db)`, `(pwa)`, `(ci)`
- Docs: `(readme)`, `(contributing)`

**Exemplos:**

- `feat(history): adicionar comparativo lado a lado de registros`
- `fix(inventory): corrigir dedução de peso com valores negativos`
- `docs(readme): atualizar seção de instalação local`
- `refactor(store): extrair lógica de bridge para hook`
- `test(calculator): adicionar cobertura para cálculo de resina`
- `chore(electron): atualizar electron-builder para v26`

### 4. Testes & Lint

Antes de commitar, rode **obrigatoriamente**:

```bash
npm run lint          # ESLint — zero erros
npm run typecheck     # TypeScript — zero erros
npm run test:run     # Vitest — todos verdes
npm run build:all    # Build de produção — sucesso
```

> 💡 **Dica:** Se instalou os hooks do Husky (recomendado), isso roda automaticamente no commit.

> **Nota para alterações no Electron main process:** rode também `npm run typecheck:electron` para verificar o tipo do processo principal.

### 5. Abra o Pull Request

1. Faça push da sua branch:
   ```bash
   git push origin feature/minha-feature
   ```
2. Abra o PR no GitHub — o template vai guiar você
3. **Todo PR deve:**
   - Referenciar a issue relacionada (`Closes #12`)
   - Descrever o que foi feito e **por quê**
   - Incluir screenshots se mudar a UI (antes/depois)
   - Confirmar que testes/lint/build passam
   - Listar breaking changes se houver

### 6. Code Review

- Mínimo de **1 approval** de um mantenedor
- Discussões construtivas — foque no código, não na pessoa
- Resolva todas as conversas antes do merge
- PRs de **documentação** podem ser mergeados com 0 approvals após 24h

### 7. Merge

- Usamos **Squash & Merge** — todos os commits da branch viram um único commit na `main`
- A mensagem do squash deve seguir Conventional Commits
- A branch é deletada automaticamente após o merge
- Pare de usar a branch local após o merge: `git checkout main && git pull upstream main && git branch -d feature/minha-feature`

---

## Política de Branches

| Branch      | Protegida | Push direto | PR obrigatório | Approvals |
| ----------- | --------- | ----------- | -------------- | --------- |
| `main`      | ✅        | ❌          | ✅             | ≥ 1       |
| `feature/*` | ❌        | ✅          | N/A            | N/A       |
| `fix/*`     | ❌        | ✅          | N/A            | N/A       |

### Regras de Proteção (main)

- ❌ **Sem push direto** para main em hipótese alguma
- ✅ **PR obrigatório** com pelo menos 1 approval
- ✅ **CI obrigatório** — lint, typecheck, test e build devem passar
- ✅ **Branch atualizada** com main antes do merge (evitar conflitos)
- ✅ **Squash merge** apenas — histórico linear

---

## Pull Request Checklist

- [ ] Testes unitários foram escritos/atualizados para a mudança
- [ ] `npm run lint` — sem erros
- [ ] `npm run typecheck` — sem erros
- [ ] `npm run test:run` — todos passando
- [ ] `npm run build:all` ou `npm run build:web`/`npm run build:desktop` conforme escopo
- [ ] Cobertura ≥ 80% (para lógica de cálculo)
- [ ] i18n atualizado: pt-BR + en-US
- [ ] Documentação atualizada (README se aplicável)
- [ ] Screenshots anexados (se mudança de UI)
- [ ] CHANGELOG.md atualizado se for mudança relevante
- [ ] Para alterações no Electron: `npm run typecheck:electron` passou

---

## Code Review — O que Avaliamos

| Critério           | Descrição                                                 |
| ------------------ | --------------------------------------------------------- |
| **Funcionalidade** | Resolve o problema proposto? Cobre edge cases?            |
| **Código Limpo**   | Nomes claros, sem duplicação, sem `any`, funções pequenas |
| **Testes**         | Cobre fluxo principal + bordas + erro?                    |
| **Performance**    | Evita re-renders desnecessários? Lazy loading ok?         |
| **i18n**           | Toda string visível passa por `t()` do i18next?           |
| **Acessibilidade** | ARIA labels, contraste, navegação por teclado?            |
| **Segurança**      | Sem injeção de script, sem dados sensíveis expostos?      |

---

## Estrutura do Projeto

```
open3dcalc/
├── src/
│   ├── shared/           # Código compartilhado entre web e desktop
│   │   ├── components/   # Componentes React (Calculator, Catalog, Dashboard, UI)
│   │   ├── stores/       # Zustand stores (calculator, catalog, customer, history, etc)
│   │   ├── lib/          # Lógica de cálculo, parsers, export (PDF, CSV)
│   │   ├── hooks/        # Custom hooks React (useCurrency, useTheme)
│   │   ├── types/        # Tipos TypeScript
│   │   ├── i18n/         # Traduções pt-BR / en-US
│   │   └── test/         # Setup de testes
│   └── platform/
│       ├── desktop/      # Código específico do Electron (IPC, persistência SQLite)
│       └── web/          # Código específico do PWA (service worker, manifest)
├── db/                   # Database schema (Drizzle ORM + SQLite migrations)
├── electron/             # Electron main process (TypeScript)
├── web/                  # Código legado (histórico git preservado)
├── desktop/              # Código legado desktop (histórico git preservado)
├── vite.base.config.ts   # Config base do Vite (compartilhada)
├── vite.web.config.ts    # Config Vite para web
├── vite.desktop.config.ts# Config Vite para desktop
└── index.web.html        # Entry point web
```

### Onde colocar o código

| Tipo de código                          | Diretório destino            |
| --------------------------------------- | ---------------------------- |
| Componente React usado em web e desktop | `src/shared/components/`     |
| Store Zustand                           | `src/shared/stores/`         |
| Lógica de cálculo / parser              | `src/shared/lib/`            |
| Hook React                              | `src/shared/hooks/`          |
| Type/i18n/test utilities                | `src/shared/types/i18n/test` |
| Código exclusivo do Electron            | `src/platform/desktop/`      |
| Código exclusivo do PWA                 | `src/platform/web/`          |
| Main process Electron                  | `electron/`                  |
| Migração de banco                       | `db/`                        |

### Scripts Disponíveis (raiz)

| Comando               | Descrição                                       |
| --------------------- | ----------------------------------------------- |
| `npm run dev:web`     | Servidor de desenvolvimento Vite (web)          |
| `npm run dev:desktop` | Desenvolvimento Electron + hot-reload           |
| `npm run build:web`   | Build de produção web                           |
| `npm run build:desktop`| Build de produção desktop (Vite)               |
| `npm run build:all`   | Build web + desktop                             |
| `npm run build:electron`| Compila Electron main process (TypeScript)    |
| `npm run test`        | Testes com Vitest (modo watch)                  |
| `npm run test:run`    | Testes com Vitest (modo run)                    |
| `npm run typecheck`   | TypeScript type checking (`tsc --noEmit`)       |
| `npm run typecheck:electron` | TypeScript check do Electron main process |
| `npm run lint`        | ESLint em todo o projeto                        |
| `npm run db:generate` | Gera migrações Drizzle ORM                      |
| `npm run db:migrate`  | Executa migrações SQLite                        |

---

## Reportando Bugs

Abra uma issue usando o template de **Bug Report** com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs real
- Screenshots se aplicável
- Ambiente (navegador, OS, versão do app)

---

## Dúvidas?

- Abra uma [Discussion](https://github.com/ils15/open3dcalc/discussions) para perguntas gerais
- Issues são para bugs e features específicas

## Código de Conduta

Todo contribuidor deve seguir nosso [Código de Conduta](CODE_OF_CONDUCT.md). Seja respeitoso — contribuições são bem-vindas independentemente de nível de experiência.
