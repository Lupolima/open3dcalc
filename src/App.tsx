import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/Header/Header'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { ProductTab } from '@/components/Calculator/ProductTab/ProductTab'
import { MachineTab } from '@/components/Calculator/MachineTab/MachineTab'
import { PricingTab } from '@/components/Calculator/PricingTab/PricingTab'
import { HistoryTab } from '@/components/Calculator/HistoryTab/HistoryTab'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { useProductStore } from '@/stores/productStore'

type Tab = 'product' | 'machine' | 'pricing' | 'history'

const tabs: { id: Tab; icon: string }[] = [
  { id: 'product', icon: '📦' },
  { id: 'machine', icon: '⚙️' },
  { id: 'pricing', icon: '📈' },
  { id: 'history', icon: '📁' },
]

function App() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('product')
  const calculate = useCalculatorStore(s => s.calculate)
  const inputs = useCalculatorStore(s => s.inputs)
  const result = useCalculatorStore(s => s.result)
  const saveProduct = useProductStore(s => s.save)

  const handleCalculate = useCallback(() => {
    calculate()
    setActiveTab('pricing')
  }, [calculate])

  const handleSave = useCallback(() => {
    if (!inputs.productName.trim()) {
      alert('Informe o nome do produto.')
      return
    }
    calculate()
    const currentResult = useCalculatorStore.getState().result
    if (currentResult) {
      saveProduct(inputs.productName, currentResult)
      setActiveTab('history')
    }
  }, [inputs.productName, calculate, saveProduct])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        <Dashboard result={result} />

        <nav className="glass rounded-xl flex p-1 mb-5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.icon} {t(`nav.${tab.id}`)}
            </button>
          ))}
        </nav>

        <div className="tab-content">
          {activeTab === 'product' && <ProductTab />}
          {activeTab === 'machine' && <MachineTab />}
          {activeTab === 'pricing' && <PricingTab onCalculate={handleCalculate} onSave={handleSave} />}
          {activeTab === 'history' && <HistoryTab />}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-500 py-4">
        Open3DCalc — Open Source • MIT License
      </footer>
    </div>
  )
}

export default App
