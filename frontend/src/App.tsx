import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { Search, Users, Sparkles, Settings, History, DollarSign, Shield, Globe } from 'lucide-react'
import { TariffSearch } from './components/TariffSearch'
import { AgencySettings } from './components/AgencySettings'
import ManualQuoteBuilder from './components/ManualQuoteBuilder'
import { SalesTracker } from './components/SalesTracker'
import { OperatorManager } from './components/OperatorManager'
import { PassengerManager } from './components/PassengerManager'
import { WebPackageManager } from './components/WebPackageManager'

type Tab = 'tariffs' | 'settings' | 'manual-quote' | 'sales' | 'operators' | 'passengers' | 'web-packages'

const TABS = [
  { id: 'tariffs' as Tab, label: 'Ofertas', icon: Search },
  { id: 'manual-quote' as Tab, label: 'Cotizador', icon: Sparkles },
  { id: 'passengers' as Tab, label: 'Pasajeros', icon: Users },
  { id: 'sales' as Tab, label: 'Ventas', icon: DollarSign },
  { id: 'operators' as Tab, label: 'Operadores', icon: Shield },
  { id: 'web-packages' as Tab, label: 'Vidriera Web', icon: Globe },
  { id: 'settings' as Tab, label: 'Marca', icon: Settings },
]

function App() {
  const [tab, setTab] = useState<Tab>('tariffs')
  const [branding, setBranding] = useState<any>(null)

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
    try {
      const res = await axios.get('/api/settings')
      setBranding(res.data)
    } catch (e) {}
  }

  return (
    <div className="flex w-full min-w-0 h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm z-50">
        {/* Sidebar Header / Logo */}
        <div className="px-6 py-8 border-b border-slate-100">
          {branding?.logoFullUrl ? (
            <div className="w-full h-[70px] overflow-hidden">
              <img 
                src={branding.logoFullUrl} 
                alt="Logo" 
                className="w-full h-full object-cover"
                style={{ objectPosition: '50% 48%' }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[1.2rem] bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <p className="text-base font-black text-slate-900 tracking-tighter leading-none">
                {branding?.name || 'CONCEPTO'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          <p className="section-label px-4 mb-4">Módulos Principales</p>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all group
                ${tab === t.id
                   ? 'bg-white text-slate-900 border border-slate-100 shadow-xl shadow-slate-200/50'
                   : 'text-slate-900 hover:bg-slate-50'}
              `}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${tab === t.id ? 'bg-orange-50 text-orange-500 shadow-sm border border-orange-100' : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'}`}>
                <t.icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">{t.label}</span>
              {tab === t.id && (
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50" />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-slate-200">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Expert Model AI
            </div>
            <p className="text-[10px] text-blue-800/70 leading-relaxed font-bold uppercase tracking-tight">Gemini 3.1 Pro activo.</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top bar for fluid layout context */}
        <header className="h-20 border-b border-slate-200 flex items-center px-8 bg-white z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Core Suite</span>
            <span className="text-slate-200 text-lg">/</span>
            <span className="badge badge-orange">{TABS.find(t => t.id === tab)?.label}</span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
             {/* Global Actions can go here */}
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden px-4 py-4 md:px-6 md:py-6 lg:px-8 custom-scrollbar">
          <div className="max-w-screen-2xl mx-auto w-full min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {tab === 'tariffs' && <TariffSearch />}
            {tab === 'manual-quote' && <ManualQuoteBuilder />}
            {tab === 'sales' && <SalesTracker />}
            {tab === 'operators' && <OperatorManager />}
            {tab === 'passengers' && <PassengerManager />}
            {tab === 'web-packages' && <WebPackageManager />}
            {tab === 'settings' && <AgencySettings />}
          </div>
        </main>
      </div>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', fontSize: '14px', borderRadius: '12px' } }} />
    </div>
  )
}

export default App
