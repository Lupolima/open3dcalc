# 🚀 Release — Open3DCalc

**Fluxo:** Manual via GitHub Actions (nunca automático).

## Pré-requisitos

- [ ] CI/CD passando (lint + typecheck + test + build)
- [ ] `main` atualizada com todas as mudanças desejadas
- [ ] Nenhum commit com `[skip ci]` não intencional

## Triggerar Release

### Pelo GitHub (recomendado)

1. Ir em: **Actions → Release → Run workflow**
2. Branch: `main`
3. **Bump type:**
   - `auto` → detecta automaticamente dos commits (recomendado)
   - `patch` → 1.8.2 → 1.8.3 (bug fixes)
   - `minor` → 1.8.2 → 1.9.0 (novas features)
   - `major` → 1.8.2 → 2.0.0 (breaking changes)
4. Clicar **Run workflow**

### O que o workflow faz

```
1. npm ci                    → instala dependências
2. npx changelogen --bump    → bump versão + gera CHANGELOG.md
3. npm run build:all         → build web + desktop
4. npm run build:electron    → build electron main process
5. npx electron-builder      → gera .exe (Windows) + .AppImage (Linux)
6. git commit + tag          → commit "chore(release): vX.Y.Z"
7. gh release create         → publica no GitHub Releases
```

### Artefatos gerados

| Plataforma | Formato | Local |
|------------|---------|-------|
| Web | PWA (vite build) | `dist-web/` |
| Windows | `.exe` (portable/installer) | `dist-electron/` |
| Linux | `.AppImage` | `dist-electron/` |

## Após o Release

- [ ] Verificar se a release apareceu em: https://github.com/ils15/open3dcalc/releases
- [ ] Verificar se os artefatos (.exe, .AppImage) estão anexados
- [ ] Testar o .exe em Windows (opcional)
- [ ] Atualizar o site (se houver deploy separado)

## Rollback (se necessário)

```bash
git revert <tag>
git push origin main
# Triggerar nova release com patch bump
```

## Exemplo: v1.9.0 (atual)

```bash
# CI/CD passou ✅
# Ir em: Actions → Release → Run workflow
# Bump: minor (1.8.2 → 1.9.0)
# Aguardar ~10-15 min
# Release em: https://github.com/ils15/open3dcalc/releases/tag/v1.9.0
```
