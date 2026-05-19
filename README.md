# Open3DCalc

> Calculadora 3D Livre & Open-Source para precificação de impressões 3D

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live-brightgreen)](https://ils15.github.io/open3dcalc/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8)](https://web.dev/progressive-web-apps/)

---

## 📋 Índice

- [O que é](#-o-que-é)
- [Funcionalidades](#-funcionalidades)
- [Como Usar](#-como-usar)
  - [Calculadora FDM](#calculadora-fdm)
  - [Calculadora Resina](#calculadora-resina)
  - [Dashboard](#dashboard)
  - [Infill Calculator](#infill-calculator)
  - [Inventário de Filamentos](#inventário-de-filamentos)
  - [Cadastros](#cadastros)
  - [Histórico](#histórico)
- [Seções do Cálculo](#-seções-do-cálculo)
- [Upload de Arquivos 3D](#-upload-de-arquivos-3d)
- [Marketplaces](#-marketplaces)
- [Exportação](#-exportação)
- [Instalação Local](#-instalação-local)
- [Tecnologias](#-tecnologias)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 O que é

Open3DCalc é uma calculadora de custos completa para impressão 3D, projetada para makers, pequenas empresas e profissionais que precisam precificar corretamente suas impressões.

Suporta **FDM** (filamento) e **Resina** (SLA/DLP), com cálculo detalhado de:

- Material (filamento/resina + purga + eficiência do carretel)
- Energia elétrica
- Depreciação da máquina
- Desgaste de hardware (bico, mesa, LCD, FEP)
- Mão de obra (setup + pós-processamento)
- Custos operacionais (EPIs, software, modelos)
- Taxas de falha
- Embalagem e frete
- Taxas de marketplace e impostos
- Margem de lucro

---

## ✨ Funcionalidades

### Core
- ✅ **Cálculo FDM completo** — filamento, purga, eficiência do carretel, bico, mesa, acabamento
- ✅ **Cálculo Resina completo** — resina, lavagem, cura UV, LCD, FEP
- ✅ **Upload STL/OBJ/3MF** — análise automática de volume, peso estimado, preview 3D
- ✅ **Upload G-code** — extrai tempo de impressão e consumo de filamento automaticamente
- ✅ **80+ impressoras** pré-cadastradas (Bambu Lab, Creality, Prusa, Elegoo, etc.)
- ✅ **31 materiais** pré-cadastrados (PLA, PETG, ABS, TPU, Nylon, etc.)
- ✅ **6 marketplaces** com taxas atualizadas (Shopee 2 faixas, Mercado Livre, Amazon, Etsy)
- ✅ **Modo rápido** — esconde campos avançados para cálculos simples
- ✅ **Seções toggle** — marque/desmarque quais custos incluir no cálculo
- ✅ **Cálculo de lote** — quantidade dilui custos fixos (setup, mão de obra)
- ✅ **Custo por grama** — exibido automaticamente nos resultados

### Dashboard
- 📊 **KPIs em tempo real** — custo total, preço de venda, lucro, ROI
- 📈 **Gráfico de pizza** — distribuição visual dos custos
- 💰 **Projeção mensal** — input prints/mês → receita, custo, lucro mensal e anual
- 🎯 **Modo margem alvo** — defina preço de venda desejado → calcula margem real
- 🔄 **Print vs Buy** — compare custo de imprimir vs comprar pronto

### Ferramentas
- 🔲 **Infill Calculator** — veja como % de infill afeta peso, custo e tempo
- 🧵 **Inventário de Filamentos** — rastreie carretéis com barras de progresso e alertas
- 📋 **SKU Manager** — salve configurações com tags, categorias e favoritos
- 📄 **Export PDF** — relatório detalhado de custos
- 📊 **Export CSV** — dados em formato planilha
- 🔌 **API JSON** — payload padronizado para sistemas externos

### UX
- 🌐 **i18n** — Português (BR) e Inglês (US)
- 📱 **Responsivo** — mobile-first com navegação inferior
- 📲 **PWA** — instalável como app nativo
- 🎨 **UI moderna** — glassmorphism, animações, dark theme
- 💾 **Persistência** — configurações e histórico salvos em localStorage

---

## 📖 Como Usar

### Calculadora FDM

1. **Selecione a aba "Impressão FDM"** no topo
2. **Material** — Escolha o tipo de filamento, peso da peça, custo/kg, densidade
3. **Parâmetros** — Tempo de impressão, potência, custo de energia
4. **Hardware** — Configure bico, mesa e acabamento
5. **Máquina** — Valor da impressora, depreciação, horas/mês
6. **Mão de Obra** — Tempo de setup, pós-processamento, valor/hora
7. **Operacional** — EPIs, custo de slicer, modelo STL
8. **Vendas** — Embalagem, frete, marketplace, impostos, margem de lucro
9. **Resultados** — Veja preço de venda, custo total, lucro e distribuição

**Dica:** Arraste um arquivo `.stl`, `.obj` ou `.3mf` para auto-preencher o peso!

### Calculadora Resina

Mesmo fluxo do FDM, mas com campos específicos:
- Volume de resina (ml) em vez de peso
- Lavagem (álcool) e cura UV
- Hardware LCD/FEP em vez de bico/mesa

### Dashboard

Acesse pela aba **"Dashboard"** na navegação principal:

- **KPIs** — Veja custo, preço, lucro e ROI do último cálculo
- **Gráfico** — Distribuição visual dos custos por categoria
- **Projeção Mensal** — Insira prints/mês para ver receita, custo e lucro projetados
- **Margem Alvo** — Digite um preço de venda desejado e veja a margem real
- **Print vs Buy** — Compare o custo de imprimir com o preço de compra

### Infill Calculator

Acesse pela aba **"Infill Calc"**:

1. Insira dimensões da peça (largura, profundidade, altura)
2. Configure espessura de parede e camadas topo/base
3. Escolha o material
4. Ajuste o % de infill
5. Veja a tabela comparativa com 7 níveis de infill

### Inventário de Filamentos

Acesse pela aba **"Filamentos"**:

1. Clique em **"+ Novo Carretel"**
2. Preencha marca, material, cor, peso, custo/kg
3. Use os botões **-10g**, **-50g**, **-100g** para deduzir peso após cada print
4. Acompanhe barras de progresso e alertas de estoque baixo

### Cadastros

Gerencie impressoras, materiais e marketplaces:

- **Impressoras** — 80+ modelos pré-cadastrados com busca e agrupamento por marca
- **Materiais** — 31 tipos com densidade e preço médio
- **Marketplaces** — Taxas atualizadas (Shopee 2 faixas, ML, Amazon, Etsy)

**Auto-preenchimento:** Selecione um item existente no dropdown e os campos preenchem automaticamente.

### Histórico

- Salve cálculos com **"Adicionar ao Histórico"**
- Pesquise por nome ou material
- Exporte todos os dados como JSON
- Limpe o histórico quando necessário

---

## 🔧 Seções do Cálculo

Clique no painel **"Seções do Cálculo"** para marcar/desmarcar quais custos incluir:

| Seção | Ícone | Descrição |
|---|---|---|
| Material | 🧵 | Custo do filamento/resina + purga |
| Energia | ⚡ | Custo de energia elétrica |
| Máquina | 🖨️ | Depreciação + manutenção |
| Hardware | 🔧 | Bico, mesa, LCD, FEP |
| Consumíveis | 🛡️ | EPIs por print |
| Mão de Obra | 👷 | Setup + pós-processamento |
| Software | 💻 | Slicer + modelo STL |
| Falhas | ⚠️ | Buffer de falhas (%) |
| Extras | 📦 | Custos adicionais livres |
| Acabamento | 🎨 | Lixas, primer, tintas |
| Embalagem | 📋 | Custo de embalagem |
| Frete | 🚚 | Custo de envio |

Seções desmarcadas são zeradas no cálculo final.

---

## 📁 Upload de Arquivos 3D

### Formatos Suportados

| Formato | Extensão | Parser |
|---|---|---|
| STL | `.stl` | Three.js STLLoader |
| OBJ | `.obj` | Three.js OBJLoader |
| 3MF | `.3mf` | ZIP + XML nativo |
| G-code | `.gcode` | Parser de comentários + comandos |

### O que é extraído

- **STL/OBJ/3MF**: Volume (cm³), faces, vértices, peso estimado, preview 3D
- **G-code**: Tempo de impressão, filamento usado (mm/g), temperatura, slicer

### Limites

- Tamanho máximo: **50MB**
- Máximo de triângulos: **2 milhões**
- Preview 3D com controles de órbita (mouse/touch)

---

## 🏪 Marketplaces

| Marketplace | Comissão | Taxa Fixa | Frete Grátis |
|---|---|---|---|
| Venda Direta | 0% | R$ 0 | Não |
| Shopee (até R$79) | 20% | R$ 4 | Sim |
| Shopee (R$80+) | 14% | R$ 16 | Sim |
| Mercado Livre | 16% | R$ 6,50 | Sim |
| Amazon | 15% | R$ 0 | Não |
| Etsy | 6,5% | R$ 3 | Não |

> **Nota:** Taxas Shopee atualizadas em Março/2026 com nova estrutura por faixas de preço.

---

## 📤 Exportação

### PDF
- Relatório detalhado com todas as seções de custo
- Download automático como `open3dcalc_relatorio.pdf`

### CSV
- Dados tabulares para abrir no Excel/Google Sheets
- Download como `open3dcalc_resultado.csv`

### JSON (API)
- Payload padronizado para integração com sistemas externos
- Inclui custos, pricing, print info e metadados

---

## 💻 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/ils15/open3dcalc.git
cd open3dcalc

# Instale dependências
npm install

# Rode em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rode testes
npm run test

# Abra Storybook
npm run storybook
```

### Requisitos
- Node.js 18+
- npm 9+

### Scripts Disponíveis
| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run test` | Testes com Vitest |
| `npm run lint` | Linting com ESLint |
| `npm run storybook` | Storybook |

---

## 🛠 Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Linguagem | TypeScript ~6.0 |
| CSS | Tailwind CSS 4 |
| State | Zustand 5 |
| 3D | Three.js + React Three Fiber + Drei |
| Charts | Recharts 2 |
| Animações | Framer Motion 12 |
| Ícones | Lucide React |
| i18n | i18next + react-i18next |
| PDF | @react-pdf/renderer |
| Testes | Vitest + Testing Library |
| Docs | Storybook |
| PWA | vite-plugin-pwa |
| CI/CD | GitHub Actions |

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

### Guidelines
- Siga o estilo de código existente
- Adicione testes para novas funcionalidades
- Mantenha i18n em pt-BR e en-US
- Documente novas features no README

---

## 📄 Licença

MIT License — veja [LICENSE](LICENSE) para detalhes.

---

## 🔗 Links

- **Live Demo**: https://ils15.github.io/open3dcalc/
- **Repositório**: https://github.com/ils15/open3dcalc
- **Issues**: https://github.com/ils15/open3dcalc/issues
