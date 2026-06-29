import React from 'react'

/**
 * Renders inline markdown patterns (**bold** and `code`) as React elements.
 * - `**text**` → <strong>text</strong>
 * - `` `text` `` → <code>text</code>
 *
 * Non-matching text is returned as plain strings.
 */
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let key = 0

  // Match **bold** or `code` — bold first so it's matched before the ` in **text**
  const pattern = /(\*\*(.+?)\*\*|`(.+?)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={key++} className="text-[var(--color-text-primary)] font-semibold">
          {match[2]}
        </strong>,
      )
    } else if (match[3]) {
      // `code`
      parts.push(
        <code
          key={key++}
          className="text-[10px] px-1 py-0.5 rounded bg-[var(--color-bg-hover)] text-[var(--color-accent-light)] font-mono"
        >
          {match[3]}
        </code>,
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
