import { useTranslation } from 'react-i18next'
import { Box, Code2, Globe } from 'lucide-react'

export function Header() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const next = i18n.language === 'pt-BR' ? 'en-US' : 'pt-BR'
    i18n.changeLanguage(next)
  }

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        background: 'rgba(6,8,24,0.92)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 h-[68px] flex items-center justify-between gap-4">

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
              <h1 className="text-[17px] sm:text-[19px] font-black tracking-tight gradient-text">
                {t('app.title')}
              </h1>
              <span className="badge badge-indigo hidden sm:inline-flex">Beta</span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-slate-500 uppercase tracking-widest mt-0.5 hidden sm:block">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/ils15/open3dcalc"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 lg:p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            title="GitHub"
          >
            <Code2 className="w-5 h-5 lg:w-5 lg:h-5" />
          </a>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none min-w-[44px]"
            title="Mudar idioma"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{i18n.language === 'pt-BR' ? 'EN' : 'PT'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
