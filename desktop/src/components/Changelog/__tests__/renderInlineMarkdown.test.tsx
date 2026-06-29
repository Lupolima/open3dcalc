import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderInlineMarkdown } from '../renderInlineMarkdown'

describe('renderInlineMarkdown', () => {
  it('renders plain text as-is', () => {
    const { container } = render(<>{renderInlineMarkdown('Hello world')}</>)
    expect(container.textContent).toBe('Hello world')
  })

  it('renders **bold** as <strong>', () => {
    render(<>{renderInlineMarkdown('**bold text**')}</>)
    const strong = screen.getByText('bold text')
    expect(strong.tagName).toBe('STRONG')
  })

  it('renders `code` as <code>', () => {
    render(<>{renderInlineMarkdown('`code text`')}</>)
    const code = screen.getByText('code text')
    expect(code.tagName).toBe('CODE')
  })

  it('renders mixed bold and code in same string', () => {
    const parts = renderInlineMarkdown('**bold** and `code` here')
    const { container } = render(<>{parts}</>)
    expect(screen.getByText('bold').tagName).toBe('STRONG')
    expect(screen.getByText('code').tagName).toBe('CODE')
    expect(container.textContent).toMatch(/^bold and code here$/)
  })

  it('renders **bold** followed by `code` with text in between', () => {
    const parts = renderInlineMarkdown('**53 testes unitários** em `calculator.ts`')
    const { container } = render(<>{parts}</>)
    expect(screen.getByText('53 testes unitários').tagName).toBe('STRONG')
    expect(screen.getByText('calculator.ts').tagName).toBe('CODE')
    expect(container.textContent).toMatch(/^53 testes unitários em calculator\.ts$/)
  })

  it('renders multiple bold segments', () => {
    const parts = renderInlineMarkdown('**first** and **second**')
    render(<>{parts}</>)
    const strongs = document.querySelectorAll('strong')
    expect(strongs).toHaveLength(2)
    expect(strongs[0].textContent).toBe('first')
    expect(strongs[1].textContent).toBe('second')
  })

  it('renders multiple code segments', () => {
    const parts = renderInlineMarkdown('`a.ts` and `b.ts`')
    render(<>{parts}</>)
    const codes = document.querySelectorAll('code')
    expect(codes).toHaveLength(2)
    expect(codes[0].textContent).toBe('a.ts')
    expect(codes[1].textContent).toBe('b.ts')
  })

  it('handles text with no markdown', () => {
    const parts = renderInlineMarkdown('Just some plain text.')
    render(<>{parts}</>)
    expect(document.body.textContent).toBe('Just some plain text.')
  })

  it('handles empty string', () => {
    const parts = renderInlineMarkdown('')
    render(<>{parts}</>)
    expect(document.body.textContent).toBe('')
  })

  it('handles text starting with bold', () => {
    const parts = renderInlineMarkdown('**start** and then plain')
    render(<>{parts}</>)
    const strong = screen.getByText('start')
    expect(strong.tagName).toBe('STRONG')
    expect(document.body.textContent).toMatch(/^start and then plain$/)
  })

  it('handles text ending with code', () => {
    const parts = renderInlineMarkdown('plain and then `end`')
    render(<>{parts}</>)
    const code = screen.getByText('end')
    expect(code.tagName).toBe('CODE')
    expect(document.body.textContent).toMatch(/^plain and then end$/)
  })
})
