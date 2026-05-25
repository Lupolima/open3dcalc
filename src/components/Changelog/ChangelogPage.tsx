import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, Github } from 'lucide-react'

interface VersionEntry {
  version: string
  date: string
  sections: { title: string; items: string[] }[]
}

const CHANGELOG_DATA: VersionEntry[] = [
  {
    version: '1.4.0',
    date: '2026-05-25',
    sections: [
      {
        title: '✨ Novo',
        items: [
          'Dedução Automática de Estoque — botão "Deduzir do Estoque" no ResultsPanel com dropdown de carretéis',
          'Dashboard Aprimorado — persistência localStorage, Break-Even, Margem Média, Tendência de Lucro',
          'Comparativo de Histórico — checkboxes, modal lado a lado com destaque verde/vermelho',
          'Importação JSON — file picker + importJson() com merge inteligente sem duplicatas',
        ],
      },
      {
        title: '🎨 UX',
        items: [
          'Dropdown de carretéis com indicador visual de cor, marca e peso restante',
          'Checkbox nos registros do histórico com destaque ao selecionar',
          'Feedback visual de sucesso na dedução e importação',
        ],
      },
      {
        title: '🔧 Técnico',
        items: [
          'ResultsPanel.tsx: integração com useFilamentInventory, dropdown com click-outside',
          'Dashboard.tsx: persistência localStorage, break-even, AreaChart com gradiente',
          'ComparisonModal.tsx: focus trap, ESC close, 10 campos comparativos',
          'HistoryTab.tsx: selectedForCompare, file input com FileReader',
          '14 novas chaves i18n em pt-BR e en-US',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-05-25',
    sections: [
      {
        title: '✨ Novo',
        items: [
          'Sistema Multi-Moeda — suporte a BRL/USD/EUR/GBP com auto-detecção',
          'Seletor de Moeda no Header — dropdown com opções Automático, BRL, USD, EUR, GBP',
          'Inventário Reformulado — SVG spool icons, busca, filtros, edição, paleta de cores',
          'Status de Carretéis — campo status e purchaseStore com migração automática',
          'Custos Fixos na Navegação — seção adicionada à navegação lateral',
        ],
      },
      {
        title: '🎨 UX',
        items: [
          'Seletor de moeda com fallback automático (pt-BR → BRL)',
          'Loader "Carregando..." quando resultados estão nulos',
          'Labels e descrições internacionalizadas via i18n',
        ],
      },
      {
        title: '🔧 Técnico',
        items: [
          'lib/currency.ts + hooks/useCurrency.ts — formatação locale-aware',
          'calculatorStore: novo campo currency com persistência localStorage',
          'filamentInventory: novos campos colorHex, status, purchaseStore, updateSpool()',
          'Todas ocorrências de R$ substituídas pelo useCurrency hook',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-05-25',
    sections: [
      {
        title: '✨ Novo',
        items: [
          'Estrutura de Colaboração — CONTRIBUTING.md, templates de PR/issue, SECURITY.md',
          'CODEOWNERS — revisão automática para todo código',
          'MAINTAINERS.md — documentação de papéis e responsabilidades',
        ],
      },
      {
        title: '🔧 Técnico',
        items: [
          'CI/CD com jobs paralelos (lint, typecheck, test, build) + coverage report',
          'Husky + commitlint + lint-staged para validação automática',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-05-20',
    sections: [
      {
        title: '✨ Novo',
        items: [
          'AMS Multi-material — suporte a impressoras multifilamento (Bambu Lab, Prusa XL)',
          'Inventário → Calculadora — selecione carretéis para preencher custo/kg',
          'Catálogo → Calculadora — impressoras e materiais customizados nos selects',
          'Carregar do Histórico — snapshot completo restaurável na calculadora',
          'Auto-save — formulário salvo a cada 800ms + beforeunload',
          'ConfirmDialog — modal estilizado substituindo confirm() nativo',
          'StoreBridge — orquestração entre stores',
        ],
      },
      {
        title: '🎨 UX',
        items: [
          'Unidades movidas para fora dos inputs — visual mais limpo',
          'Headers de seção simplificados — sem toggles "setinha"',
          'Grids responsivos — máximo 2 itens por linha',
          'Padding reduzido em cards e grids',
        ],
      },
      {
        title: '🔧 Técnico',
        items: [
          'Novos tipos: AMSSlot, PrinterProfile.maxFilaments, CalculationSnapshot',
          'calculatorStore: auto-save com debounce, loadHistoryItem()',
          'ConfirmDialog: focus trap, ESC close, 3 variantes',
          'Cálculo AMS integrado ao computeStoreResults()',
        ],
      },
    ],
  },
]

export function ChangelogPage() {
  const [expanded, setExpanded] = useState<string>('1.4.0')

  const toggleVersion = (version: string) => {
    setExpanded(prev => prev === version ? '' : version)
  }

  const totalChanges = CHANGELOG_DATA.reduce(
    (sum, v) => sum + v.sections.reduce((s, sec) => s + sec.items.length, 0),
    0,
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold gradient-text">Changelog</h2>
        </div>
        <p className="text-xs text-gray-500">
          {CHANGELOG_DATA.length} versões · {totalChanges} mudanças
        </p>
      </div>

      {/* Version timeline */}
      <div className="relative space-y-4">
        {CHANGELOG_DATA.map((entry, idx) => {
          const isOpen = expanded === entry.version
          return (
            <div key={entry.version} className="glass rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => toggleVersion(entry.version)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.03] transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-indigo-600/30 text-indigo-300' : 'bg-white/5 text-gray-400'
                  }`}>
                    {entry.version.split('.')[1]}
                  </span>
                  <div>
                    <span className={`text-sm font-bold ${idx === 0 ? 'text-white' : 'text-gray-300'}`}>
                      v{entry.version}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{entry.date}</span>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 animate-fade-in border-t border-white/[0.06] pt-4">
                  {entry.sections.map(section => (
                    <div key={section.title}>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                        {section.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2 pl-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-xs text-gray-500">
          <a href="https://github.com/ils15/open3dcalc/releases" target="_blank" rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
            <Github className="w-3.5 h-3.5" />
            Ver todas as releases no GitHub
          </a>
        </p>
      </div>
    </div>
  )
}
