import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🌊</div>
            <h2 className="text-white text-xl font-display mb-2 italic">出了点问题</h2>
            <p className="text-neutral-500 text-sm font-ui">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-white/10 rounded-lg text-white text-sm font-ui hover:bg-white/20 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}