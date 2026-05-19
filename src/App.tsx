import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header/Header'
import { Calculator } from '@/components/Calculator/Calculator'
import { CatalogTab } from '@/components/Catalog/CatalogTab'
import { HistoryTab } from '@/components/Calculator/HistoryTab/HistoryTab'
import { Calculator as CalculatorIcon, Clock, Settings2 } from 'lucide-react'

type Tab = 'calculator' | 'history' | 'catalog'

function App() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('calculator')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        <nav className="flex gap-1 mb-6 border-b border-white/10 pb-0" role="tablist">
          <button
            onClick={() => setActiveTab('calculator')}
            role="tab"
            aria-selected={activeTab === 'calculator'}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all focus-visible:outline-none ${
              activeTab === 'calculator'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
            }`}
          >
            <CalculatorIcon className="w-4 h-4" /> {t('nav.calculator')}
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            role="tab"
            aria-selected={activeTab === 'catalog'}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all focus-visible:outline-none ${
              activeTab === 'catalog'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
            }`}
          >
            <Settings2 className="w-4 h-4" /> {t('nav.catalog')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            role="tab"
            aria-selected={activeTab === 'history'}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all focus-visible:outline-none ${
              activeTab === 'history'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
            }`}
          >
            <Clock className="w-4 h-4" /> {t('nav.history')}
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'calculator' && <Calculator />}
          {activeTab === 'catalog' && <CatalogTab />}
          {activeTab === 'history' && <HistoryTab />}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-600 py-4 border-t border-white/5">
        <a href="https://github.com/ils15/open3dcalc" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
          Open3DCalc — Open Source · MIT License
        </a>
      </footer>
    </div>
  )
}

export default App
