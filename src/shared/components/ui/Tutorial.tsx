import { useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  FloatingPortal,
} from '@floating-ui/react'
import type { Placement } from '@floating-ui/react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTutorialStore, TUTORIAL_TOTAL_STEPS } from '@/shared/stores/tutorialStore'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

// ── Step config ──────────────────────────────────────────────────────────────

type StepKey = 'welcome' | 'material' | 'print' | 'sales' | 'results' | 'export' | 'complete'

interface StepConfig {
  key: StepKey
  /** CSS selector or data-tutorial attribute value */
  target: string | null
}

const STEPS: StepConfig[] = [
  { key: 'welcome',  target: null },
  { key: 'material', target: '[data-tutorial="material"]' },
  { key: 'print',    target: '[data-tutorial="print"]' },
  { key: 'sales',    target: '[data-tutorial="sales"]' },
  { key: 'results',  target: '[data-tutorial="results-sidebar"], [data-tutorial="results"]' },
  { key: 'export',   target: '[data-tutorial="export"]' },
  { key: 'complete', target: null },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function getElementRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector)
  if (!el) return null
  return el.getBoundingClientRect()
}

function padRect(rect: DOMRect, padding: number): DOMRect {
  return new DOMRect(
    rect.x - padding,
    rect.y - padding,
    rect.width + padding * 2,
    rect.height + padding * 2,
  )
}

// ── Overlay with spotlight hole ──────────────────────────────────────────────

