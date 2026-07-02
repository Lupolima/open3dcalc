import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Globe, ChevronDown, BookOpen } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useCalculatorStore } from '@/shared/stores/calculatorStore'
import { useTutorialStore } from '@/shared/stores/tutorialStore'
import { CURRENCIES, type CurrencyCode } from '@/shared/lib/currency'
import { useCurrency } from '@/shared/hooks/useCurrency'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { t, i18n } = useTranslation()
  const { currency: currencySetting, setCurrency } = useCalculatorStore(
    useShallow((s) => ({ currency: s.currency, setCurrency: s.setCurrency })),
  )
  const { symbol } = useCurrency()
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleLanguage = () => {
    const next = i18n.language === 'pt-BR' ? 'en-US' : 'pt-BR'
    i18n.changeLanguage(next)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowCurrencyMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        background: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 h-[68px] flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 2px 12px rgba(79,70,229,0.4)',
            }}
          >
            <Box className="w-[22px] h-[22px] text-white" strokeWidth={2} />
          </div>

          <div className="leading-none">
            <div className="flex items-center gap-2">
              <span className="text-[17px] sm:text-[19px] font-black tracking-tight gradient-text">
                {t('app.title')}
              </span>
              <span className="badge badge-indigo hidden sm:inline-flex">Beta</span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5 hidden sm:block">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">

          {/* Tutorial trigger */}
          <button
            onClick={() => useTutorialStore.getState().startTutorial()}
            className="flex items-center gap-2 p-2.5 lg:px-3.5 lg:py-2.5 min-h-[44px] min-w-[44px] text-[var(--color-accent-light)] hover:text-[var(--color-accent-light)] hover:bg-[var(--color-accent-muted)] transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none rounded-xl border border-transparent hover:border-[var(--color-accent-muted)]"
            title={t('nav.tutorial')}
            aria-label={t('nav.tutorial')}
          >
            <BookOpen className="w-5 h-5" />
            <span className="hidden lg:inline text-[13px] font-semibold">{t('nav.tutorial')}</span>
          </button>

          {/* Currency selector */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowCurrencyMenu(v => !v)}
              className="flex items-center gap-1 text-[13px] font-semibold px-3 py-2.5 rounded-lg min-h-[44px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
              title={t('settings.currency')}
            >
              <span className="font-mono">{symbol}</span>
              {currencySetting === 'auto' && (
                <span className="hidden sm:inline text-[10px] text-[var(--color-text-muted)] font-normal">auto</span>
              )}
              <ChevronDown className="w-3 h-3 opacity-40" />
            </button>

            {showCurrencyMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl shadow-2xl z-50 overflow-hidden surface border border-[var(--color-border)]">
                <button
                  onClick={() => { setCurrency('auto'); setShowCurrencyMenu(false) }}
                  className={`w-full px-3.5 py-2.5 text-left text-[12px] flex items-center gap-2 hover:bg-[var(--color-bg-hover)] transition-colors ${currencySetting === 'auto' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}
                >
                  <span className="font-mono font-bold w-6">{symbol}</span>
                  <span>{t('settings.currencyAuto')}</span>
                  {currencySetting === 'auto' && <span className="ml-auto text-[var(--color-accent)]">✓</span>}
                </button>
                <div className="border-t border-[var(--color-border)]" />
                {(Object.entries(CURRENCIES) as [CurrencyCode, typeof CURRENCIES[CurrencyCode]][]).map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => { setCurrency(code); setShowCurrencyMenu(false) }}
                    className={`w-full px-3.5 py-2.5 text-left text-[12px] flex items-center gap-2 hover:bg-[var(--color-bg-hover)] transition-colors ${currencySetting === code ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}
                  >
                    <span className="font-mono font-bold w-6">{info.symbol}</span>
                    <span>{code}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{info.name}</span>
                    {currencySetting === code && <span className="text-[var(--color-accent)] ml-1">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2.5 min-h-[44px] rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none min-w-[44px]"
            title={t('nav.language')}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{i18n.language === 'pt-BR' ? 'EN' : 'PT'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
