import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import { usePwaUpdate } from '@/hooks/usePwaUpdate'

/**
 * Banner de notificação "Nova versão disponível" com estilo glassmorphism.
 * Aparece na parte inferior da tela quando o service worker detecta
 * uma nova versão do app.
 */
export function PwaUpdatePrompt() {
  const { needUpdate, update } = usePwaUpdate()

  return (
    <AnimatePresence>
      {needUpdate && (
        <motion.div
          key="pwa-update-prompt"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 z-[60] mx-auto max-w-md"
          role="alert"
          aria-live="polite"
        >
          <div className="glass-elevated rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg">
            {/* Ícone */}
            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400">
              <RotateCw className="w-5 h-5" />
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100">
                Nova versão disponível
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Atualize para aproveitar as melhorias
              </p>
            </div>

            {/* Botão Atualizar */}
            <button
              onClick={update}
              className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none shadow-md"
            >
              Atualizar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
