import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('stlParser dynamic imports', () => {
  it('should NOT have static imports of STLLoader or OBJLoader', () => {
    const sourcePath = resolve(__dirname, '../stlParser.ts')
    const source = readFileSync(sourcePath, 'utf-8')

    // Should NOT have top-level static import statements for three/addons loaders
    const staticImportPattern = /^import\s+.*from\s+['"]three\/addons\/loaders\//
    const lines = source.split('\n')
    const staticImports = lines.filter(line => staticImportPattern.test(line.trim()))

    expect(staticImports).toHaveLength(0)
  })

  it('should use dynamic import() for STLLoader', () => {
    const sourcePath = resolve(__dirname, '../stlParser.ts')
    const source = readFileSync(sourcePath, 'utf-8')

    // Should contain dynamic import for STLLoader
    expect(source).toMatch(/await\s+import\s*\(\s*['"]three\/addons\/loaders\/STLLoader/)
  })

  it('should use dynamic import() for OBJLoader', () => {
    const sourcePath = resolve(__dirname, '../stlParser.ts')
    const source = readFileSync(sourcePath, 'utf-8')

    // Should contain dynamic import for OBJLoader
    expect(source).toMatch(/await\s+import\s*\(\s*['"]three\/addons\/loaders\/OBJLoader/)
  })
})
