import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { printers } from '@/lib/printers'

export function MachineTab() {
  const { t } = useTranslation()
  const { inputs, setInput, setPrinter } = useCalculatorStore()

  const handlePrinterChange = (id: string) => {
    const printer = printers.find(p => p.id === id)
    if (printer) setPrinter(printer)
  }

  return (
    <div className="glass rounded-2xl p-5 animate-fade-in">
      <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
        {t('machine.title')}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('machine.printer')}</label>
          <select
            value={inputs.printer.id}
            onChange={e => handlePrinterChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm"
          >
            {printers.map(p => (
              <option key={p.id} value={p.id}>
                {p.brand} — {p.name} ({p.power}W)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('machine.printerValue')}</label>
            <input
              type="number"
              value={inputs.printer.value || ''}
              onChange={e => setInput('printer', { ...inputs.printer, value: parseFloat(e.target.value) || 0 })}
              placeholder="3500"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('machine.power')}</label>
            <input
              type="number"
              value={inputs.printer.power || ''}
              onChange={e => setInput('printer', { ...inputs.printer, power: parseFloat(e.target.value) || 0 })}
              placeholder="300"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('machine.usefulLife')}</label>
            <input
              type="number"
              value={inputs.printer.usefulLife || ''}
              onChange={e => setInput('printer', { ...inputs.printer, usefulLife: parseFloat(e.target.value) || 0 })}
              placeholder="2000"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
            <span className="text-xs text-gray-500 mt-0.5 block">{t('machine.usefulLifeHelper')}</span>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('machine.energyRate')}</label>
            <input
              type="number"
              step="0.01"
              value={inputs.energyRate || ''}
              onChange={e => setInput('energyRate', parseFloat(e.target.value) || 0)}
              placeholder="0.95"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('machine.laborRate')}</label>
            <input
              type="number"
              value={inputs.laborRate || ''}
              onChange={e => setInput('laborRate', parseFloat(e.target.value) || 0)}
              placeholder="25"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('machine.failureRate')}</label>
            <input
              type="number"
              value={inputs.failureRate || ''}
              onChange={e => setInput('failureRate', parseFloat(e.target.value) || 0)}
              placeholder="10"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('machine.packaging')}</label>
            <input
              type="number"
              step="0.5"
              value={inputs.packagingCost || ''}
              onChange={e => setInput('packagingCost', parseFloat(e.target.value) || 0)}
              placeholder="2.00"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{t('machine.finishing')}</label>
            <input
              type="number"
              step="0.5"
              value={inputs.finishingCost || ''}
              onChange={e => setInput('finishingCost', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('machine.shipping')}</label>
          <input
            type="number"
            step="0.5"
            value={inputs.shippingCost || ''}
            onChange={e => setInput('shippingCost', parseFloat(e.target.value) || 0)}
            placeholder="15.00"
            className="w-full px-4 py-2.5 rounded-xl text-sm"
          />
        </div>
      </div>
    </div>
  )
}
