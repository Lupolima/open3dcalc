import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { renderInlineMarkdown } from './renderInlineMarkdown'

interface VersionEntry {
  version: string
  date: string
  sections: { title: string; items: string[] }[]
}

export function ChangelogPage() {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<string>('1.4.0')

  const raw = t('changelog.versions', { returnObjects: true })
  const changelogData: VersionEntry[] = Array.isArray(raw) ? (raw as VersionEntry[]) : []

  const toggleVersion = (version: string) => {
    setExpanded(prev => prev === version ? '' : version)
  }

  const totalChanges = changelogData.reduce(
    (sum, v) => sum + v.sections.reduce((s, sec) => s + sec.items.length, 0),
    0,
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold gradient-text">Changelog</h2>
        </div>
        <p className="text-xs text-gray-500">
          {t('changelog.header', { versions: changelogData.length, changes: totalChanges })}
        </p>
      </div>

      {/* Version timeline */}
      <div className="relative space-y-4">
        {changelogData.map((entry, idx) => {
          const isOpen = expanded === entry.version
          return (
            <div key={entry.version} className="glass rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => toggleVersion(entry.version)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.03] transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-indigo-600/30 text-indigo-300' : 'bg-white/5 text-gray-400'
                  }`}>
                    {entry.version.split('.')[1]}
                  </span>
                  <div>
                    <span className={`text-sm font-bold ${idx === 0 ? 'text-white' : 'text-gray-300'}`}>
                      v{entry.version}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{entry.date}</span>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 animate-fade-in border-t border-white/[0.06] pt-4">
                  {entry.sections.map(section => (
                    <div key={section.title}>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                        {section.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2 pl-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-1.5 flex-shrink-0" />
                            {renderInlineMarkdown(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-xs text-gray-500">
          <a href="https://github.com/ils15/open3dcalc/releases" target="_blank" rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4 11.5 11.5 0 0 1 3 .4c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            {t('changelog.viewAllOnGitHub')}
          </a>
        </p>
      </div>
    </div>
  )
}

