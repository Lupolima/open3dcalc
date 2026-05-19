import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { CalculationResult } from '@/types'

interface DashboardProps {
  result: CalculationResult | null
}

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6']

function formatMoney(value: number) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function Dashboard({ result }: DashboardProps) {
  const { t } = useTranslation()

  if (!result) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[t('dashboard.totalCost'), t('dashboard.salePrice'), t('dashboard.profit'), t('dashboard.roi')].map(label => (
          <div key={label} className="glass rounded-2xl p-4 text-center hover:-translate-y-0.5 transition-transform">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-lg font-extrabold text-gray-500">---</p>
          </div>
        ))}
      </section>
    )
  }

  const chartData = [
    { name: t('breakdown.material'), value: result.costs.material },
    { name: t('breakdown.energy'), value: result.costs.energy },
    { name: t('breakdown.depreciation'), value: result.costs.depreciation },
    { name: t('breakdown.maintenance'), value: result.costs.maintenance },
    { name: t('breakdown.labor'), value: result.costs.labor },
    { name: t('breakdown.packaging'), value: result.costs.packaging },
    { name: t('breakdown.finishing'), value: result.costs.finishing },
  ].filter(d => d.value > 0)

  return (
    <section className="mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">{t('dashboard.totalCost')}</p>
          <p className="text-lg font-extrabold text-pink-400">{formatMoney(result.totalWithFailure)}</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">{t('dashboard.salePrice')}</p>
          <p className="text-lg font-extrabold text-emerald-400">{formatMoney(result.finalPrice)}</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">{t('dashboard.profit')}</p>
          <p className={`text-lg font-extrabold ${result.profit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
            {formatMoney(result.profit)}
          </p>
        </div>
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">{t('dashboard.roi')}</p>
          <p className={`text-lg font-extrabold ${result.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {result.roi.toFixed(0)}%
          </p>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-300 mb-3">{t('breakdown.title')}</p>
          <div className="flex items-center gap-4">
            <div className="w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={false}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value: number) => formatMoney(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {chartData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-400">{d.name}</span>
                  <span className="text-gray-200 font-semibold ml-auto">{formatMoney(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
