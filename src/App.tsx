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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4">
        <nav className="glass rounded-xl flex p-1 mb-5">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'calculator'
                ? 'bg-white/10 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> {t('nav.calculator')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
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
        Open3DCalc — Open Source • MIT License
      </footer>
    </div>
  )
}

export default App
