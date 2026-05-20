import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header/Header'
import { Calculator } from '@/components/Calculator/Calculator'
import { CatalogTab } from '@/components/Catalog/CatalogTab'
import { HistoryTab } from '@/components/Calculator/HistoryTab/HistoryTab'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { InfillCalculator } from '@/components/Calculator/InfillCalculator'
import { FilamentInventory } from '@/components/Catalog/FilamentInventory'
import {
  Calculator as CalculatorIcon,
  Clock,
  Settings2,
  BarChart3,
  Grid3x3,
  Spool,
} from 'lucide-react'

type Tab = 'calculator' | 'dashboard' | 'catalog' | 'history' | 'infill' | 'inventory'

const TABS: { id: Tab; icon: React.ReactNode; labelKey: string; label: string }[] = [
  { id: 'calculator', icon: <CalculatorIcon className="w-[18px] h-[18px]" />, labelKey: 'nav.calculator', label: 'Calculadora' },
  { id: 'dashboard',  icon: <BarChart3 className="w-[18px] h-[18px]" />,      labelKey: 'nav.dashboard',  label: 'Dashboard' },
  { id: 'infill',     icon: <Grid3x3 className="w-[18px] h-[18px]" />,        labelKey: 'nav.infill',     label: 'Infill' },
  { id: 'inventory',  icon: <Spool className="w-[18px] h-[18px]" />,          labelKey: 'nav.inventory',  label: 'Filamentos' },
  { id: 'catalog',    icon: <Settings2 className="w-[18px] h-[18px]" />,      labelKey: 'nav.catalog',    label: 'Catálogo' },
  { id: 'history',    icon: <Clock className="w-[18px] h-[18px]" />,          labelKey: 'nav.history',    label: 'Histórico' },
]

function App() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('calculator')

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0 px-3 py-5 sticky top-[61px] h-[calc(100dvh-61px)] overflow-y-auto border-r border-white/[0.06]">
          <p className="label-xs px-3 mb-2">Navegação</p>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item w-full text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${activeTab === tab.id ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.icon}
              <span>{t(tab.labelKey)}</span>
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <a
              href="https://github.com/ils15/open3dcalc"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item w-full text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <svg className="w-[18px] h-[18px] shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4 11.5 11.5 0 0 1 3 .4c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 pb-28 lg:pb-8">
          <div className="animate-fade-up max-w-[1200px]">
            {activeTab === 'calculator' && <Calculator />}
            {activeTab === 'dashboard'  && <Dashboard />}
            {activeTab === 'infill'     && <InfillCalculator />}
            {activeTab === 'inventory'  && <FilamentInventory />}
            {activeTab === 'catalog'    && <CatalogTab />}
            {activeTab === 'history'    && <HistoryTab />}
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{ background: 'rgba(6,8,24,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
        aria-label="Navegação principal"
      >
        <div className="flex overflow-x-auto h-16 px-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-[52px] px-1 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                activeTab === tab.id
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-selected={activeTab === tab.id}
            >
              <span className={`transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[9px] font-semibold leading-none tracking-wide">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <footer className="hidden lg:block text-center text-xs text-slate-600 py-3 border-t border-white/[0.04]">
        <a
          href="https://github.com/ils15/open3dcalc"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-indigo-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none px-1 rounded"
        >
          Open3DCalc — Open Source · MIT License
        </a>
      </footer>
    </div>
  )
}

export default App
