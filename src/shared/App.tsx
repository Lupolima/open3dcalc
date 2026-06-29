/**
 * Re-export from the web platform App.
 *
 * After Phase 1 codebase unification, App.tsx moved from src/shared/
 * to src/platform/{web,desktop}/App.tsx. This file preserves backward
 * compatibility for tests and any remaining references to the old path.
 *
 * The web platform App is the primary shared App — it uses the same
 * shared components that tests expect (Header, Calculator, etc.) and
 * contains the tablet sidebar that TabletOptimization tests verify.
 */
export { default } from '@/platform/web/App'
