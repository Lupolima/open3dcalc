import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronRight, ArrowLeft } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const ONBOARDING_KEY = 'open3dcalc_onboarded'

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

interface OnboardingModalProps {
  onComplete?: () => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()
  const [[slideIndex, direction], setSlideState] = useState([0, 0])
  const [visible, setVisible] = useState(() => !localStorage.getItem(ONBOARDING_KEY))

  const totalSlides = 3
  const isLastSlide = slideIndex === totalSlides - 1
  const isFirstSlide = slideIndex === 0

  const goToSlide = useCallback((index: number) => {
    setSlideState([index, index > slideIndex ? 1 : -1])
  }, [slideIndex])

  const nextSlide = useCallback(() => {
    if (slideIndex < totalSlides - 1) {
      goToSlide(slideIndex + 1)
    }
  }, [slideIndex, goToSlide])

  const prevSlide = useCallback(() => {
    if (slideIndex > 0) {
      goToSlide(slideIndex - 1)
    }
  }, [slideIndex, goToSlide])

  const dismiss = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setVisible(false)
    onComplete?.()
  }, [onComplete])

  if (!visible) return null

  const slides = [
    {
      icon: '🧮',
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.description'),
    },
    {
      icon: '⚙️',
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.description'),
    },
    {
      icon: '💾',
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.description'),
    },
  ]

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={t('onboarding.title')}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        }}
      >
        {/* Close / Skip button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label={t('common.close')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Slides */}
        <div className="px-6 pt-10 pb-6 min-h-[280px] flex flex-col items-center text-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slideIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: prefersReduced ? 0 : 0.25, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <span className="text-5xl" role="img" aria-hidden="true">
                {slides[slideIndex].icon}
              </span>
              <h2 className="text-lg font-bold text-white">
                {slides[slideIndex].title}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                {slides[slideIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: dots + actions */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {/* Previous button */}
          <button
            onClick={prevSlide}
            disabled={isFirstSlide}
            className={`p-2 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
              isFirstSlide
                ? 'text-gray-700 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Anterior"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                  i === slideIndex
                    ? 'bg-indigo-500 w-5'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Next / Finish button */}
          {isLastSlide ? (
            <button
              onClick={dismiss}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              {t('onboarding.start')}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={nextSlide}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
