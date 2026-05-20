import { useCallback, useRef, useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalculatorStore } from '@/stores/calculatorStore'
import { fdmMaterials, resinMaterials } from '@/lib/materials'
import { printers } from '@/lib/printers'
import { marketplaces } from '@/lib/marketplace'
import { InputGroup } from '@/components/ui/InputGroup'
import { Select } from '@/components/ui/Select'
import { ToggleSwitch } from '@/components/ui/ToggleCard'
import { ToastContainer } from '@/components/ui/Toast'
import { ResultsPanel } from './ResultsPanel'
import type { BufferGeometry } from 'three'
import {
  Layers, SlidersHorizontal, Wrench, Printer, HardHat, ShieldCheck,
  DollarSign, BarChart3, Paintbrush, Zap, Monitor, Package, Truck,
  ClipboardList, AlertTriangle, FolderOpen,
  FlaskConical, Upload, Maximize2, Minimize2,
  type LucideIcon,
} from 'lucide-react'

const StlPreview = lazy(() => import('@/components/StlPreview/StlPreview').then(m => ({ default: m.StlPreview })))

const SECTIONS: { id: string; Icon: LucideIcon; label: string; short: string }[] = [
  { id: 'material', Icon: Layers,           label: 'calc.material',   short: 'Material' },
  { id: 'print',    Icon: SlidersHorizontal, label: 'calc.printParams', short: 'Parâmetros' },
  { id: 'hardware', Icon: Wrench,            label: 'calc.fdmHardware', short: 'Hardware' },
  { id: 'machine',  Icon: Printer,           label: 'calc.machine',    short: 'Máquina' },
  { id: 'labor',    Icon: HardHat,           label: 'calc.labor',      short: 'M.Obra' },
  { id: 'ops',      Icon: ShieldCheck,       label: 'calc.opsSoftware', short: 'Ops' },
  { id: 'sales',    Icon: DollarSign,        label: 'calc.sales',      short: 'Vendas' },
  { id: 'results',  Icon: BarChart3,         label: 'calc.results',    short: 'Resultado' },
]

