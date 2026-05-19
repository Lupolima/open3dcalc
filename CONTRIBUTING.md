# Contribuindo para o Open3DCalc

Obrigado por considerar contribuir! 🎉

## Como contribuir

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça suas alterações
4. Rode os testes: `npm run test:run`
5. Verifique o lint: `npm run lint`
6. Commit: `git commit -m "feat: descrição clara"`
7. Push: `git push origin feature/minha-feature`
8. Abra um Pull Request

## Convenções

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Componentes:** Cada componente em sua própria pasta com index export
- **Testes:** Testes unitários para toda lógica de cálculo
- **i18n:** Toda string visível deve passar pelo `t()` do i18next
- **TypeScript:** Strict mode, sem `any`

## Reportando bugs

Abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs real
- Screenshots se aplicável

## Código de Conduta

Seja respeitoso. Contribuições são bem-vindas independentemente de nível de experiência.
