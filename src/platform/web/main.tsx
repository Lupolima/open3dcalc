import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/platform/web/App'
import '@/shared/i18n/i18n'
import './index.css'
import { initTheme } from '@/shared/hooks/useTheme'

// Initialize theme BEFORE React renders to prevent flash of wrong theme.
initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