export function Calculator() {
  const { t } = useTranslation()
  const store = useCalculatorStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stlGeometry, setStlGeometry] = useState<BufferGeometry | null>(null)
  const [stlInfo, setStlInfo] = useState<{ volume: number; faces: number; vertices: number } | null>(null)
  const [stlLoading, setStlLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('material')
  const [fullView, setFullView] = useState(true)
  const [toastItems, setToastItems] = useState<{ id: number; message: string; type: 'error' | 'success' | 'info' }[]>([])

  const dismissToast = (id: number) => {
    setToastItems(prev => prev.filter(t => t.id !== id))
  }

  const isFDM = store.activeTab === 'fdm'
  const themeBg = isFDM ? 'bg-sky-600' : 'bg-purple-600'
  const results = store.results!
  const fmtCurrency = (val: number) => (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleFileDrop = useCallback(async (file: File) => {
    const toast = (msg: string) => {
      setToastItems(prev => [...prev, { id: Date.now(), message: msg, type: 'error' as const }])
    }
    if (!file.name.match(/\.(stl|obj|3mf|gcode)$/i)) {
      toast(t('stl.invalidFile'))
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast('Arquivo muito grande. Limite: 50MB.')
      return
    }
    setStlLoading(true)
    try {
      if (file.name.match(/\.gcode$/i)) {
        const { parseGcode } = await import('@/lib/gcodeParser')
        const text = await file.text()
        const gcode = parseGcode(text)
        if (gcode.printTimeMinutes > 0) {
          const hours = gcode.printTimeMinutes / 60
          if (isFDM) {
            store.setFdmPrintParams({ ...store.fdmPrintParams, printTimeHours: parseFloat(hours.toFixed(2)) })
          } else {
            store.setResinPrintParams({ ...store.resinPrintParams, printTimeHours: parseFloat(hours.toFixed(2)) })
          }
        }
        if (gcode.filamentUsedGrams > 0) {
          store.setFdmMaterial({ ...store.fdmMaterial, weightUsed: parseFloat(gcode.filamentUsedGrams.toFixed(2)) })
        }
        setStlInfo({ volume: 0, faces: 0, vertices: 0 })
      } else {
        const { analyzeMeshFile, volumeToCm3, estimateWeight } = await import('@/lib/stlParser')
        const { geometry, analysis } = await analyzeMeshFile(file)
        if (analysis.triangleCount > 2_000_000) {
          toast('Malha muito complexa. Limite: 2 milhões de triângulos.')
          setStlLoading(false)
          return
        }
        setStlGeometry(geometry)
        const volume = volumeToCm3(analysis.volume)
        setStlInfo({ volume, faces: analysis.triangleCount, vertices: analysis.vertexCount })
        const weight = estimateWeight(volume, store.fdmMaterial.density, 20, 10)
        store.setFdmMaterial({ ...store.fdmMaterial, weightUsed: parseFloat(weight.toFixed(2)) })
      }
    } catch {
      toast(t('stl.error'))
    }
    setStlLoading(false)
  }, [store, t, isFDM])

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

  function renderSectionHeader(Icon: LucideIcon, title: string, subtitle?: string) {
    return (
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.07]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.25)' }}>
          <Icon className="w-[18px] h-[18px] text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base sm:text-[15px] font-bold text-slate-100 leading-tight">{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    )
  }

  function renderMaterialSection() {
    return (
      <div className="glass rounded-2xl p-6 sm:p-8">
        {renderSectionHeader(isFDM ? Layers : FlaskConical, t('calc.material'), isFDM ? 'Filamento FDM' : 'Resina fotopolimérica')}
        {isFDM ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            <Select label={t('calc.filamentType')} value={store.fdmMaterial.type}
              onChange={v => store.setFdmMaterial({ ...store.fdmMaterial, type: v })}
              options={fdmMaterials.map(m => ({ label: m.name, value: m.name }))} />
            <InputGroup label={t('calc.costPerKg')} value={store.fdmMaterial.costPerKg}
              onChange={v => handleInput(v, val => store.setFdmMaterial({ ...store.fdmMaterial, costPerKg: val }))}
              type="number" prefix="R$" />
            <div className="sm:col-span-2 xl:col-span-4">
              <button
                type="button"
                onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileDrop(f) }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none flex flex-col items-center gap-2"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(79,70,229,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              >
                <input ref={fileInputRef} type="file" accept=".stl,.obj,.3mf,.gcode" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileDrop(f) }} className="hidden" />
                <Upload className="w-5 h-5 text-slate-500" />
                <p className="text-sm text-slate-300">{t('product.uploadStl')}</p>
                {stlLoading && <p className="text-xs text-indigo-400">{t('stl.loading')}</p>}
              </button>
              {stlGeometry && (
                <div className="mt-3 h-52">
                  <Suspense fallback={<div className="text-xs text-gray-400">{t('common.loading')}</div>}>
                    <StlPreview geometry={stlGeometry} />
                  </Suspense>
                </div>
              )}
              {stlInfo && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-3 text-xs sm:text-sm">
                  <div className="glass rounded-lg p-3 text-center">
                    <p className="text-gray-400">{t('stl.volume')}</p>
                    <p className="font-semibold text-purple-400 text-sm sm:text-base">{stlInfo.volume.toFixed(1)} cm³</p>
                  </div>
                  <div className="glass rounded-lg p-3 text-center">
                    <p className="text-gray-400">{t('stl.faces')}</p>
                    <p className="font-semibold text-gray-200 text-sm sm:text-base">{stlInfo.faces}</p>
                  </div>
                  <div className="glass rounded-lg p-3 text-center lg:col-span-1 col-span-2">
                    <p className="text-gray-400">{t('stl.vertices')}</p>
                    <p className="font-semibold text-gray-200 text-sm sm:text-base">{stlInfo.vertices}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            <Select label={t('calc.resinType')} value={store.resinMaterial.type}
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
      <div className="glass rounded-2xl p-6 sm:p-8">
        {renderSectionHeader(SlidersHorizontal, t('calc.printParams'), 'Tempo, energia, falhas e impressora')}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
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
            <div className="sm:col-span-2 xl:col-span-4">
              <Select label={t('calc.printer')} value={store.selectedPrinter.id}
              onChange={handlePrinterSelect} portal
              options={printers.map(p => ({ label: p.name, value: p.id, image: p.image, subtitle: `${p.power}W · R$ ${p.value}`, group: p.brand }))}
              groups search />
            </div>
          )}
          <div className="sm:col-span-2 xl:col-span-4 glass rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-400">{t('calc.failure')}</span>
              <div className="flex flex-wrap gap-2">
                {(['none', 'percent', 'fixed'] as const).map(mode => {
                  const current = isFDM ? store.fdmPrintParams.failureMode : store.resinPrintParams.failureMode
                  const label = mode === 'none' ? t('calc.noFailure') : mode === 'percent' ? '%' : 'R$'
                  return (
                    <button key={mode}
                      onClick={() => isFDM
                        ? store.setFdmPrintParams({ ...store.fdmPrintParams, failureMode: mode, failureValue: mode === 'none' ? 0 : store.fdmPrintParams.failureValue })
                        : store.setResinPrintParams({ ...store.resinPrintParams, failureMode: mode, failureValue: mode === 'none' ? 0 : store.resinPrintParams.failureValue })
                      }
                      className={`px-3 min-h-[44px] text-xs sm:text-sm rounded-lg transition-all flex items-center ${current === mode ? `${themeBg} text-white` : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            {(isFDM ? store.fdmPrintParams.failureMode : store.resinPrintParams.failureMode) !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
        {renderSectionHeader(Wrench, t('calc.fdmHardware'), isFDM ? 'Bico, mesa e acabamento' : 'Washing, curing, LCD/FEP')}
        {isFDM && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-semibold text-sky-400">{t('calc.nozzle')}</span>
                  <ToggleSwitch enabled={store.fdmHardware.nozzleEnabled} onToggle={v => store.setFdmHardware({ ...store.fdmHardware, nozzleEnabled: v })} />
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
                  <ToggleSwitch enabled={store.fdmHardware.bedEnabled} onToggle={v => store.setFdmHardware({ ...store.fdmHardware, bedEnabled: v })} />
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
                <ToggleSwitch enabled={store.resinPostProcess.washingEnabled} onToggle={v => store.setResinPostProcess({ ...store.resinPostProcess, washingEnabled: v })} />
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
                <ToggleSwitch enabled={store.resinPostProcess.curingEnabled} onToggle={v => store.setResinPostProcess({ ...store.resinPostProcess, curingEnabled: v })} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
      <div className="glass rounded-2xl p-6 sm:p-8">
        {renderSectionHeader(Printer, t('calc.machine'), 'Depreciação e manutenção')}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          <InputGroup label={t('calc.machineCost')}
            value={isFDM ? store.fdmMachine.machineCost : store.resinMachine.machineCost}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmMachine({ ...store.fdmMachine, machineCost: val }) : store.setResinMachine({ ...store.resinMachine, machineCost: val }))} type="number" prefix="R$" />
          <InputGroup label={t('calc.depreciationMonths')}
            value={isFDM ? store.fdmMachine.depreciationMonths : store.resinMachine.depreciationMonths}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmMachine({ ...store.fdmMachine, depreciationMonths: val }) : store.setResinMachine({ ...store.resinMachine, depreciationMonths: val }))} type="number" unit="meses" />
          <InputGroup label={t('calc.hoursPerMonth')}
            value={isFDM ? store.fdmMachine.hoursPerMonth : store.resinMachine.hoursPerMonth}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmMachine({ ...store.fdmMachine, hoursPerMonth: val }) : store.setResinMachine({ ...store.resinMachine, hoursPerMonth: val }))} type="number" unit="h/mês" />
          <div className="sm:col-span-2 xl:col-span-3 flex items-center justify-between glass rounded-xl p-4 sm:p-5">
            <span className="text-xs text-gray-400">{t('calc.maintenance')}</span>
            <ToggleSwitch enabled={isFDM ? store.fdmMachine.maintenanceEnabled : store.resinMachine.maintenanceEnabled}
              onToggle={v => isFDM ? store.setFdmMachine({ ...store.fdmMachine, maintenanceEnabled: v }) : store.setResinMachine({ ...store.resinMachine, maintenanceEnabled: v })} />
          </div>
          {(isFDM ? store.fdmMachine.maintenanceEnabled : store.resinMachine.maintenanceEnabled) && (
            <div className="sm:col-span-2 xl:col-span-3">
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
      <div className="glass rounded-2xl p-6 sm:p-8">
        {renderSectionHeader(HardHat, t('calc.labor'), 'Setup, pós-processamento e taxa horária')}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
      <div className="glass rounded-2xl p-6 sm:p-8">
        {renderSectionHeader(ShieldCheck, t('calc.opsSoftware'), 'EPI, slicer e licença de modelo')}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-xs font-semibold text-gray-300">{t('calc.ppe')}</span>
              <ToggleSwitch enabled={isFDM ? store.fdmOps.enabled : store.resinOps.enabled}
                onToggle={v => isFDM ? store.setFdmOps({ ...store.fdmOps, enabled: v }) : store.setResinOps({ ...store.resinOps, enabled: v })} />
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
              <ToggleSwitch enabled={isFDM ? store.fdmSoft.enabled : store.resinSoft.enabled}
                onToggle={v => isFDM ? store.setFdmSoft({ ...store.fdmSoft, enabled: v }) : store.setResinSoft({ ...store.resinSoft, enabled: v })} />
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
      <div className="glass rounded-2xl p-6 sm:p-8">
        {renderSectionHeader(DollarSign, t('calc.sales'), 'Embalagem, frete, marketplace e margem')}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <InputGroup label={t('calc.quantity')}
              value={store.quantity}
              onChange={v => handleInput(v, val => store.setQuantity(val > 0 ? val : 1))} type="number" unit="un" />
            <InputGroup label={t('calc.infillPercent')}
              value={store.infillPercent}
              onChange={v => handleInput(v, val => store.setInfillPercent(val))} type="number" unit="%" />
          </div>
          <InputGroup label={t('calc.extras')}
            value={isFDM ? store.fdmExtras.extrasCost : store.resinExtras.extrasCost}
            onChange={v => handleInput(v, val => isFDM ? store.setFdmExtras({ extrasCost: val }) : store.setResinExtras({ extrasCost: val }))} type="number" prefix="R$" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <InputGroup label={t('calc.packaging')}
              value={isFDM ? store.fdmSales.packagingCost : store.resinSales.packagingCost}
              onChange={v => handleInput(v, val => isFDM ? store.setFdmSales({ ...store.fdmSales, packagingCost: val }) : store.setResinSales({ ...store.resinSales, packagingCost: val }))} type="number" prefix="R$" />
            <InputGroup label={t('calc.shipping')}
              value={isFDM ? store.fdmSales.shippingCost : store.resinSales.shippingCost}
              onChange={v => handleInput(v, val => isFDM ? store.setFdmSales({ ...store.fdmSales, shippingCost: val }) : store.setResinSales({ ...store.resinSales, shippingCost: val }))} type="number" prefix="R$" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Select label={t('calc.marketplace')} value={store.selectedMarketplace.id}
              onChange={handleMarketplaceChange}
              options={marketplaces.map(m => ({ label: m.name, value: m.id, subtitle: `${m.feePercent}% + R$ ${m.feeFixed}` }))} />
            <InputGroup label={t('calc.taxPercent')}
              value={isFDM ? store.fdmSales.taxPercent : store.resinSales.taxPercent}
              onChange={v => handleInput(v, val => isFDM ? store.setFdmSales({ ...store.fdmSales, taxPercent: val }) : store.setResinSales({ ...store.resinSales, taxPercent: val }))} type="number" unit="%" />
          </div>
          <div className="glass rounded-xl p-4 sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">{t('calc.markupPresets')}</span>
              <div className="flex flex-wrap gap-1.5">
                {[100, 150, 200, 250, 300, 500].map(pct => (
                  <button key={pct}
                    onClick={() => isFDM
                      ? store.setFdmSales({ ...store.fdmSales, profitMarginPercent: pct })
                      : store.setResinSales({ ...store.resinSales, profitMarginPercent: pct })
                    }
                    className={`px-3 min-h-[44px] text-[11px] sm:text-xs rounded-md transition-all flex items-center ${
                      (isFDM ? store.fdmSales.profitMarginPercent : store.resinSales.profitMarginPercent) === pct
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}>
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
            <InputGroup label={t('calc.profitMargin')}
              value={isFDM ? store.fdmSales.profitMarginPercent : store.resinSales.profitMarginPercent}
              onChange={v => handleInput(v, val => isFDM ? store.setFdmSales({ ...store.fdmSales, profitMarginPercent: val }) : store.setResinSales({ ...store.resinSales, profitMarginPercent: val }))} type="number" unit="%" />
          </div>
        </div>
      </div>
    )
  }

  function renderRightSidebar() {
    return <ResultsPanel variant="sidebar" />
  }

  function renderResultsSection() {
    return <ResultsPanel variant="mobile" />
  }

  return (
    <>
      <ToastContainer items={toastItems} onDismiss={dismissToast} />
      <div className="flex gap-4 xl:gap-6 pb-20 lg:pb-0">
        {/* Desktop sidebar — icon + label */}
        <nav className="hidden lg:flex flex-col gap-1 w-[128px] xl:w-[140px] shrink-0 sticky top-6 h-fit">
          {SECTIONS.map(s => (
            <button key={s.id}
              onClick={() => {
                setActiveSection(s.id)
                if (fullView) {
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className={`w-full py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition-all text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                activeSection === s.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
              }`}
              title={t(s.label)}>
              <s.Icon className={`w-4 h-4 shrink-0 ${activeSection === s.id ? 'text-indigo-400' : ''}`} />
              <span className="text-[11px] font-medium leading-tight">{s.short}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
        {/* ── Sticky Controls Bar ── */}
        <div className="sticky top-[68px] z-20 -mx-1 px-1 pt-0 pb-3" style={{ background: 'rgba(6,8,24,0.92)', backdropFilter: 'blur(20px)' }}>
          {/* FDM / Resin Tabs */}
          <div className="segmented-control mb-3">
            <button onClick={() => store.setActiveTab('fdm')}
              className={`segmented-btn focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${isFDM ? 'active-fdm' : ''}`}>
              <Printer className="w-4 h-4" />
              {t('calc.fdm')}
            </button>
            <button onClick={() => store.setActiveTab('resin')}
              className={`segmented-btn focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none ${!isFDM ? 'active-resin' : ''}`}>
              <FlaskConical className="w-4 h-4" />
              {t('calc.resin')}
            </button>
          </div>

          {/* Quick Mode + View Toggle row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 flex items-center justify-between glass rounded-xl px-4 py-3">
              <span className="text-sm font-semibold text-white">{t('calc.quickMode')}</span>
              <button onClick={() => store.setQuickMode(!store.quickMode)}
                aria-pressed={store.quickMode}
                className={`relative w-12 h-6 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none shrink-0 ${store.quickMode ? 'bg-purple-600' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${store.quickMode ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <button onClick={() => setFullView(!fullView)}
              className={`glass rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none whitespace-nowrap ${fullView ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
              {fullView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{fullView ? 'Ver tudo' : 'Por seção'}</span>
            </button>
          </div>

          {/* Sections Customization */}
          <div className="glass rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-slate-200">Seções ativas</span>
              <span className="text-xs text-slate-500">clique para ativar/desativar</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'material',       Icon: Layers,        label: 'Material' },
                { key: 'energy',         Icon: Zap,           label: 'Energia' },
                { key: 'machine',        Icon: Printer,       label: 'Máquina' },
                { key: 'hardware',       Icon: Wrench,        label: 'Hardware' },
                { key: 'consumables',    Icon: ShieldCheck,   label: 'Consumo' },
                { key: 'labor',          Icon: HardHat,       label: 'M. Obra' },
                { key: 'software',       Icon: Monitor,       label: 'Software' },
                { key: 'failure',        Icon: AlertTriangle, label: 'Falhas' },
                { key: 'extras',         Icon: Package,       label: 'Extras' },
                { key: 'postProcessing', Icon: Paintbrush,    label: 'Acabamento' },
                { key: 'packaging',      Icon: ClipboardList, label: 'Embalagem' },
                { key: 'shipping',       Icon: Truck,         label: 'Frete' },
              ] as { key: string; Icon: LucideIcon; label: string }[]).map(s => (
                <button key={s.key}
                  onClick={() => store.toggleSection(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    store.enabledSections[s.key]
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-500 border border-white/[0.08] hover:text-slate-300 hover:border-white/20'
                  }`}>
                  <s.Icon className={`w-3.5 h-3.5 ${store.enabledSections[s.key] ? 'text-indigo-400' : 'text-slate-600'}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* Product Name */}
          <div className="glass rounded-2xl px-5 py-5">
            <InputGroup label={t('calc.productName')} value={store.productName}
              onChange={v => store.setProductName(v)}
              type="text" placeholder={t('calc.productNamePlaceholder')} />
          </div>

          {/* Active Section — single or full view */}
          {fullView ? (
            <div className="space-y-4">
              <div id="section-material" className="scroll-mt-[280px]">{renderMaterialSection()}</div>
              <div id="section-print" className="scroll-mt-[280px]">{renderPrintSection()}</div>
              <div id="section-hardware" className="scroll-mt-[280px]">{renderHardwareSection()}</div>
              <div id="section-machine" className="scroll-mt-[280px]">{renderMachineSection()}</div>
              <div id="section-labor" className="scroll-mt-[280px]">{renderLaborSection()}</div>
              <div id="section-ops" className="scroll-mt-[280px]">{renderOpsSection()}</div>
              <div id="section-sales" className="scroll-mt-[280px]">{renderSalesSection()}</div>
              <div id="section-results" className="scroll-mt-[280px]">
                <div className="hidden lg:block"><ResultsPanel variant="sidebar" /></div>
                <div className="lg:hidden"><ResultsPanel variant="mobile" /></div>
              </div>
            </div>
          ) : (
            <>
              {activeSection === 'material' && renderMaterialSection()}
              {activeSection === 'print' && renderPrintSection()}
              {activeSection === 'hardware' && renderHardwareSection()}
              {activeSection === 'machine' && renderMachineSection()}
              {activeSection === 'labor' && renderLaborSection()}
              {activeSection === 'ops' && renderOpsSection()}
              {activeSection === 'sales' && renderSalesSection()}
              {activeSection === 'results' && renderResultsSection()}
            </>
          )}
        </div>

        {/* Desktop right sidebar — always visible */}
        <div className="hidden lg:flex flex-col gap-4 w-[320px] xl:w-[360px] shrink-0">
          {renderRightSidebar()}
        </div>
      </div>

      {/* Mobile bottom bar — consolidated nav + results */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Results mini-bar */}
        <div className="flex items-center justify-between gap-3 px-3 py-1.5 border-t border-white/[0.06]" style={{ background: 'rgba(6,8,24,0.92)', backdropFilter: 'blur(16px)' }}>
          <div className="flex gap-3 text-[11px]">
            <span className="text-slate-200"><span className="text-slate-500 mr-1">Custo</span>{fmtCurrency(results.totalCost)}</span>
            <span className="text-emerald-400 font-bold"><span className="text-slate-500 mr-1">Venda</span>{fmtCurrency(results.sellPrice)}</span>
            <span className="text-amber-400"><span className="text-slate-500 mr-1">Lucro</span>{fmtCurrency(results.profit)}</span>
          </div>
          <button onClick={() => store.addToHistory()} className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[9px] font-bold shrink-0 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none hover:bg-indigo-500 transition-colors">
            <FolderOpen className="w-2.5 h-2.5" />
            Salvar
          </button>
        </div>
        {/* Section nav */}
        <nav style={{ background: 'rgba(6,8,24,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex h-12 overflow-x-auto">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => {
                setActiveSection(s.id)
                if (fullView) {
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[48px] min-h-[44px] text-[8px] font-semibold tracking-wide transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  activeSection === s.id ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'
                }`}>
                <s.Icon className={`w-[15px] h-[15px] transition-transform ${activeSection === s.id ? 'scale-110' : ''}`} />
                <span className="truncate max-w-[48px] leading-tight">{s.short}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}