function SpotlightOverlay({ targetRect, onClick }: { targetRect: DOMRect | null; onClick: () => void }) {
  const clipPath = useMemo(() => {
    if (!targetRect) return undefined
    const r = padRect(targetRect, 10)
    // Full viewport polygon minus spotlight rectangle (counter-clockwise cutout)
    return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${r.left}px ${r.top}px, ${r.left}px ${r.bottom}px, ${r.right}px ${r.bottom}px, ${r.right}px ${r.top}px, ${r.left}px ${r.top}px)`
  }, [targetRect])

  return (
    <div
      className="fixed inset-0 z-[55] pointer-events-auto"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        clipPath,
      }}
      onClick={onClick}
      aria-hidden="true"
      data-testid="tutorial-overlay"
    />
  )
}

// ── Tooltip card ─────────────────────────────────────────────────────────────

function TooltipCard({
  stepKey,
  currentStep,
  totalSteps,
  targetRect,
  onPrevious,
  onNext,
  onSkip,
  onFinish,
}: {
  stepKey: StepKey
  currentStep: number
  totalSteps: number
  targetRect: DOMRect | null
  onPrevious: () => void
  onNext: () => void
  onSkip: () => void
  onFinish: () => void
}) {
  const { t } = useTranslation()
  const isFirst = currentStep === 1
  const isLast = currentStep === totalSteps
  const hasSpotlight = targetRect !== null

  // ── Floating UI positioning (only when we have a target) ──
  const preferredPlacement: Placement = 'right-start'
  const { refs, floatingStyles, placement } = useFloating({
    placement: preferredPlacement,
    middleware: [
      offset(14),
      flip({ fallbackPlacements: ['left-start', 'bottom', 'top'] }),
      shift({ padding: 16 }),
    ],
    open: hasSpotlight,
    whileElementsMounted: autoUpdate,
  })

  // Stable callback ref for FloatingUI (avoids accessing refs.setFloating during render)
  const floatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setFloating(node)
    },
    [refs],
  )

  // Set virtual reference element positioned at the target
  useEffect(() => {
    if (!targetRect) return
    const virtual = document.createElement('div')
    virtual.style.position = 'fixed'
    virtual.style.left = `${targetRect.x}px`
    virtual.style.top = `${targetRect.y}px`
    virtual.style.width = `${targetRect.width}px`
    virtual.style.height = `${targetRect.height}px`
    virtual.style.pointerEvents = 'none'
    virtual.style.zIndex = '-1'
    document.body.appendChild(virtual)
    refs.setReference(virtual)
    return () => {
      document.body.removeChild(virtual)
    }
  }, [targetRect, refs])

  // Centered style when no spotlight
  const wrapperStyle = hasSpotlight
    ? { ...floatingStyles, position: 'fixed' as const, zIndex: 56, maxWidth: '300px', width: 'max-content' }
    : {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 56,
        maxWidth: '300px',
        width: 'max-content',
      }

  return (
    <FloatingPortal>
      <div
        ref={floatingRef}
        style={wrapperStyle}
        role="dialog"
        aria-modal="false"
        aria-label={t(`tutorial.steps.${stepKey}.title`)}
      >
        {/* Arrow (only when spotlight is active) */}
        {hasSpotlight && (
          <div
            className="absolute w-3 h-3 rotate-45"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              ...(placement === 'right-start'
                ? { left: '-6px', top: '24px' }
                : placement === 'left-start'
                  ? { right: '-6px', top: '24px' }
                  : placement === 'bottom'
                    ? { top: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
                    : { bottom: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' }),
            }}
          />
        )}

        {/* Card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onFinish}
            className="absolute top-2.5 right-2.5 z-10 p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
            aria-label={t('common.close')}
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Content */}
          <div className="px-5 pt-5 pb-4">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1.5 pr-6">
              {t(`tutorial.steps.${stepKey}.title`)}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {t(`tutorial.steps.${stepKey}.description`)}
            </p>
          </div>

          {/* Prominent skip button on the first (welcome) card */}
          {isFirst && (
            <div className="px-5 pb-3">
              <button
                onClick={onSkip}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
              >
                {t('tutorial.skip')}
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between">
            {/* Step counter */}
            <span className="text-[11px] text-[var(--color-text-muted)] font-medium tabular-nums">
              {t('tutorial.stepOf', { current: currentStep, total: totalSteps })}
            </span>

            {/* Navigation */}
            <div className="flex items-center gap-1.5">
              {!isFirst && (
                <button
                  onClick={onPrevious}
                  className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                  aria-label={t('tutorial.previous')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {!isFirst && !isLast && (
                <button
                  onClick={onSkip}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                >
                  {t('tutorial.skip')}
                </button>
              )}

              {isLast ? (
                <button
                  onClick={onFinish}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                >
                  {t('tutorial.finish')}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
                >
                  {t('tutorial.next')}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FloatingPortal>
  )
}

// ── Main Tutorial Component ──────────────────────────────────────────────────

export function Tutorial() {
  const prefersReduced = useReducedMotion()
  const {
    isActive,
    currentStep,
    nextStep,
    previousStep,
    finishTutorial,
    skipTutorial,
    completeStep,
    dismissTutorial,
    sessionDismissed,
  } = useTutorialStore()

  // Move hooks BEFORE early return to avoid "fewer hooks" errors
  // Compute target rect synchronously instead of setState in effect
  const targetRect = useMemo(() => {
    if (!isActive || sessionDismissed) return null
    const step = STEPS[currentStep - 1]
    if (!step?.target) return null
    return getElementRect(step.target)
  }, [isActive, sessionDismissed, currentStep])

  // Scroll target into view when step changes
  useEffect(() => {
    if (!isActive || sessionDismissed) return
    const step = STEPS[currentStep - 1]
    if (!step?.target) return

    const targetEl = document.querySelector(step.target)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' })
    }
  }, [isActive, sessionDismissed, currentStep, prefersReduced])

  // Keyboard navigation
  useEffect(() => {
    if (!isActive || sessionDismissed) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        finishTutorial()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentStep < TUTORIAL_TOTAL_STEPS) {
          completeStep(currentStep)
          nextStep()
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentStep > 1) {
          previousStep()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, sessionDismissed, currentStep, nextStep, previousStep, finishTutorial, completeStep])

  // Pause tutorial when a modal/dialog is open
  useEffect(() => {
    if (!isActive || sessionDismissed) return
    const checkModal = () => {
      const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
      if (modal) {
        // Modal opened — skip to next step or pause
        skipTutorial()
      }
    }
    // Use MutationObserver to detect modal insertion
    const observer = new MutationObserver(checkModal)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [isActive, sessionDismissed, skipTutorial])

  // Mark step as completed when navigating forward
  const handleNext = useCallback(() => {
    if (!isActive || sessionDismissed) return
    completeStep(currentStep)
    nextStep()
  }, [currentStep, nextStep, completeStep, isActive, sessionDismissed])

  const handleFinish = useCallback(() => {
    if (!isActive || sessionDismissed) return
    completeStep(currentStep)
    finishTutorial()
  }, [currentStep, finishTutorial, completeStep, isActive, sessionDismissed])

  // If the user dismissed the tutorial this session, don't show it
  if (!isActive || sessionDismissed) return null

  const step = STEPS[currentStep - 1]
  const duration = prefersReduced ? 0 : 0.2

  return (
    <>
      {/* Spotlight overlay */}
      <AnimatePresence>
        <motion.div
          key="tutorial-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          className="fixed inset-0 z-[55]"
        >
          <SpotlightOverlay targetRect={targetRect} onClick={dismissTutorial} />
        </motion.div>
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`tutorial-step-${currentStep}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration }}
        >
          <TooltipCard
            stepKey={step.key}
            currentStep={currentStep}
            totalSteps={TUTORIAL_TOTAL_STEPS}
            targetRect={targetRect}
            onPrevious={previousStep}
            onNext={handleNext}
            onSkip={skipTutorial}
            onFinish={handleFinish}
          />
        </motion.div>
      </AnimatePresence>
    </>
  )
}
