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
  const [expanded, setExpanded] = useState<string>('')

  const raw = t('changelog.versions', { returnObjects: true })
  const changelogData: VersionEntry[] = (Array.isArray(raw) ? (raw as VersionEntry[]) : []).sort((a, b) => {
    const va = a.version.split('.').map(Number)
    const vb = b.version.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (va[i] !== vb[i]) return vb[i] - va[i]
    }
    return 0
  })

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
      <div className="surface rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
          <h2 className="text-lg font-bold gradient-text">Changelog</h2>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {t('changelog.header', { versions: changelogData.length, changes: totalChanges })}
        </p>
      </div>

      {/* Version timeline */}
      <div className="relative space-y-4">
        {changelogData.map((entry, idx) => {
          const isOpen = expanded === entry.version
          return (
            <div key={entry.version} className="surface rounded-xl overflow-hidden transition-all">
              <button
                onClick={() => toggleVersion(entry.version)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-bg-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-[var(--color-accent)]/30 text-[var(--color-accent)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'
                  }`}>
                    {entry.version.split('.')[1]}
                  </span>
                  <div>
                    <span className={`text-sm font-bold ${idx === 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                      v{entry.version}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">{entry.date}</span>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 animate-fade-in border-t border-[var(--color-border)] pt-4">
                  {entry.sections.map(section => (
                    <div key={section.title}>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                        {section.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2 pl-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]/50 mt-1.5 flex-shrink-0" />
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
      <div className="surface rounded-xl p-5 text-center space-y-3">
        <p className="text-xs text-[var(--color-text-muted)]">
          <a href="https://github.com/ils15/open3dcalc/releases" target="_blank" rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4 11.5 11.5 0 0 1 3 .4c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            {t('changelog.viewAllOnGitHub')}
          </a>
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--color-text-muted)]">
          <a href="https://github.com/ils15/open3dcalc" target="_blank" rel="noopener noreferrer"
            className="hover:text-[var(--color-text-secondary)] transition-colors inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4 11.5 11.5 0 0 1 3 .4c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a href="https://t.me/Impressao3DBR" target="_blank" rel="noopener noreferrer"
            className="hover:text-[var(--color-text-secondary)] transition-colors inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.441-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141a.506.506 0 0 1 .171.325c.016.093.036.306.02.472z"/>
            </svg>
            Telegram
          </a>
          <span>·</span>
          <a href="https://ofertachina.com.br" target="_blank" rel="noopener noreferrer"
            className="hover:text-[var(--color-text-secondary)] transition-colors">
            ofertachina.com.br
          </a>
        </div>
      </div>
    </div>
  )
}

