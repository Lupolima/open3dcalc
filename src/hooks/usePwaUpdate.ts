import { useRegisterSW } from 'virtual:pwa-register/react'

export interface UsePwaUpdateReturn {
  /** Indica se uma nova versão do app está disponível */
  needUpdate: boolean
  /** Dispara a atualização: skipWaiting + reload */
  update: () => void
}

/**
 * Hook que monitora o service worker e detecta novas versões.
 * Usa `registerType: 'prompt'` para permitir que o usuário decida
 * quando atualizar, em vez de atualizar automaticamente.
 */
export function usePwaUpdate(): UsePwaUpdateReturn {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        console.log('[PWA] Service worker registrado:', registration.scope)
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Erro ao registrar service worker:', error)
    },
  })

  return {
    needUpdate: needRefresh,
    update: () => {
      updateServiceWorker()
    },
  }
}
