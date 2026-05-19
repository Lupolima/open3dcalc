import { useCallback, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { fdmMaterials, resinMaterials } from '@/lib/materials'
import { printers } from '@/lib/printers'
import { marketplaces } from '@/lib/marketplace'
import { calculateFDM, calculateResin } from '@/lib/calculator'
import { InputGroup, SelectGroup } from '@/components/ui/InputGroup'
import { SummaryRow, SummarySectionHeader } from '@/components/ui/SummaryRow'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { BufferGeometry } from 'three'
import type { CalculationResult } from '@/types'

const StlPreview = lazy(() => import('@/components/StlPreview/StlPreview').then(m => ({ default: m.StlPreview })))

const SECTIONS = [
  { id: 'material', icon: '🧵', label: 'calc.material' },
  { id: 'print', icon: '⚙️', label: 'calc.printParams' },
  { id: 'hardware', icon: '🔧', label: 'calc.fdmHardware' },
  { id: 'machine', icon: '🖨️', label: 'calc.machine' },
  { id: 'labor', icon: '👷', label: 'calc.labor' },
  { id: 'ops', icon: '🛡️', label: 'calc.opsSoftware' },
  { id: 'sales', icon: '💰', label: 'calc.sales' },
  { id: 'results', icon: '📊', label: 'calc.results' },
]

function buildResults(s: ReturnType<typeof useCalculatorStore.getState>): CalculationResult {
  if (s.activeTab === 'fdm') {
    return calculateFDM(
      s.fdmMaterial, s.fdmPrintParams, s.fdmMachine,
      s.fdmLabor, s.fdmExtras, s.fdmSales, s.fdmOps, s.fdmSoft,
      s.fdmHardware, s.fdmFinishing,
    )
  }
  return calculateResin(
    s.resinMaterial, s.resinPrintParams, s.resinMachine,
    s.resinLabor, s.resinExtras, s.resinSales, s.resinOps, s.resinSoft,
    s.resinPostProcess, s.resinHardware,
  )
}

export function Calculator() {
  const { t } = useTranslation()
  const store = useCalculatorStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stlGeometry, setStlGeometry] = useState<BufferGeometry | null>(null)
  const [stlInfo, setStlInfo] = useState<{ volume: number; faces: number; vertices: number } | null>(null)
  const [stlLoading, setStlLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [activeSection, setActiveSection] = useState('material')

  const isFDM = store.activeTab === 'fdm'
  const themeText = isFDM ? 'text-sky-400' : 'text-purple-400'
  const themeBg = isFDM ? 'bg-sky-600' : 'bg-purple-600'

  const results = useMemo(() => buildResults(store), [store])

  const chartData = useMemo(() => {
    const items = [
      { name: 'Material', value: results.materialCost, color: isFDM ? '#38bdf8' : '#a855f7' },
      { name: 'Energia', value: results.energyCost, color: '#facc15' },
      { name: 'Máquina', value: results.machineCost, color: '#94a3b8' },
      { name: 'Hardware', value: results.hardwareCost, color: '#f97316' },
      { name: 'Acabamento', value: results.postProcessingCost, color: '#22d3ee' },
      { name: 'Consumíveis', value: results.consumablesCost, color: '#06b6d4' },
      { name: 'Software', value: results.softwareCost, color: '#818cf8' },
      { name: 'Mão de Obra', value: results.laborCost, color: '#f472b6' },
      { name: 'Falha', value: results.failureCost, color: '#f87171' },
      { name: 'Extras', value: results.extrasCost, color: '#cbd5e1' },
    ].filter(d => d.value > 0.01)
    return items
  }, [results, isFDM])

  const fmtCurrency = (val: number) => (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const calcPct = (val: number) => results.totalCost > 0 ? ((val / results.totalCost) * 100).toFixed(1) + '%' : '0%'

  const handleFileDrop = useCallback(async (file: File) => {
    if (!file.name.match(/\.(stl|obj|3mf)$/i)) {
      alert(t('stl.invalidFile'))
      return
    }
    setStlLoading(true)
    try {
      const { analyzeMeshFile, volumeToCm3, estimateWeight } = await import('@/lib/stlParser')
      const { geometry, analysis } = await analyzeMeshFile(file)
      setStlGeometry(geometry)
      const volume = volumeToCm3(analysis.volume)
      setStlInfo({ volume, faces: analysis.triangleCount, vertices: analysis.vertexCount })
      const weight = estimateWeight(volume, store.fdmMaterial.density, 20, 10)
      store.setFdmMaterial({ ...store.fdmMaterial, weightUsed: parseFloat(weight.toFixed(2)) })
    } catch {
      alert(t('stl.error'))
    }
    setStlLoading(false)
  }, [store, t])

  const handlePrinterSelect = (id: string) => {
    const p = printers.find(p => p.id === id)
    if (p) {
      store.setSelectedPrinter(p)
      store.setFdmPrintParams({ ...store.fdmPrintParams, printerPowerWatts: p.power })
      store.setFdmMachine({ ...store.fdmMachine, machineCost: p.value })
    }
  }

  const handleMarketplaceChange = (id: string) => {
    const mp = marketplaces.find(m => m.id === id)
    if (mp) {
      store.setSelectedMarketplace(mp)
      store.setFdmSales({ ...store.fdmSales, marketplaceFeePercent: mp.feePercent })
    }
  }

  const handleInput = useCallback((value: string, setter: (v: number) => void) => {
    setter(value === '' ? 0 : parseFloat(value) || 0)
  }, [])

  function renderMaterialSection() {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>🧵</span> {t('calc.material')}
        </h3>
        {isFDM ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectGroup label={t('calc.filamentType')} value={store.fdmMaterial.type}
              onChange={v => store.setFdmMaterial({ ...store.fdmMaterial, type: v })}
              options={fdmMaterials.map(m => ({ label: m.name, value: m.name }))} />
            <InputGroup label={t('calc.costPerKg')} value={store.fdmMaterial.costPerKg}
              onChange={v => handleInput(v, val => store.setFdmMaterial({ ...store.fdmMaterial, costPerKg: val }))}
              type="number" prefix="R$" />
            <div className="md:col-span-2">
              <div
                onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileDrop(f) }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
              >
                <input ref={fileInputRef} type="file" accept=".stl,.obj,.3mf" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileDrop(f) }} className="hidden" />
                <p className="text-xs text-gray-400">{t('product.uploadStl')}</p>
                {stlLoading && <p className="text-xs text-purple-400 mt-1">{t('stl.loading')}</p>}
              </div>
              {stlGeometry && (
                <div className="mt-2 h-48">
                  <Suspense fallback={<div className="text-xs text-gray-400">{t('common.loading')}</div>}>
                    <StlPreview geometry={stlGeometry} />
                  </Suspense>
                </div>
              )}
              {stlInfo && (
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-gray-400">{t('stl.volume')}</p>
                    <p className="font-semibold text-purple-400">{stlInfo.volume.toFixed(1)} cm³</p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-gray-400">{t('stl.faces')}</p>
                    <p className="font-semibold text-gray-200">{stlInfo.faces}</p>
                  </div>
                  <div className="glass rounded-lg p-2 text-center">
                    <p className="text-gray-400">{t('stl.vertices')}</p>
                    <p className="font-semibold text-gray-200">{stlInfo.vertices}</p>
                  </div>
                </div>
              )}
            </div>
            <InputGroup label={t('calc.weight')} value={store.fdmMaterial.weightUsed}
              onChange={v => handleInput(v, val => store.setFdmMaterial({ ...store.fdmMaterial, weightUsed: val }))}
              type="number" unit="g" />
            <InputGroup label={t('calc.purge')} value={store.fdmMaterial.purgeWeight}
              onChange={v => handleInput(v, val => store.setFdmMaterial({ ...store.fdmMaterial, purgeWeight: val }))}
              type="number" unit="g" />
            <InputGroup label={t('calc.spoolEfficiency')} value={store.fdmMaterial.spoolEfficiency}
              onChange={v => handleInput(v, val => store.setFdmMaterial({ ...store.fdmMaterial, spoolEfficiency: val }))}
              type="number" unit="%" />
            <InputGroup label={t('calc.density')} value={store.fdmMaterial.density}
              onChange={v => handleInput(v, val => store.setFdmMaterial({ ...store.fdmMaterial, density: val }))}
              type="number" unit="g/cm³" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectGroup label={t('calc.resinType')} value={store.resinMaterial.type}
              onChange={v => store.setResinMaterial({ ...store.resinMaterial, type: v })}
              options={resinMaterials.map(m => ({ label: m.name, value: m.name }))} />
            <InputGroup label={t('calc.costPerLiter')} value={store.resinMaterial.costPerLiter}
              onChange={v => handleInput(v, val => store.setResinMaterial({ ...store.resinMaterial, costPerLiter: val }))}
              type="number" prefix="R$" />
            <InputGroup label={t('calc.volumeMl')} value={store.resinMaterial.volumeUsedMl}
              onChange={v => handleInput(v, val => store.setResinMaterial({ ...store.resinMaterial, volumeUsedMl: val }))}
              type="number" unit="ml" />
            <InputGroup label={t('calc.wasteMargin')} value={store.resinMaterial.wasteMarginPercent}
              onChange={v => handleInput(v, val => store.setResinMaterial({ ...store.resinMaterial, wasteMarginPercent: val }))}
              type="number" unit="%" />
          </div>
        )}
      </div>
    )
  }

  function renderPrintSection() {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>⚙️</span> {t('calc.printParams')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label={t('calc.printTime')}
            value={isFDM ? store.fdmPrintParams.printTimeHours : store.resinPrintParams.printTimeHours}
            onChange={v => handleInput(v, val => isFDM
              ? store.setFdmPrintParams({ ...store.fdmPrintParams, printTimeHours: val })
              : store.setResinPrintParams({ ...store.resinPrintParams, printTimeHours: val })
            )} type="number" unit="h" />
          <InputGroup label={t('calc.printerPower')}
            value={isFDM ? store.fdmPrintParams.printerPowerWatts : store.resinPrintParams.printerPowerWatts}
            onChange={v => handleInput(v, val => isFDM
              ? store.setFdmPrintParams({ ...store.fdmPrintParams, printerPowerWatts: val })
              : store.setResinPrintParams({ ...store.resinPrintParams, printerPowerWatts: val })
            )} type="number" unit="W" />
          <InputGroup label={t('calc.energyCost')}
            value={isFDM ? store.fdmPrintParams.energyCostPerKwh : store.resinPrintParams.energyCostPerKwh}
            onChange={v => handleInput(v, val => isFDM
              ? store.setFdmPrintParams({ ...store.fdmPrintParams, energyCostPerKwh: val })
              : store.setResinPrintParams({ ...store.resinPrintParams, energyCostPerKwh: val })
            )} type="number" unit="R$/kWh" step="0.01" />
          {isFDM && (
            <SelectGroup label={t('calc.printer')} value={store.selectedPrinter.id}
              onChange={handlePrinterSelect}
              options={printers.map(p => ({ label: `${p.brand} — ${p.name}`, value: p.id }))} />
          )}
          <div className="md:col-span-2 glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">{t('calc.failure')}</span>
              <div className="flex gap-2">
                {(['none', 'percent', 'fixed'] as const).map(mode => {
                  const current = isFDM ? store.fdmPrintParams.failureMode : store.resinPrintParams.failureMode
                  const label = mode === 'none' ? t('calc.noFailure') : mode === 'percent' ? '%' : 'R$'
                  return (
                    <button key={mode}
                      onClick={() => isFDM
                        ? store.setFdmPrintParams({ ...store.fdmPrintParams, failureMode: mode, failureValue: mode === 'none' ? 0 : store.fdmPrintParams.failureValue })
                        : store.setResinPrintParams({ ...store.resinPrintParams, failureMode: mode, failureValue: mode === 'none' ? 0 : store.resinPrintParams.failureValue })
                      }
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${current === mode ? `${themeBg} text-white` : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            {(isFDM ? store.fdmPrintParams.failureMode : store.resinPrintParams.failureMode) !== 'none' && (
              <div className="grid grid-cols-2 gap-3">
                <InputGroup label={t('calc.failureValue')}
                  value={isFDM ? store.fdmPrintParams.failureValue : store.resinPrintParams.failureValue}
                  onChange={v => handleInput(v, val => isFDM
                    ? store.setFdmPrintParams({ ...store.fdmPrintParams, failureValue: val })
                    : store.setResinPrintParams({ ...store.resinPrintParams, failureValue: val })
                  )} type="number"
                  unit={(isFDM ? store.fdmPrintParams.failureMode : store.resinPrintParams.failureMode) === 'percent' ? '%' : undefined}
                  prefix={(isFDM ? store.fdmPrintParams.failureMode : store.resinPrintParams.failureMode) === 'fixed' ? 'R$' : undefined} />
                {(isFDM ? store.fdmPrintParams.failureMode : store.resinPrintParams.failureMode) === 'percent' && (
                  <InputGroup label={t('calc.riskMultiplier')}
                    value={isFDM ? store.fdmPrintParams.riskMultiplier : store.resinPrintParams.riskMultiplier}
                    onChange={v => handleInput(v, val => isFDM
                      ? store.setFdmPrintParams({ ...store.fdmPrintParams, riskMultiplier: val })
                      : store.setResinPrintParams({ ...store.resinPrintParams, riskMultiplier: val })
                    )} type="number" step="0.1" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderHardwareSection() {
    return (
      <div className="glass rounded-2xl p-5 space-y-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>🔧</span> {t('calc.fdmHardware')}
        </h3>
        {isFDM && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-semibold text-sky-400">{t('calc.nozzle')}</span>
                  <button onClick={() => store.setFdmHardware({ ...store.fdmHardware, nozzleEnabled: !store.fdmHardware.nozzleEnabled })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${store.fdmHardware.nozzleEnabled ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>ON/OFF</button>
                </div>
                {store.fdmHardware.nozzleEnabled && (
                  <>
                    <InputGroup label={t('calc.nozzleCost')} value={store.fdmHardware.nozzleCost}
                      onChange={v => handleInput(v, val => store.setFdmHardware({ ...store.fdmHardware, nozzleCost: val }))} type="number" prefix="R$" />
                    <InputGroup label={t('calc.nozzleLife')} value={store.fdmHardware.nozzleLifespanKg}
                      onChange={v => handleInput(v, val => store.setFdmHardware({ ...store.fdmHardware, nozzleLifespanKg: val }))} type="number" unit="kg" />
                  </>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-semibold text-sky-400">{t('calc.bed')}</span>
                  <button onClick={() => store.setFdmHardware({ ...store.fdmHardware, bedEnabled: !store.fdmHardware.bedEnabled })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${store.fdmHardware.bedEnabled ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>ON/OFF</button>
                </div>
                {store.fdmHardware.bedEnabled && (
                  <InputGroup label={t('calc.bedCost')} value={store.fdmHardware.bedAdhesionCost}
                    onChange={v => handleInput(v, val => store.setFdmHardware({ ...store.fdmHardware, bedAdhesionCost: val }))} type="number" prefix="R$" />
                )}
              </div>
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span>🎨</span>
                <span className="text-sm font-semibold text-white">{t('calc.fdmFinishing')}</span>
              </div>
              <InputGroup label={t('calc.finishingSupplies')} value={store.fdmFinishing.suppliesCost}
                onChange={v => handleInput(v, val => store.setFdmFinishing({ ...store.fdmFinishing, suppliesCost: val }))} type="number" prefix="R$" />
            </div>
          </>
        )}
        {!isFDM && (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span>🧪</span>
                <span className="text-sm font-semibold text-white">{t('calc.resinPostProcess')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">{t('calc.washing')}</span>
                <button onClick={() => store.setResinPostProcess({ ...store.resinPostProcess, washingEnabled: !store.resinPostProcess.washingEnabled })}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${store.resinPostProcess.washingEnabled ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>ON/OFF</button>
              </div>
              {store.resinPostProcess.washingEnabled && (
                <div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-white/10">
                  <InputGroup label={t('calc.alcoholCost')} value={store.resinPostProcess.alcoholCostPerLiter}
                    onChange={v => handleInput(v, val => store.setResinPostProcess({ ...store.resinPostProcess, alcoholCostPerLiter: val }))} type="number" prefix="R$/L" />
                  <InputGroup label={t('calc.alcoholVol')} value={store.resinPostProcess.alcoholVolumeLiters}
                    onChange={v => handleInput(v, val => store.setResinPostProcess({ ...store.resinPostProcess, alcoholVolumeLiters: val }))} type="number" unit="L" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">{t('calc.curing')}</span>
                <button onClick={() => store.setResinPostProcess({ ...store.resinPostProcess, curingEnabled: !store.resinPostProcess.curingEnabled })}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${store.resinPostProcess.curingEnabled ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>ON/OFF</button>
              </div>
              {store.resinPostProcess.curingEnabled && (
                <div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-white/10">
                  <InputGroup label={t('calc.cureTime')} value={store.resinPostProcess.curingTimeMinutes}
                    onChange={v => handleInput(v, val => store.setResinPostProcess({ ...store.resinPostProcess, curingTimeMinutes: val }))} type="number" unit="min" />
                  <InputGroup label={t('calc.curePower')} value={store.resinPostProcess.curingPowerWatts}
                    onChange={v => handleInput(v, val => store.setResinPostProcess({ ...store.resinPostProcess, curingPowerWatts: val }))} type="number" unit="W" />
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span>🖥️</span>
                <span className="text-sm font-semibold text-white">{t('calc.resinHardware')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label={t('calc.lcdCost')} value={store.resinHardware.lcdCost}
                  onChange={v => handleInput(v, val => store.setResinHardware({ ...store.resinHardware, lcdCost: val }))} type="number" prefix="R$" />
                <InputGroup label={t('calc.lcdLife')} value={store.resinHardware.lcdLifespanHours}
                  onChange={v => handleInput(v, val => store.setResinHardware({ ...store.resinHardware, lcdLifespanHours: val }))} type="number" unit="h" />
                <InputGroup label={t('calc.fepCost')} value={store.resinHardware.fepCost}
                  onChange={v => handleInput(v, val => store.setResinHardware({ ...store.resinHardware, fepCost: val }))} type="number" prefix="R$" />
                <InputGroup label={t('calc.fepLife')} value={store.resinHardware.fepLifespanPrints}
                  onChange={v => handleInput(v, val => store.setResinHardware({ ...store.resinHardware, fepLifespanPrints: val }))} type="number" unit="prints" />
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  function renderMachineSection() {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>🖨️</span> {t('calc.machine')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label={t('calc.machineCost')}
            value={isFDM ? store.fdmMachine.machineCost : store.resinMachine.machineCost}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmMachine({ ...store.fdmMachine, machineCost: val }) : store.setResinMachine({ ...store.resinMachine, machineCost: val }))} type="number" prefix="R$" />
          <InputGroup label={t('calc.depreciationMonths')}
            value={isFDM ? store.fdmMachine.depreciationMonths : store.resinMachine.depreciationMonths}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmMachine({ ...store.fdmMachine, depreciationMonths: val }) : store.setResinMachine({ ...store.resinMachine, depreciationMonths: val }))} type="number" unit="meses" />
          <InputGroup label={t('calc.hoursPerMonth')}
            value={isFDM ? store.fdmMachine.hoursPerMonth : store.resinMachine.hoursPerMonth}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmMachine({ ...store.fdmMachine, hoursPerMonth: val }) : store.setResinMachine({ ...store.resinMachine, hoursPerMonth: val }))} type="number" unit="h/mês" />
          <div className="md:col-span-2 flex items-center justify-between glass rounded-xl p-3">
            <span className="text-xs text-gray-400">{t('calc.maintenance')}</span>
            <button onClick={() => isFDM ? store.setFdmMachine({ ...store.fdmMachine, maintenanceEnabled: !store.fdmMachine.maintenanceEnabled }) : store.setResinMachine({ ...store.resinMachine, maintenanceEnabled: !store.resinMachine.maintenanceEnabled })}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${(isFDM ? store.fdmMachine.maintenanceEnabled : store.resinMachine.maintenanceEnabled) ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>ON/OFF</button>
          </div>
          {(isFDM ? store.fdmMachine.maintenanceEnabled : store.resinMachine.maintenanceEnabled) && (
            <div className="md:col-span-2">
              <InputGroup label={t('calc.maintenanceCost')}
                value={isFDM ? store.fdmMachine.maintenanceCost : store.resinMachine.maintenanceCost}
                onChange={v => handleInput(v, val => isFDM ? store.setFdmMachine({ ...store.fdmMachine, maintenanceCost: val }) : store.setResinMachine({ ...store.resinMachine, maintenanceCost: val }))} type="number" prefix="R$/mês" />
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderLaborSection() {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>👷</span> {t('calc.labor')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label={t('calc.setupTime')}
            value={isFDM ? store.fdmLabor.setupTimeMinutes : store.resinLabor.setupTimeMinutes}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmLabor({ ...store.fdmLabor, setupTimeMinutes: val }) : store.setResinLabor({ ...store.resinLabor, setupTimeMinutes: val }))} type="number" unit="min" />
          <InputGroup label={t('calc.postTime')}
            value={isFDM ? store.fdmLabor.postProcessingTimeMinutes : store.resinLabor.postProcessingTimeMinutes}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmLabor({ ...store.fdmLabor, postProcessingTimeMinutes: val }) : store.setResinLabor({ ...store.resinLabor, postProcessingTimeMinutes: val }))} type="number" unit="min" />
          <InputGroup label={t('calc.hourlyRate')}
            value={isFDM ? store.fdmLabor.hourlyRate : store.resinLabor.hourlyRate}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmLabor({ ...store.fdmLabor, hourlyRate: val }) : store.setResinLabor({ ...store.resinLabor, hourlyRate: val }))} type="number" prefix="R$" />
        </div>
      </div>
    )
  }

  function renderOpsSection() {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>🛡️</span> {t('calc.opsSoftware')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-xs font-semibold text-gray-300">{t('calc.ppe')}</span>
              <button onClick={() => isFDM ? store.setFdmOps({ ...store.fdmOps, enabled: !store.fdmOps.enabled }) : store.setResinOps({ ...store.resinOps, enabled: !store.resinOps.enabled })}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${(isFDM ? store.fdmOps.enabled : store.resinOps.enabled) ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>ON/OFF</button>
            </div>
            {(isFDM ? store.fdmOps.enabled : store.resinOps.enabled) && (
              <InputGroup label={t('calc.ppeCost')}
                value={isFDM ? store.fdmOps.ppeCostPerPrint : store.resinOps.ppeCostPerPrint}
                onChange={v => handleInput(v, val => isFDM ? store.setFdmOps({ ...store.fdmOps, ppeCostPerPrint: val }) : store.setResinOps({ ...store.resinOps, ppeCostPerPrint: val }))} type="number" prefix="R$" />
            )}
          </div>
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-xs font-semibold text-gray-300">{t('calc.software')}</span>
              <button onClick={() => isFDM ? store.setFdmSoft({ ...store.fdmSoft, enabled: !store.fdmSoft.enabled }) : store.setResinSoft({ ...store.resinSoft, enabled: !store.resinSoft.enabled })}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${(isFDM ? store.fdmSoft.enabled : store.resinSoft.enabled) ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>ON/OFF</button>
            </div>
            {(isFDM ? store.fdmSoft.enabled : store.resinSoft.enabled) && (
              <div className="space-y-3">
                <InputGroup label={t('calc.slicerCost')}
                  value={isFDM ? store.fdmSoft.slicerMonthlyCost : store.resinSoft.slicerMonthlyCost}
                  onChange={v => handleInput(v, val => isFDM ? store.setFdmSoft({ ...store.fdmSoft, slicerMonthlyCost: val }) : store.setResinSoft({ ...store.resinSoft, slicerMonthlyCost: val }))} type="number" prefix="R$" />
                <InputGroup label={t('calc.modelCost')}
                  value={isFDM ? store.fdmSoft.modelFileCost : store.resinSoft.modelFileCost}
                  onChange={v => handleInput(v, val => isFDM ? store.setFdmSoft({ ...store.fdmSoft, modelFileCost: val }) : store.setResinSoft({ ...store.resinSoft, modelFileCost: val }))} type="number" prefix="R$" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderSalesSection() {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>💰</span> {t('calc.sales')}
        </h3>
        <div className="space-y-4">
          <InputGroup label={t('calc.extras')}
            value={isFDM ? store.fdmExtras.extrasCost : store.resinExtras.extrasCost}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmExtras({ extrasCost: val }) : store.setResinExtras({ extrasCost: val }))} type="number" prefix="R$" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label={t('calc.packaging')}
              value={isFDM ? store.fdmSales.packagingCost : store.resinSales.packagingCost}
              onChange={v => handleInput(v, val => isFDM ? store.setFdmSales({ ...store.fdmSales, packagingCost: val }) : store.setResinSales({ ...store.resinSales, packagingCost: val }))} type="number" prefix="R$" />
            <InputGroup label={t('calc.shipping')}
              value={isFDM ? store.fdmSales.shippingCost : store.resinSales.shippingCost}
              onChange={v => handleInput(v, val => isFDM ? store.setFdmSales({ ...store.fdmSales, shippingCost: val }) : store.setResinSales({ ...store.resinSales, shippingCost: val }))} type="number" prefix="R$" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectGroup label={t('calc.marketplace')} value={store.selectedMarketplace.id}
              onChange={handleMarketplaceChange}
              options={marketplaces.map(m => ({ label: m.name, value: m.id }))} />
            <InputGroup label={t('calc.taxPercent')}
              value={isFDM ? store.fdmSales.taxPercent : store.resinSales.taxPercent}
              onChange={v => handleInput(v, val => isFDM ? store.setFdmSales({ ...store.fdmSales, taxPercent: val }) : store.setResinSales({ ...store.resinSales, taxPercent: val }))} type="number" unit="%" />
          </div>
          <div className="glass rounded-xl p-4">
            <InputGroup label={t('calc.profitMargin')}
              value={isFDM ? store.fdmSales.profitMarginPercent : store.resinSales.profitMarginPercent}
              onChange={v => handleInput(v, val => isFDM ? store.setFdmSales({ ...store.fdmSales, profitMarginPercent: val }) : store.setResinSales({ ...store.resinSales, profitMarginPercent: val }))} type="number" unit="%" />
          </div>
        </div>
      </div>
    )
  }

  function renderRightSidebar() {
    return (
      <>
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <span className={`text-base ${themeText}`}>📊</span>
            <h3 className="font-semibold text-sm text-white">{t('calc.costDistribution')}</h3>
          </div>
          <div className="p-4 h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="40%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => fmtCurrency(value)}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#e2e8f0' }}
                    itemStyle={{ color: '#e2e8f0' }} />
                  <Legend layout="vertical" verticalAlign="middle" align="right"
                    iconType="circle" wrapperStyle={{ fontSize: '10px', maxWidth: '40%' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xs">{t('calc.noCosts')}</div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <span className={`text-base ${themeText}`}>📋</span>
            <h3 className="font-semibold text-sm text-white">{t('calc.summary')}</h3>
          </div>
          <div className="px-5 py-4 space-y-1">
            <SummarySectionHeader title={t('calc.directProduction')} />
            <SummaryRow label={`Material (${calcPct(results.materialCost)})`} icon="🧵" value={fmtCurrency(results.materialCost)} colorClass={themeText} />
            <SummaryRow label={`Energia (${calcPct(results.energyCost)})`} icon="⚡" value={fmtCurrency(results.energyCost)} colorClass="text-yellow-400" />
            {results.postProcessingCost > 0 && <SummaryRow label={`${isFDM ? 'Acabamento' : 'Pós-Processamento'} (${calcPct(results.postProcessingCost)})`} icon="🎨" value={fmtCurrency(results.postProcessingCost)} colorClass="text-cyan-400" />}

            {(results.hardwareCost > 0 || results.machineCost > 0) && <SummarySectionHeader title={t('calc.equipment')} />}
            <SummaryRow label={`Máquina (${calcPct(results.machineCost)})`} icon="🖨️" value={fmtCurrency(results.machineCost)} colorClass="text-gray-400" />
            {results.hardwareCost > 0 && <SummaryRow label={`${isFDM ? 'Bico/Mesa' : 'LCD/FEP'} (${calcPct(results.hardwareCost)})`} icon="🔧" value={fmtCurrency(results.hardwareCost)} colorClass="text-orange-400" />}

            {(results.consumablesCost > 0 || results.softwareCost > 0 || results.laborCost > 0) && <SummarySectionHeader title={t('calc.operational')} />}
            {results.consumablesCost > 0 && <SummaryRow label={`EPI (${calcPct(results.consumablesCost)})`} icon="🛡️" value={fmtCurrency(results.consumablesCost)} colorClass="text-cyan-400" />}
            {results.softwareCost > 0 && <SummaryRow label={`Software (${calcPct(results.softwareCost)})`} icon="💻" value={fmtCurrency(results.softwareCost)} colorClass="text-indigo-400" />}
            {results.laborCost > 0 && <SummaryRow label={`Mão de Obra (${calcPct(results.laborCost)})`} icon="👷" value={fmtCurrency(results.laborCost)} colorClass="text-pink-400" />}

            {(results.failureCost > 0 || results.extrasCost > 0) && <SummarySectionHeader title={t('calc.riskExtras')} />}
            {results.failureCost > 0 && <SummaryRow label={`Falha (${calcPct(results.failureCost)})`} icon="⚠️" value={fmtCurrency(results.failureCost)} colorClass="text-red-400" />}
            {results.extrasCost > 0 && <SummaryRow label={`Extras (${calcPct(results.extrasCost)})`} icon="📦" value={fmtCurrency(results.extrasCost)} colorClass="text-gray-400" />}

            <div className="mt-4 space-y-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-3 border border-green-900/50 flex justify-between items-center">
                <span className="text-green-400 font-semibold text-xs">{t('calc.totalCost')}</span>
                <span className="text-lg font-bold text-green-400">{fmtCurrency(results.totalCost)}</span>
              </div>
              <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 font-bold text-xs">{t('calc.sellPrice')}</span>
                  <span className="text-xl font-bold text-emerald-400">{fmtCurrency(results.sellPrice)}</span>
                </div>
                {results.taxAmount > 0 && <div className="text-right text-[10px] text-emerald-600 mt-1">c/ taxas</div>}
              </div>
              <div className="bg-orange-900/20 rounded-xl p-3 border border-orange-800/50 flex justify-between items-center">
                <span className="text-orange-400 font-semibold text-xs">{t('calc.profit')}</span>
                <span className="text-lg font-bold text-orange-400">{fmtCurrency(results.profit)}</span>
              </div>
            </div>

            <button onClick={() => store.addToHistory()} className="w-full mt-3 py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-medium transition-colors flex items-center justify-center gap-2">
              📁 {t('calc.addHistory')}
            </button>
          </div>
        </div>

        {store.history.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-300">{t('calc.history')} ({store.history.length})</span>
              <button onClick={() => { if (confirm(t('calc.clearConfirm') || 'Limpar histórico?')) store.clearHistory() }} className="text-[10px] text-red-400 hover:text-red-300">🗑️ {t('calc.clearHistory')}</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {store.history.map(item => (
                <div key={item.id} className="text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                    <span>{new Date(item.timestamp).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="uppercase font-bold">{item.type}</span>
                  </div>
                  <div className="font-medium text-gray-300 truncate">{item.summary}</div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-orange-400 font-mono">{fmtCurrency(item.profit)}</span>
                    <span className="text-emerald-400 font-bold font-mono">{fmtCurrency(item.sellPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-5 space-y-3">
          <button onClick={() => { store.saveSettings(); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) }}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>
            {saveStatus === 'saved' ? '✅ ' + t('calc.saved') : '💾 ' + t('calc.saveSettings')}
          </button>
          <button onClick={async () => { const { exportPdf } = await import('@/lib/pdfExport'); exportPdf(results) }} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all">
            📄 {t('calc.exportPdf')}
          </button>
        </div>
      </>
    )
  }

  function renderResultsSection() {
    return (
      <div className="space-y-5">
        <div className="glass rounded-2xl overflow-hidden lg:hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <span className={`text-base ${themeText}`}>📊</span>
            <h3 className="font-semibold text-sm text-white">{t('calc.costDistribution')}</h3>
          </div>
          <div className="p-4 h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="40%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => fmtCurrency(value)}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#e2e8f0' }}
                    itemStyle={{ color: '#e2e8f0' }} />
                  <Legend layout="vertical" verticalAlign="middle" align="right"
                    iconType="circle" wrapperStyle={{ fontSize: '10px', maxWidth: '40%' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-xs">{t('calc.noCosts')}</div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden lg:hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
            <span className={`text-base ${themeText}`}>📋</span>
            <h3 className="font-semibold text-sm text-white">{t('calc.summary')}</h3>
          </div>
          <div className="px-5 py-4 space-y-1">
            <SummarySectionHeader title={t('calc.directProduction')} />
            <SummaryRow label={`Material (${calcPct(results.materialCost)})`} icon="🧵" value={fmtCurrency(results.materialCost)} colorClass={themeText} />
            <SummaryRow label={`Energia (${calcPct(results.energyCost)})`} icon="⚡" value={fmtCurrency(results.energyCost)} colorClass="text-yellow-400" />
            {results.postProcessingCost > 0 && <SummaryRow label={`${isFDM ? 'Acabamento' : 'Pós-Processamento'} (${calcPct(results.postProcessingCost)})`} icon="🎨" value={fmtCurrency(results.postProcessingCost)} colorClass="text-cyan-400" />}

            {(results.hardwareCost > 0 || results.machineCost > 0) && <SummarySectionHeader title={t('calc.equipment')} />}
            <SummaryRow label={`Máquina (${calcPct(results.machineCost)})`} icon="🖨️" value={fmtCurrency(results.machineCost)} colorClass="text-gray-400" />
            {results.hardwareCost > 0 && <SummaryRow label={`${isFDM ? 'Bico/Mesa' : 'LCD/FEP'} (${calcPct(results.hardwareCost)})`} icon="🔧" value={fmtCurrency(results.hardwareCost)} colorClass="text-orange-400" />}

            {(results.consumablesCost > 0 || results.softwareCost > 0 || results.laborCost > 0) && <SummarySectionHeader title={t('calc.operational')} />}
            {results.consumablesCost > 0 && <SummaryRow label={`EPI (${calcPct(results.consumablesCost)})`} icon="🛡️" value={fmtCurrency(results.consumablesCost)} colorClass="text-cyan-400" />}
            {results.softwareCost > 0 && <SummaryRow label={`Software (${calcPct(results.softwareCost)})`} icon="💻" value={fmtCurrency(results.softwareCost)} colorClass="text-indigo-400" />}
            {results.laborCost > 0 && <SummaryRow label={`Mão de Obra (${calcPct(results.laborCost)})`} icon="👷" value={fmtCurrency(results.laborCost)} colorClass="text-pink-400" />}

            {(results.failureCost > 0 || results.extrasCost > 0) && <SummarySectionHeader title={t('calc.riskExtras')} />}
            {results.failureCost > 0 && <SummaryRow label={`Falha (${calcPct(results.failureCost)})`} icon="⚠️" value={fmtCurrency(results.failureCost)} colorClass="text-red-400" />}
            {results.extrasCost > 0 && <SummaryRow label={`Extras (${calcPct(results.extrasCost)})`} icon="📦" value={fmtCurrency(results.extrasCost)} colorClass="text-gray-400" />}

            <div className="mt-4 space-y-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-3 border border-green-900/50 flex justify-between items-center">
                <span className="text-green-400 font-semibold text-xs">{t('calc.totalCost')}</span>
                <span className="text-lg font-bold text-green-400">{fmtCurrency(results.totalCost)}</span>
              </div>
              <div className="bg-emerald-900/20 rounded-xl p-4 border border-emerald-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 font-bold text-xs">{t('calc.sellPrice')}</span>
                  <span className="text-xl font-bold text-emerald-400">{fmtCurrency(results.sellPrice)}</span>
                </div>
                {results.taxAmount > 0 && <div className="text-right text-[10px] text-emerald-600 mt-1">c/ taxas</div>}
              </div>
              <div className="bg-orange-900/20 rounded-xl p-3 border border-orange-800/50 flex justify-between items-center">
                <span className="text-orange-400 font-semibold text-xs">{t('calc.profit')}</span>
                <span className="text-lg font-bold text-orange-400">{fmtCurrency(results.profit)}</span>
              </div>
            </div>

            <button onClick={() => store.addToHistory()} className="w-full mt-3 py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-medium transition-colors flex items-center justify-center gap-2">
              📁 {t('calc.addHistory')}
            </button>
          </div>
        </div>

        {store.history.length > 0 && (
          <div className="glass rounded-2xl p-5 lg:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-300">{t('calc.history')} ({store.history.length})</span>
              <button onClick={() => { if (confirm(t('calc.clearConfirm') || 'Limpar histórico?')) store.clearHistory() }} className="text-[10px] text-red-400 hover:text-red-300">🗑️ {t('calc.clearHistory')}</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {store.history.map(item => (
                <div key={item.id} className="text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                    <span>{new Date(item.timestamp).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="uppercase font-bold">{item.type}</span>
                  </div>
                  <div className="font-medium text-gray-300 truncate">{item.summary}</div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-orange-400 font-mono">{fmtCurrency(item.profit)}</span>
                    <span className="text-emerald-400 font-bold font-mono">{fmtCurrency(item.sellPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-5 space-y-3 lg:hidden">
          <button onClick={() => { store.saveSettings(); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) }}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>
            {saveStatus === 'saved' ? '✅ ' + t('calc.saved') : '💾 ' + t('calc.saveSettings')}
          </button>
          <button onClick={async () => { const { exportPdf } = await import('@/lib/pdfExport'); exportPdf(results) }} className="w-full py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all">
            📄 {t('calc.exportPdf')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-6 pb-20 lg:pb-0">
        {/* Desktop sidebar */}
        <nav className="hidden lg:flex flex-col gap-1 w-16 shrink-0 sticky top-24 h-fit">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-14 h-14 rounded-xl text-xl flex items-center justify-center transition-all ${
                activeSection === s.id ? 'bg-purple-600 text-white shadow-lg' : 'glass text-gray-400 hover:text-white'
              }`}
              title={t(s.label)}>
              {s.icon}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* FDM / Resin Tabs */}
          <div className="glass rounded-xl flex p-1">
            <button onClick={() => store.setActiveTab('fdm')}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${isFDM ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>
              🖨️ {t('calc.fdm')}
            </button>
            <button onClick={() => store.setActiveTab('resin')}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${!isFDM ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}>
              🧪 {t('calc.resin')}
            </button>
          </div>

          {/* Quick Mode Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{t('calc.quickMode')}</span>
            <button onClick={() => store.setQuickMode(!store.quickMode)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${store.quickMode ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
              {store.quickMode ? '✅ ON' : '⚡ OFF'}
            </button>
          </div>

          {/* Product Name */}
          <div className="glass rounded-2xl px-5 py-4">
            <InputGroup label={t('calc.productName')} value={store.productName}
              onChange={v => store.setProductName(v)}
              type="text" placeholder={t('calc.productNamePlaceholder')} />
          </div>

          {/* Active Section */}
          {activeSection === 'material' && renderMaterialSection()}
          {activeSection === 'print' && renderPrintSection()}
          {activeSection === 'hardware' && renderHardwareSection()}
          {activeSection === 'machine' && renderMachineSection()}
          {activeSection === 'labor' && renderLaborSection()}
          {activeSection === 'ops' && renderOpsSection()}
          {activeSection === 'sales' && renderSalesSection()}
          {activeSection === 'results' && renderResultsSection()}
        </div>

        {/* Desktop right sidebar — always visible */}
        <div className="hidden lg:block w-80 shrink-0 space-y-5">
          {renderRightSidebar()}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10 lg:hidden">
        <div className="flex overflow-x-auto">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] min-w-0 transition-all ${
                activeSection === s.id ? 'text-purple-400' : 'text-gray-500'
              }`}>
              <span className="text-lg">{s.icon}</span>
              <span className="truncate">{t(s.label)}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Sticky Mobile Results Bar — above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-50 glass border-t border-white/10 md:hidden px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex gap-4">
          <span className="text-green-400 font-semibold">{t('calc.totalCost')}: <span className="text-sm">{fmtCurrency(results.totalCost)}</span></span>
          <span className="text-emerald-400 font-bold">{t('calc.sellPrice')}: <span className="text-sm">{fmtCurrency(results.sellPrice)}</span></span>
          <span className="text-orange-400 font-semibold">{t('calc.profit')}: <span className="text-sm">{fmtCurrency(results.profit)}</span></span>
        </div>
        <button onClick={() => store.addToHistory()} className="px-3 py-2 rounded-lg bg-purple-600 text-white text-[10px] font-bold">📁</button>
      </div>
    </>
  )
}
