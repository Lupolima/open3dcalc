import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { marketplaces } from '@/lib/marketplace'

interface PricingTabProps {
  onCalculate: () => void
  onSave: () => void
}

export function PricingTab({ onCalculate, onSave }: PricingTabProps) {
  const { t } = useTranslation()
  const { inputs, setInput, setMarketplace } = useCalculatorStore()

  return (
    <div className="glass rounded-2xl p-5 animate-fade-in">
      <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
        {t('pricing.title')}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('pricing.marketplace')}</label>
          <select
            value={inputs.marketplace.id}
            onChange={e => {
              const mp = marketplaces.find(m => m.id === e.target.value)
              if (mp) setMarketplace(mp)
            }}
            className="w-full px-4 py-2.5 rounded-xl text-sm"
          >
            {marketplaces.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('pricing.markup')}</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="500"
              value={inputs.markup}
              onChange={e => setInput('markup', parseInt(e.target.value))}
              className="flex-1 accent-purple-500"
            />
            <span className="text-sm font-semibold text-purple-400 min-w-[4rem] text-right">{inputs.markup}%</span>
          </div>
        </div>

        <button
          onClick={onCalculate}
          className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all"
        >
          {t('pricing.calculate')}
        </button>

        <button
          onClick={onSave}
          className="w-full py-3 rounded-xl text-sm font-semibold glass text-gray-200 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          {t('pricing.save')}
        </button>
      </div>
    </div>
  )
}
