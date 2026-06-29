import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n/i18n'
import './index.css'
import { initPersistenceBridge } from './overrides/persistence-bridge'
import { initTheme } from './hooks/useTheme'

// Initialize theme BEFORE React renders to prevent flash of wrong theme.
initTheme()

// Initialize SQLite persistence bridge BEFORE React renders.
// This loads data from SQLite → localStorage so Zustand stores
// hydrate with durable data instead of stale/empty localStorage.
initPersistenceBridge().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
