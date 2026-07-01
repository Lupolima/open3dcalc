# 🌿 Open3DCalc — Branch & PR Policy

> **Data:** Julho 2026
> **Objetivo:** Garantir rastreabilidade total de novas funcionalidades através de branches + Pull Requests.

## 📋 Regras

### 1. Toda nova funcionalidade → branch + PR

Nenhuma alteração significativa vai diretamente para `main`. Toda nova feature, melhoria ou fix estrutural deve:

1. Criar uma branch a partir de `main`:
   ```bash
   git checkout -b feat/<nome-da-feature>
   ```
2. Desenvolver com commits seguindo [Conventional Commits](https://www.conventionalcommits.org/)
3. Abrir um Pull Request para `main`
4. Passar por review (mínimo 1 approval)
5. CI/CD deve passar (lint, typecheck, testes, build)

### 2. Nomenclatura de branches

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Feature | `feat/` | `feat/dark-mode-pdf-export` |
| Fix | `fix/` | `fix/currency-conversion-bug` |
| Infra/Docs | `chore/` | `chore/update-docker-compose` |
| Release | `release/` | `release/v1.9.0` |

### 3. Limpeza pós-merge

Branches mergeadas são deletadas automaticamente pelo GitHub (opção "Delete branch" no PR) e localmente:

```bash
git branch -d <branch>
git push origin --delete <branch>
```

### 4. Deepwork excepcional

Para tarefas complexas (multi-turno, multi-agente), o fluxo continua via `/deepwork`, mas o **resultado final sempre gera um PR** para merge em `main`.

### 5. Branches atuais

| Branch | Status | Ação |
|--------|--------|------|
| `feature/fase2-complete` | ✅ Deletada | Já implementada em main (v1.8 Bifrost) |
| `feature/fase2-historico-unificado` | ✅ Deletada | Contida em fase2-complete (também já em main) |

---

_Esta política substitui o fluxo anterior onde múltiplas branches obsoletas poluíam o repositório._
