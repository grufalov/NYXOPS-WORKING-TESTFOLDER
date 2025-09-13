import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null, copied: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  async componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
    this.setState({ info })
    const webhook = import.meta?.env?.VITE_ERROR_WEBHOOK
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: String(error?.message || error),
            stack: String(error?.stack || ''),
            componentStack: info?.componentStack || '',
            url: typeof window !== 'undefined' ? window.location.href : '',
            time: new Date().toISOString(),
          }),
        })
      } catch (e) {
        console.warn('Error reporting failed', e)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const details = `${String(this.state.error)}\n\n${this.state.error?.stack || ''}\n\n${this.state.info?.componentStack || ''}`
      return (
        <div className="fixed top-4 right-4 z-[1100] max-w-md rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 shadow">
          <div className="font-medium mb-2">Something went wrong</div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => window.location.reload()}
              className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
            >Reload app</button>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(details)
                  this.setState({ copied: true })
                  setTimeout(() => this.setState({ copied: false }), 1500)
                } catch {}
              }}
              className="px-2 py-1 rounded border border-red-300 text-red-700 text-xs bg-white/60 hover:bg-white"
            >{this.state.copied ? 'Copied!' : 'Copy details'}</button>
          </div>
          <pre className="whitespace-pre-wrap text-[11px] leading-snug max-h-60 overflow-auto opacity-80">{details}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
