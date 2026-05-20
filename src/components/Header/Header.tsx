import { useTranslation } from 'react-i18next'

export function Header() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const next = i18n.language === 'pt-BR' ? 'en-US' : 'pt-BR'
    i18n.changeLanguage(next)
  }

  return (
    <header className="glass sticky top-0 z-10 border-b border-white/10 shadow-xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-purple-900/40 shrink-0">
            3D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold">
                <span className="gradient-text">{t('app.title')}</span>
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/40 text-purple-300 uppercase tracking-wider">
                Beta
              </span>
            </div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider leading-none">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/ils15/open3dcalc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg glass text-gray-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4 11.5 11.5 0 0 1 3 .4c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <button
            onClick={toggleLanguage}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg glass text-gray-300 hover:text-white hover:bg-white/10 transition-colors min-w-[44px] focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
          >
            {i18n.language === 'pt-BR' ? 'EN' : 'PT'}
          </button>
        </div>
      </div>
    </header>
  )
}
