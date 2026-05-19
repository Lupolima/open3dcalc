import { useTranslation } from 'react-i18next'

export function Header() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const next = i18n.language === 'pt-BR' ? 'en-US' : 'pt-BR'
    i18n.changeLanguage(next)
  }

  return (
    <header className="glass sticky top-0 z-10 border-b border-white/10 shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold">
            <span className="gradient-text">{t('app.title')}</span>
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">
            {t('app.subtitle')}
          </p>
        </div>
        <button
          onClick={toggleLanguage}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg glass text-gray-300 hover:text-white transition-colors"
        >
          {i18n.language === 'pt-BR' ? 'EN' : 'PT'}
        </button>
      </div>
    </header>
  )
}
