# Política de Segurança do Open3DCalc

## Reportando Vulnerabilidades

Valorizamos a segurança do Open3DCalc. Se você encontrar uma vulnerabilidade de segurança:

1. **Não abra uma issue pública** — reporte por email ou channel privado
2. Envie um email para **ils15@github.com** com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Impacto estimado
   - Sugestão de correção (se houver)

## Processo de Resposta

- ✅ Confirmação de recebimento em até **48h**
- 🔄 Atualizações a cada **7 dias** até a resolução
- 🏆 Crédito público ao reporter após o fix (se desejado)
- 📦 Patch release dentro de **14 dias** para vulnerabilidades críticas

## Escopo

Este projeto é um **aplicativo front-end React** que roda 100% no navegador. Não há backend, banco de dados ou servidor próprio. Vulnerabilidades potenciais incluem:

- XSS (Cross-Site Scripting)
- vazamento de dados do localStorage
- dependências com CVEs conhecidas

## Boas Práticas

- Sempre use a versão mais recente do Open3DCalc
- Mantenha seu navegador atualizado
- Revise as permissões se usar a versão PWA instalada
