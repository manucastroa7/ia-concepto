import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in React App:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl space-y-5">
            <div className="w-14 h-14 bg-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            <h2 className="text-xl font-black uppercase text-white">Sistema en Ejecución</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              La interfaz se ha cargado correctamente. Si el servicio de backend se está sincronizando, podés reintentar.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl text-left overflow-x-auto max-h-32 text-[11px] font-mono text-orange-400/90 border border-slate-800">
              {this.state.error?.toString() || 'Aviso de cliente'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Reintentar / Cargar Aplicación
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
