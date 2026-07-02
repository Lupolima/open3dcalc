# 🗺️ Open3DCalc — Roadmap

> **Date:** 07/01/2026
> **Purpose:** Priority guide for the evolution of Open3DCalc.
> **Flow:** Every feature follows → branch → PR → review → merge (`BRANCH-POLICY.md`)

---

## Priorities (Execution Order)

### 🔴 Phase 1: Usability & Tutorials

**Problem:** Current tutorials and onboarding are not good. We need a smoother experience that teaches users how to use the calculator without getting in the way.

**What to investigate first (real USAGE):**
- [x] Tooltips on 52+ calculator fields
- [x] LevelToggle renamed (Quick/Detailed/Complete)
- [x] Non-blocking interactive tutorial
- [x] Onboarding with CTA to tutorial
- [x] Skip link + heading hierarchy + accessibility
- [x] Tooltips migrated to i18n (pt-BR + en-US)
- [x] Minimum touch targets (44px) on buttons

**Deliverables:**
- [ ] Optional anonymous telemetry (opt-in) to understand real usage
- [ ] Rewritten interactive tutorial (step-by-step, non-blocking)
- [ ] Progressive onboarding (shows features as the user progresses)
- [ ] Contextual tooltips on calculator fields
- [ ] Informative empty states (when there is no data)
- [ ] Visual feedback for actions (undo, confirmation, animations)
- [ ] "Quick Start" mode with pre-filled values for testing

**Acceptance criteria:**
- Tutorial can be skipped/dismissed at any time
- No blockers — the user can use the calculator without going through the tutorial
- Telemetry is opt-in with explicit consent

---

### 🔶 Phase 1.5: Advanced Usability (PR #7)

**Features delivered in PR #6:** Tooltips, LevelToggle, Tutorial, Skip link, i18n tooltips, accessibility.

**Next cycle — UX refinements:**

#### 5. Quick Start with pre-filled values
- [x] "Quick Start" button that fills the calculator with realistic values
  - PLA R$90/kg, 150g, 2h print, 10% failure rate
  - 50% margin, packaging R$5, shipping R$15
- [x] "Example" vs "Start from scratch" mode
- [x] Tooltip on the button explaining values are editable
- **Files:** CalculatorStore (reset/quickStart action), UI button
- **Tests:** Verify quickStart fills correctly

#### 6. Empty states for sections without data
- [x] Empty history: "No calculations saved yet. Your first result will appear here."
- [x] Empty inventory: "Add filaments to your inventory to speed up calculations."
- [x] Empty quotes: "Create your first quote to send to the client."
- [x] Empty estimates: same approach
- **Files:** HistoryTab, InventorySection, QuoteSection
- **Tests:** Rendering with empty list

#### 7. Smooth scroll between sections
- [x] `scroll-behavior: smooth` in global CSS
- [x] Active section highlighted in navigation
- [x] Smooth scroll when clicking on SectionNav
- **Files:** index.css, SectionNav.tsx

#### 8. Keyboard shortcuts
- [x] `Ctrl+Z` — Undo last change (undo in calculatorStore)
- [x] `Ctrl+Shift+Z` — Redo
- [x] `Ctrl+E` — Export result
- [x] `Ctrl+P` — Print/PDF
- [x] `?` — Show shortcut help
- **Files:** New hook `useKeyboardShortcuts.ts`, calculatorStore (undo stack)
- **Tests:** Simulate keydown events

**Acceptance criteria:**
- Quick Start fills all essential fields
- Empty states have illustration/icon + text + CTA
- Smooth scroll does not break anchor navigation
- Shortcuts do not conflict with browser shortcuts
- All 448+ tests pass

### 🟡 Phase 2: STL Upload + Interactive 3D Preview

**Problem:** The 3D preview exists but is limited — there is no user STL upload or interactive visualization integrated with the calculation.

**What already exists:**
- `src/shared/components/StlPreview/StlPreview.tsx` — basic Three.js component
- `src/shared/lib/stlParser.ts` — STL parser (374 lines)
- Three.js + React Three Fiber + Drei already configured

**What needs to be done:**
- [ ] STL/OBJ/3MF file upload with drag & drop
- [ ] Interactive 3D preview (rotation, zoom, pan)
- [ ] Automatic volume calculation from the 3D model
- [ ] Weight and material estimation based on volume
- [ ] Layer visualization (slicing simulation)
- [ ] Automatic FDM vs Resin detection based on model
- [ ] Support for multiple uploads and comparison

**Acceptance criteria:**
- Upload via click + drag & drop
- Responsive 3D preview (works on mobile)
- Volume calculated correctly (validation with known models)
- Estimated cost appears automatically in the calculation

---

### 🟢 Phase 3: Advanced Dashboard

**Problem:** The current dashboard exists but is basic — it lacks projections, business metrics, and analyses that help the user make decisions.

**What already exists:**
- `src/shared/components/Dashboard/Dashboard.tsx`
- `src/shared/components/Dashboard/RechartsLazy.tsx`
- Recharts 2 already configured
- `historyStore.ts` with historical data

**What needs to be done:**
- [ ] Main KPIs: total profit, average cost per print, average margin
- [ ] Profit evolution chart (timeline)
- [ ] Cost distribution by category (pie/bar)
- [ ] Projections: "if you print X parts per month..."
- [ ] Period comparison (current month vs previous)
- [ ] Top most profitable printers
- [ ] Top most used materials
- [ ] Executive report export (PDF)
- [ ] Custom goals (e.g., "I want to profit R$500/month")
- [ ] Low margin alerts for recurring parts

**Acceptance criteria:**
- Dashboard loads fast with historical data
- Responsive charts
- PDF export functional
- Real data (not mocked)

---

## 📊 Quality Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Test coverage (overall) | ~33% | ≥60% |
| Coverage (calculation) | ~85% | ≥90% |
| Tests | 417 | 500+ |
| Components with tests | Partial | 100% |
| Accessibility (a11y) | — | WCAG A |

## 🔒 Not in scope (for now)

- ❌ Cloud sync / multi-user
- ❌ Integration with supplier APIs
- ❌ FDM vs Resin comparison (not meaningful — each serves a different purpose)
- ❌ 3D model marketplace

---

## How to contribute

1. Pick an issue or feature from this roadmap
2. Create branch: `feat/<feature-name>`
3. Develop with TDD (RED → GREEN → REFACTOR)
4. Commit following [Conventional Commits](https://www.conventionalcommits.org/)
5. Open PR → wait for review → merge

---

_Updated July 2026. This roadmap is alive and changes based on user feedback._
