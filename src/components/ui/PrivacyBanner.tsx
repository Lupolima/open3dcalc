import { Shield, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useConsentStore } from '@/stores/consentStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function PrivacyBanner() {
  const { t } = useTranslation()
  const prefersReduced = useReducedMotion()
  const dismissed = useConsentStore((s) => s.privacyBannerDismissed)
  const dismissBanner = useConsentStore((s) => s.dismissBanner)

  if (dismissed) return null

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      className="sticky top-0 z-30 w-full border-b border-white/[0.06]"
      style={{
        background: 'rgba(6, 8, 24, 0.88)',
        backdropFilter: 'blur(16px) saturate(1.4)',
      }}
    >
      <div className="max-w-[1440px] mx-auto flex items-start gap-3 px-4 sm:px-6 py-3">
        <Shield className="w-5 h-5 mt-0.5 shrink-0 text-indigo-400" aria-hidden="true" />
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex-1">
          {t('privacy.banner.text')}
        </p>
        <button
          onClick={dismissBanner}
          className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label={t('privacy.banner.dismiss')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
