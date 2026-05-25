import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Sparkles, Github } from 'lucide-react'

interface VersionEntry {
  version: string
  date: string
  sections: { title: string; items: string[] }[]
}

export function ChangelogPage() {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<string>('1.4.0')

  const changelogData = t('changelog.versions', { returnObjects: true }) as VersionEntry[]

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
                            {item}
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
            <Github className="w-3.5 h-3.5" />
            {t('changelog.viewAllOnGitHub')}
          </a>
        </p>
      </div>
    </div>
  )
}

