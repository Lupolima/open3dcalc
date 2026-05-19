import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header/Header'
import { Calculator } from '@/components/Calculator/Calculator'
import { HistoryTab } from '@/components/Calculator/HistoryTab/HistoryTab'
import { HelpCircle, Clock } from 'lucide-react'

type Tab = 'calculator' | 'history'

function App() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('calculator')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 pb-20 md:pb-4">
        <nav className="glass rounded-xl flex p-1 mb-5" role="tablist">
          <button
            onClick={() => setActiveTab('calculator')}
            role="tab"
            aria-selected={activeTab === 'calculator'}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
              activeTab === 'calculator'
                ? 'bg-white/10 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> {t('nav.calculator')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            role="tab"
            aria-selected={activeTab === 'history'}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
              activeTab === 'history'
                ? 'bg-white/10 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" /> {t('nav.history')}
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'calculator' ? <Calculator /> : <HistoryTab />}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 py-4">
        <a href="https://github.com/ils15/open3dcalc" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
          Open3DCalc — Open Source • MIT License
        </a>
      </footer>
    </div>
  )
}

export default App
