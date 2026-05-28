import { Component } from 'react'
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
  name?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? ` - ${this.props.name}` : ''}]:`, error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  handleResetCalculator = () => {
    localStorage.removeItem('open3dcalc_settings_v2')
    window.location.reload()
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="glass rounded-2xl p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Algo deu errado
            </h3>
            <p className="text-xs text-gray-500">
              {this.state.error?.message || 'Ocorreu um erro inesperado nesta seção.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
            <button
              onClick={this.handleResetCalculator}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar calculadora
            </button>
          </div>
        </div>
      )
    }

    return <>{this.props.children}</>
  }
}
