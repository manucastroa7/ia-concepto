import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { 
  Search, Users, Sparkles, Settings, DollarSign, Shield, Globe, 
  Calculator, Wallet, Image, History, ChevronDown, ChevronRight,
  TrendingUp, Megaphone, Briefcase, Sparkle, Database
} from 'lucide-react'
import { TariffSearch } from './components/TariffSearch'
import { AgencySettings } from './components/AgencySettings'
import ManualQuoteBuilder from './components/ManualQuoteBuilder'
import { SalesTracker } from './components/SalesTracker'
import { OperatorManager } from './components/OperatorManager'
import { PassengerManager } from './components/PassengerManager'
import { WebPackageManager } from './components/WebPackageManager'
import { GroupQuoteManager } from './components/GroupQuoteManager'
import { TreasuryManager } from './components/TreasuryManager'
import { FlyerExtractor } from './components/FlyerExtractor'
import { FlyerHistory } from './components/FlyerHistory'

export type Tab = 
  | 'tariffs' 
  | 'manual-quote' 
  | 'group-quotes' 
  | 'operators' 
  | 'passengers' 
  | 'sales' 
  | 'treasury' 
  | 'web-packages' 
  | 'flyer-extractor' 
  | 'flyer-history' 
  | 'settings'

interface SubItem {
  id: Tab
  label: string
  description?: string
  icon: any
  badge?: string
}

interface NavGroup {
  category: string
  icon: any
  items: SubItem[]
}

const MENU_GROUPS: NavGroup[] = [
  {
    category: 'Comercial & Cotizaciones',
    icon: Briefcase,
    items: [
      { id: 'tariffs', label: 'Buscador de Ofertas', description: 'Tarifas y circuitos', icon: Search },
      { id: 'manual-quote', label: 'Cotizador Manual', description: 'Cotización personalizada', icon: Sparkles },
      { id: 'group-quotes', label: 'Cotizador de Grupos', description: 'Presupuesto contingentes', icon: Calculator },
    ]
  },
  {
    category: 'Base de datos',
    icon: Database,
    items: [
      { id: 'operators', label: 'Proveedores/Operadores', description: 'Gestión de operadores', icon: Shield },
      { id: 'passengers', label: 'Pasajeros', description: 'Directorio de pax', icon: Users },
    ]
  },
  {
    category: 'Gestión Financiera',
    icon: TrendingUp,
    items: [
      { id: 'sales', label: 'Seguimiento de Ventas', description: 'Ventas y cobros', icon: DollarSign },
      { id: 'treasury', label: 'Tesorería & Cuentas', description: 'Movimientos de caja', icon: Wallet },
    ]
  },
  {
    category: 'Marketing & Difusión',
    icon: Megaphone,
    items: [
      { id: 'web-packages', label: 'Vidriera Web (CRM)', description: 'Publicación en el sitio', icon: Globe },
      { id: 'flyer-extractor', label: 'Extractor de Flyers', description: 'Extraer PDF/Imagen con IA', icon: Image, badge: 'IA' },
      { id: 'flyer-history', label: 'Historial de Flyers', description: 'Biblioteca de promociones', icon: History },
    ]
  },
  {
    category: 'Configuración',
    icon: Settings,
    items: [
      { id: 'settings', label: 'Identidad & Marca', description: 'Ajustes generales', icon: Settings },
    ]
  }
]

export function App() {
  const [tab, setTab] = useState<Tab>('tariffs')
  const [branding, setBranding] = useState<any>(null)
  
  // Track open state of category accordions
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Comercial & Cotizaciones': true,
    'Base de datos': true,
    'Gestión Financiera': true,
    'Marketing & Difusión': true,
    'Configuración': true,
  })

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
    try {
      const res = await axios.get('/api/settings')
      setBranding(res.data)
    } catch (e) {}
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Find active item info for breadcrumbs
  const activeItem = MENU_GROUPS.flatMap(g => g.items).find(i => i.id === tab)
  const activeGroup = MENU_GROUPS.find(g => g.items.some(i => i.id === tab))

  return (
    <div className="flex w-full min-w-0 h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* MODERN ELEGANT SIDEBAR */}
      <aside className="w-72 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col shadow-sm z-50">
        
        {/* Brand / Logo Header - Full Div Logo */}
        <div className="w-full h-24 border-b border-slate-100 flex items-center justify-center bg-white overflow-hidden p-2">
          {branding?.logoFullUrl ? (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img 
                src={branding.logoFullUrl} 
                alt="Logo Concepto" 
                className="w-full h-full object-contain transform scale-[1.85] transition-transform"
                style={{ objectPosition: '50% 50%' }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black text-slate-900 tracking-tight leading-none uppercase">
                  {branding?.name || 'CONCEPTO'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Sistema Integrado
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Categories with Accordion Subitems */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
          {MENU_GROUPS.map((group) => {
            const isExpanded = expandedCategories[group.category]
            const GroupIcon = group.icon
            const hasActiveChild = group.items.some(i => i.id === tab)

            return (
              <div key={group.category} className="space-y-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(group.category)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10.5px] font-black uppercase tracking-wider transition-all
                    ${hasActiveChild ? 'text-orange-600 bg-orange-50/50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon className="w-3.5 h-3.5 opacity-70" />
                    <span>{group.category}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>

                {/* Category Subitems */}
                {isExpanded && (
                  <div className="pl-2 space-y-0.5 border-l-2 border-slate-100 ml-3.5 my-1">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = tab === item.id

                      return (
                        <button
                          key={item.id}
                          onClick={() => setTab(item.id)}
                          className={`
                            w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left relative group
                            ${isActive
                              ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                              : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'}
                          `}
                        >
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                          
                          <span className="flex-1 truncate text-[11.5px]">{item.label}</span>
                          
                          {item.badge && (
                            <span className={`
                              text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0
                              ${isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}
                            `}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkle className="w-3 h-3 text-orange-400 animate-spin" /> Core IA
              </span>
              <span className="bg-orange-500/20 text-orange-300 text-[9px] px-1.5 py-0.5 rounded font-mono">v2.4</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">Motor Inteligente Activo</p>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Header Breadcrumbs */}
        <header className="h-16 border-b border-slate-200/80 flex items-center justify-between px-8 bg-white z-40 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest">
              {activeGroup?.category || 'Módulo'}
            </span>
            <span className="text-slate-300 text-sm">/</span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
              {activeItem?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistema Online
            </span>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden px-4 py-4 md:px-6 md:py-6 lg:px-8 custom-scrollbar">
          <div className="w-full min-w-0 animate-in fade-in duration-300">
            {tab === 'tariffs' && <TariffSearch />}
            {tab === 'manual-quote' && <ManualQuoteBuilder />}
            {tab === 'group-quotes' && <GroupQuoteManager />}
            {tab === 'sales' && <SalesTracker />}
            {tab === 'treasury' && <TreasuryManager />}
            {tab === 'operators' && <OperatorManager />}
            {tab === 'passengers' && <PassengerManager />}
            {tab === 'web-packages' && <WebPackageManager />}
            {tab === 'flyer-extractor' && <FlyerExtractor />}
            {tab === 'flyer-history' && <FlyerHistory />}
            {tab === 'settings' && <AgencySettings />}
          </div>
        </main>
      </div>

      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: '#0f172a', 
            color: '#fff', 
            fontSize: '13px', 
            borderRadius: '12px',
            border: '1px solid #1e293b' 
          } 
        }} 
      />
    </div>
  )
}

export default App
