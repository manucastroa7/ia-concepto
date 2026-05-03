import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Plane, Hotel, Users, ShieldCheck, Send, Save, History, Search, ChevronDown, CheckCircle2, X, Briefcase, Clock, Calendar, MapPin, DollarSign, Wallet, FileText, XCircle, ArrowRight } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// --- COMPONENTES AUXILIARES ---

function NumericInput({ value, onChange, className, placeholder }: { value: number, onChange: (val: number) => void, className?: string, placeholder?: string }) {
  return (
    <input 
      type="text"
      value={value === 0 ? '' : value.toString()}
      onChange={e => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        onChange(val === '' ? 0 : parseInt(val));
      }}
      className={className}
      placeholder={placeholder || "0"}
    />
  )
}

function SearchableOperatorSelect({ value, onChange, operators }: { value?: string, onChange: (id: string) => void, operators: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  
  const selectedOp = operators.find(o => o.id === value)
  const filtered = operators.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 text-xs text-left flex justify-between items-center hover:border-orange-500/30 hover:bg-white transition-all outline-none focus:border-orange-500/50"
      >
        <div className="flex flex-col">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operador</span>
           <span className={selectedOp ? 'text-slate-800 font-black' : 'text-slate-400'}>
             {selectedOp ? selectedOp.name : 'Seleccionar...'}
           </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Search className="w-4 h-4 text-orange-500" />
              <input 
                autoFocus
                placeholder="Buscar operador por nombre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-slate-800 w-full font-bold placeholder:text-slate-400"
              />
              {search && <X className="w-4 h-4 text-slate-500 hover:text-slate-800 cursor-pointer" onClick={() => setSearch('')} />}
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filtered.length > 0 ? filtered.map(op => (
                <button
                  key={op.id}
                  onClick={() => {
                    onChange(op.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-4 rounded-xl text-xs transition-all flex items-center justify-between group mb-1 last:mb-0 ${value === op.id ? 'bg-orange-500 text-white font-black' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <span className="flex items-center gap-3">
                     <span className={`w-2 h-2 rounded-full ${value === op.id ? 'bg-white' : 'bg-slate-200 group-hover:bg-orange-500'}`} />
                     {op.name}
                  </span>
                  {value === op.id && <CheckCircle2 className="w-4 h-4" />}
                </button>
              )) : (
                <div className="p-8 text-center">
                   <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">No hay coincidencias</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// --- COMPONENTE PRINCIPAL ---

export default function ManualQuoteBuilder() {
  const [quote, setQuote] = useState({
    id: null as string | null,
    title: '',
    destination: '',
    status: 'draft' as 'draft' | 'sent' | 'follow_up' | 'reserved' | 'sold' | 'lost',
    currency: 'USD' as 'USD' | 'ARS' | 'EUR',
    items: [] as any[],
    notes: '',
    passengerId: null as string | null,
    soldPriceCollected: 0,
    totalNetCostSnapshot: 0,
    globalAdjustment: 0,
    soldAt: null as string | null
  })

  const [operators, setOperators] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [historyQuotes, setHistoryQuotes] = useState<any[]>([])
  const [whatsappText, setWhatsappText] = useState('')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Passenger search state
  const [passengerSearch, setPassengerSearch] = useState('')
  const [passengerResults, setPassengerResults] = useState<any[]>([])
  const [loadingPassengers, setLoadingPassengers] = useState(false)
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false)

  useEffect(() => {
    fetchOperators()
    fetchHistory()
  }, [])

  const fetchOperators = async () => {
    try {
      const res = await axios.get('/api/operators')
      setOperators(res.data)
    } catch (e) { toast.error('Error al cargar operadores') }
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/manual-quotes')
      setHistoryQuotes(res.data)
    } catch (e) { console.error('Error loading history') }
  }

  const handleAddItem = (type: 'flight' | 'hotel' | 'transfer' | 'service' | 'assistance') => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      providerId: '',
      details: type === 'flight' ? {
        airline: '',
        bookingCode: '',
        type: 'ROUND_TRIP',
        segments: [{ id: '1', from: '', to: '', departureDate: '', departureTime: '', arrivalDate: '', arrivalTime: '' }],
        baggage: { hasHand: true, handDesc: 'Mochila', hasCarryOn: false, carryOnDesc: '10kg', hasChecked: false, checkedDesc: '23kg' }
      } : type === 'hotel' ? {
        hotelName: '',
        confirmationNumber: '',
        checkIn: '',
        checkOut: '',
        rooms: [{ id: '1', type: 'Doble Standard', board: 'Desayuno', paxCount: 2 }],
        cancellationDate: ''
      } : type === 'transfer' ? {
        origin: '',
        destination: '',
        isRoundTrip: false,
        date: '',
        time: '',
        confirmationNumber: ''
      } : {
        description: '',
        confirmationNumber: ''
      },
      economics: {
        baseNetCost: 0,
        adjustments: [
          { id: Math.random().toString(36).substr(2, 5), label: 'Gastos Adm.', type: 'fixed', impact: 'cost', value: 0 },
          { id: Math.random().toString(36).substr(2, 5), label: 'Fee Servicio', type: 'fixed', impact: 'profit', value: 0 }
        ],
        pricingModel: 'total' as 'total' | 'per_passenger',
        passengerCount: 1,
        commissionType: 'percentage' as 'percentage' | 'fixed',
        commissionValue: 10
      }
    }
    setQuote(prev => ({ ...prev, items: [...prev.items, newItem] }))
    setExpandedItem(newItem.id)
    toast.success('Servicio agregado')
  }

  const updateItemDetails = (itemId: string, field: string, value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, details: { ...item.details, [field]: value } } : item
      )
    }))
  }

  const updateItemEconomics = (itemId: string, field: string, value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, economics: { ...item.economics, [field]: value } } : item
      )
    }))
  }

  const handleOperatorChange = (itemId: string, opId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, providerId: opId } : item
      )
    }))
  }

  const addFlightSegment = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { 
          ...item, 
          details: { 
            ...item.details, 
            segments: [...item.details.segments, { id: Math.random().toString(36).substr(2, 5), from: '', to: '', departureDate: '', departureTime: '', arrivalDate: '', arrivalTime: '' }] 
          } 
        } : item
      )
    }))
  }

  const updateFlightSegment = (itemId: string, segId: string, field: string, value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          details: {
            ...item.details,
            segments: item.details.segments.map((s: any) => s.id === segId ? { ...s, [field]: value } : s)
          }
        } : item
      )
    }))
  }

  const removeFlightSegment = (itemId: string, segId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          details: {
            ...item.details,
            segments: item.details.segments.filter((s: any) => s.id !== segId)
          }
        } : item
      )
    }))
  }

  const addHotelRoom = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          details: {
            ...item.details,
            rooms: [...item.details.rooms, { id: Math.random().toString(36).substr(2, 5), type: '', board: '', paxCount: 1 }]
          }
        } : item
      )
    }))
  }

  const updateHotelRoom = (itemId: string, roomId: string, field: string, value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          details: {
            ...item.details,
            rooms: item.details.rooms.map((r: any) => r.id === roomId ? { ...r, [field]: value } : r)
          }
        } : item
      )
    }))
  }

  const removeHotelRoom = (itemId: string, roomId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          details: {
            ...item.details,
            rooms: item.details.rooms.filter((r: any) => r.id !== roomId)
          }
        } : item
      )
    }))
  }

  const updateBaggage = (itemId: string, field: string, value: boolean | string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          details: {
            ...item.details,
            baggage: { ...item.details.baggage, [field]: value }
          }
        } : item
      )
    }))
  }

  const handleAddAdjustment = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          economics: {
            ...item.economics,
            adjustments: [
              ...item.economics.adjustments, 
              { id: Math.random().toString(36).substr(2, 5), label: 'Nuevo Ajuste', type: 'fixed', impact: 'cost', value: 0 }
            ]
          }
        } : item
      )
    }))
  }

  const handleUpdateAdjustment = (itemId: string, adjId: string, updates: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          economics: {
            ...item.economics,
            adjustments: item.economics.adjustments.map((a: any) => a.id === adjId ? { ...a, ...updates } : a)
          }
        } : item
      )
    }))
  }

  const handleRemoveAdjustment = (itemId: string, adjId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? {
          ...item,
          economics: {
            ...item.economics,
            adjustments: item.economics.adjustments.filter((a: any) => a.id !== adjId)
          }
        } : item
      )
    }))
  }

  const removeItem = (id: string) => {
    setItemToDelete(id);
  }

  const confirmRemoveItem = () => {
    if (itemToDelete) {
        setQuote(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemToDelete) }));
        setItemToDelete(null);
        toast.success('Servicio eliminado');
    }
  }

  const calculateItemEconomics = (item: any) => {
    const { baseNetCost, adjustments, pricingModel, passengerCount, commissionType, commissionValue } = item.economics
    let unitCost = Number(baseNetCost)
    let unitProfit = 0
    
    adjustments.forEach((adj: any) => {
      const val = Number(adj.value || 0)
      const amount = adj.type === 'fixed' ? val : (Number(baseNetCost) * val) / 100
      
      if (adj.impact === 'profit') {
        unitProfit += amount
      } else {
        unitCost += amount
      }
    })

    if (commissionType === 'fixed') unitProfit += Number(commissionValue)
    else unitProfit += (Number(baseNetCost) * Number(commissionValue)) / 100

    const multi = pricingModel === 'per_passenger' ? Number(passengerCount) || 1 : 1
    
    return {
      unitCost,
      unitProfit,
      totalCost: unitCost * multi,
      totalProfit: unitProfit * multi,
      totalSale: Math.ceil((unitCost + unitProfit) * multi)
    }
  }

  const calculateItemSale = (item: any) => {
    return calculateItemEconomics(item).totalSale
  }

  const totals = useMemo(() => {
    const base = quote.items.reduce((acc, item) => {
      const econ = calculateItemEconomics(item)
      return {
        sale: acc.sale + econ.totalSale,
        net: acc.net + econ.totalCost,
        profit: acc.profit + econ.totalProfit
      }
    }, { sale: 0, net: 0, profit: 0 })
    
    return {
        ...base,
        sale: base.sale + Number(quote.globalAdjustment || 0),
        profit: base.profit + Number(quote.globalAdjustment || 0)
    }
  }, [quote.items, quote.globalAdjustment])

  const handleSaveCRM = async () => {
    try {
      const payload: any = { ...quote };
      if (!payload.id) delete payload.id;
      let res: any;
      if (quote.id) {
        res = await axios.patch(`/api/manual-quotes/${quote.id}`, payload);
        toast.success('Cambios guardados');
      } else {
        res = await axios.post('/api/manual-quotes', payload);
        setQuote(prev => ({ ...prev, id: res.data.id }));
        toast.success('Cotización maestra guardada');
      }
      fetchHistory();
    } catch (e) { toast.error('Error al guardar') }
  }

  const handleLoadQuote = async (id: string) => {
    try {
      const res = await axios.get(`/api/manual-quotes/${id}`);
      const data = res.data;
      setQuote({
          ...data,
          status: data.status || 'draft',
          passengerId: data.passengerId || null,
          soldPriceCollected: data.soldPriceCollected || 0
      });
      if (data.passenger) {
          setPassengerSearch(`${data.passenger.surname}, ${data.passenger.name}`);
      } else {
          setPassengerSearch(data.title || '');
      }
      setShowHistory(false);
      toast.success('Cargada: ' + data.title);
    } catch (e) { toast.error('Error al cargar') }
  }

  const searchPassengers = async (q: string) => {
    if (!q) {
      setPassengerResults([]);
      setShowPassengerDropdown(false);
      return;
    }
    setLoadingPassengers(true);
    try {
      const res = await axios.get(`/api/passengers/search?q=${q}`);
      setPassengerResults(res.data);
      setShowPassengerDropdown(true);
    } catch (e) {}
    setLoadingPassengers(false);
  }

  const getCurrencySymbol = (curr: string) => {
    if (curr === 'EUR') return '€';
    return '$';
  }

  const selectPassenger = (p: any) => {
    setQuote(prev => ({ 
      ...prev, 
      passengerId: p.id,
      title: `${p.surname}, ${p.name}`
    }));
    setPassengerSearch(`${p.surname}, ${p.name}`);
    setShowPassengerDropdown(false);
    toast.success(`Pasajero seleccionado: ${p.name}`);
  }

  const handleStatusChange = (newStatus: typeof quote.status) => {
    setQuote(prev => {
        const updates: any = { status: newStatus };
        if (newStatus === 'sold' && prev.status !== 'sold') {
            updates.soldAt = new Date().toISOString();
            updates.totalNetCostSnapshot = totals.net;
            if (!prev.soldPriceCollected) {
                updates.soldPriceCollected = totals.sale;
            }
        }
        return { ...prev, ...updates };
    });
    toast.success('Estado actualizado: ' + newStatus);
  }

  const generateWhatsApp = async () => {
    try {
      const res = await axios.post('/api/manual-quotes/generate-whatsapp', { quoteData: quote });
      setWhatsappText(res.data.text);
      toast.success('Texto de WhatsApp generado');
    } catch (e) { toast.error('Error al generar WhatsApp') }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-[1.4rem] shadow-xl border border-slate-100 flex items-center justify-center rotate-6">
            <Plane className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="page-title">Cotizador Maestro</h1>
            <p className="page-subtitle">Gestión Experta de Viajes</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
             <button onClick={() => setQuote({...quote, currency: 'USD'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quote.currency === 'USD' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>USD</button>
             <button onClick={() => setQuote({...quote, currency: 'ARS'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quote.currency === 'ARS' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>ARS</button>
             <button onClick={() => setQuote({...quote, currency: 'EUR'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${quote.currency === 'EUR' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>EUR</button>
          </div>

          <div className="flex gap-3">
             <button onClick={() => setShowHistory(true)} className="btn-secondary !w-12 !h-12 !p-0"><History className="w-5 h-5" /></button>
             <button onClick={handleSaveCRM} className="btn-primary !px-6 !py-4 shadow-none">
               <Save className="w-4 h-4" />
               GUARDAR CRM
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
          <div className="flex-1 max-w-2xl px-4 overflow-hidden">
              <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0" />
                  
                  {[
                      { id: 'draft', label: 'Borrador', icon: FileText },
                      { id: 'sent', label: 'Enviada', icon: Send },
                      { id: 'follow_up', label: 'Seguimiento', icon: Clock },
                      { id: 'reserved', label: 'Reserva', icon: ShieldCheck },
                      { id: 'sold', label: 'Vendido', icon: CheckCircle2 },
                      { id: 'lost', label: 'Perdido', icon: XCircle },
                  ].map((s, idx, arr) => {
                      const isActive = quote.status === s.id;
                      const allStatuses = arr.map(x => x.id);
                      const currentIdx = allStatuses.indexOf(quote.status);
                      const isPast = currentIdx > idx;
                      const isLost = s.id === 'lost' && quote.status === 'lost';
                      const isLast = idx === arr.length - 1;

                      return (
                          <div key={s.id} className="relative z-10 flex flex-col items-center group">
                              {!isLast && (
                                  <div className={`absolute left-1/2 w-full top-1/2 -translate-y-1/2 h-0.5 transition-all duration-500 z-[-1] ${
                                      currentIdx > idx ? 'bg-orange-500' : 'bg-transparent'
                                  }`} />
                              )}
                              
                              <button
                                  onClick={() => handleStatusChange(s.id as any)}
                                  className={`
                                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                                      ${isActive ? 'bg-orange-500 border-orange-400 text-slate-900 shadow-lg shadow-orange-500/40 scale-110' : 
                                        isPast ? 'bg-white border-orange-500 text-orange-500' : 
                                        isLost ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40' :
                                        'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'}
                                  `}
                                  title={s.label}
                              >
                                  <s.icon className="w-4 h-4" />
                              </button>
                              
                              <span className={`
                                  absolute top-full mt-2 text-[9px] font-black uppercase tracking-tight transition-all duration-300 whitespace-nowrap
                                  ${isActive ? 'text-orange-500 opacity-100 translate-y-0' : 'text-slate-400 opacity-40 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'}
                              `}>
                                  {s.label}
                              </span>
                          </div>
                      )
                  })}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* COLUMNA PRINCIPAL */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* PASAJERO SELECT */}
          <div className="premium-card relative z-30 overflow-visible">
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">Información del Cliente</h3>
                </div>
                {quote.passengerId && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            </div>

            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Search className="w-5 h-5 text-slate-500" />
                </div>
                <input 
                  value={passengerSearch}
                  onChange={e => {
                      setPassengerSearch(e.target.value);
                      searchPassengers(e.target.value);
                  }}
                  onFocus={() => passengerResults.length > 0 && setShowPassengerDropdown(true)}
                  placeholder="Buscar por DNI o Apellido..."
                  className="standard-input pl-12 py-3.5 text-sm"
                />
                
                {showPassengerDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-200 rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="max-h-80 overflow-y-auto p-3 custom-scrollbar">
                            {passengerResults.map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => selectPassenger(p)}
                                  className="w-full text-left p-5 rounded-2xl hover:bg-slate-100 transition-all group flex items-center justify-between mb-1 last:mb-0"
                                >
                                    <div>
                                        <p className="text-slate-800 font-black text-sm uppercase tracking-tight">{p.surname}, {p.name}</p>
                                        <p className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-widest opacity-70">DNI: {p.document} • {p.email || 'Sin registro de email'}</p>
                                    </div>
                                    <Plus className="w-5 h-5 text-slate-600 group-hover:text-orange-500 group-hover:scale-110 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                    <label className="section-label">Título del Proyecto</label>
                    <input value={quote.title} onChange={e => setQuote({...quote, title: e.target.value})} className="standard-input" placeholder="Ej: Viaje a Europa" />
                </div>
                <div className="space-y-2">
                    <label className="section-label">Destinos</label>
                    <input value={quote.destination} onChange={e => setQuote({...quote, destination: e.target.value})} className="standard-input" placeholder="Ej: Madrid, París" />
                </div>
            </div>
          </div>

          {/* AGREGAR ITEMS BAR */}
          <div className="flex flex-wrap gap-5">
              {[
                  { type: 'flight' as const, label: 'VUELOS', icon: Plane, color: 'sky' },
                  { type: 'hotel' as const, label: 'HOTELES', icon: Hotel, color: 'emerald' },
                  { type: 'transfer' as const, label: 'TRASLADOS', icon: Users, color: 'orange' },
                  { type: 'assistance' as const, label: 'ASISTENCIAS', icon: ShieldCheck, color: 'indigo' },
                  { type: 'service' as const, label: 'FLYERS/OTROS', icon: Plus, color: 'slate' }
              ].map(btn => (
                  <button 
                    key={btn.type}
                    onClick={() => handleAddItem(btn.type)} 
                    className={`flex-1 min-w-[120px] bg-white hover:bg-${btn.color}-500/10 border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-3 transition-all group scale-100 hover:scale-[1.02] shadow-lg`}
                  >
                      <div className={`w-10 h-10 rounded-xl bg-${btn.color}-500/10 flex items-center justify-center group-hover:bg-${btn.color}-500 group-hover:text-slate-800 transition-all shadow-inner`}>
                          <btn.icon className={`w-5 h-5 text-${btn.color}-400 group-hover:text-slate-800 group-hover:scale-110 transition-all`} />
                      </div>
                      <span className="text-[9px] font-black text-slate-800 tracking-[0.25em]">{btn.label}</span>
                  </button>
              ))}
          </div>

          {/* LISTADO DE ITEMS */}
          <div className="space-y-6">
            {quote.items.map((item) => (
              <div key={item.id} className="premium-card !p-0 overflow-hidden border-slate-100 bg-white backdrop-blur-sm group/card hover:border-orange-500/20">
                <div 
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-all" 
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl ${
                      item.type === 'flight' ? 'bg-sky-500/10 text-sky-400 shadow-sky-500/10' :
                      item.type === 'hotel' ? 'bg-emerald-500/10 text-emerald-400 shadow-emerald-500/10' :
                      item.type === 'transfer' ? 'bg-orange-500/10 text-orange-400 shadow-orange-500/10' : 
                      item.type === 'assistance' ? 'bg-indigo-500/10 text-indigo-400 shadow-indigo-500/10' : 'bg-slate-500/10 text-slate-500 shadow-slate-500/10'
                  }`}>
                      {item.type === 'flight' ? <Plane className="w-5 h-5" /> : 
                       item.type === 'hotel' ? <Hotel className="w-5 h-5" /> : 
                       item.type === 'transfer' ? <Users className="w-5 h-5" /> : 
                       item.type === 'assistance' ? <ShieldCheck className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                          {item.type === 'flight' ? 'Itinerario Aéreo' : 
                           item.type === 'hotel' ? (item.details.hotelName || 'Alojamiento') : 
                           item.type === 'transfer' ? 'Traslado / Conexión' : 
                           item.type === 'assistance' ? 'Asistencia al Viajero' : (item.details.description || 'Servicio Especial')}
                          {item.providerId && <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316] animate-pulse" />}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-1">
                          {item.type === 'flight' ? (item.details.airline || 'Definir Aerolínea') : 
                           item.type === 'hotel' ? (item.details.rooms?.[0]?.type || 'Tipo de Habitación') : 
                           item.type === 'transfer' ? `${item.details.origin || '?' } ➔ ${item.details.destination || '?'}` : 'Detalles del servicio'}
                      </p>
                  </div>
                  <div className="flex items-center gap-8">
                      <div className="text-right">
                          <p className="section-label !mb-0 text-right">Total</p>
                          <p className="text-base font-black text-slate-800 tracking-tight">{quote.currency} {calculateItemSale(item).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className={`p-1.5 rounded-full transition-all duration-500 ${expandedItem === item.id ? 'bg-orange-500/10 text-orange-500' : 'text-slate-700'}`}>
                        <ChevronDown className={`w-5 h-5 transform transition-transform duration-500 ${expandedItem === item.id ? 'rotate-180' : ''}`} />
                      </div>
                  </div>
                </div>

                {expandedItem === item.id && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50 animate-in slide-in-from-top-4 duration-500 overflow-visible">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* COLUMNA DETALLES ESPECÍFICOS */}
                      <div className="space-y-6">
                         <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="section-label mb-0">Estructura del Operador</h4>
                                <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">Ref: {item.id}</div>
                            </div>

                            <SearchableOperatorSelect 
                                value={item.providerId} 
                                operators={operators}
                                onChange={(opId) => handleOperatorChange(item.id, opId)}
                            />

                            {item.type === 'flight' ? (
                                <div className="space-y-8 pt-4">
                                   <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-inner mb-8">
                                      {['ONE_WAY', 'ROUND_TRIP', 'MULTI'].map(t => (
                                          <button 
                                              key={t}
                                              onClick={() => updateItemDetails(item.id, 'type', t)}
                                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${item.details.type === t ? 'bg-orange-500 text-slate-800 shadow-lg' : 'text-slate-500 hover:text-slate-600'}`}
                                          >
                                              {t === 'ONE_WAY' ? 'Ida' : t === 'ROUND_TRIP' ? 'Ida y Vta' : 'Multi'}
                                          </button>
                                      ))}
                                   </div>

                                   <div className="grid grid-cols-2 gap-6">
                                       <div className="space-y-2">
                                           <label className="section-label">Aerolínea Principal</label>
                                           <input placeholder="Ej: Iberia" value={item.details.airline} onChange={e => updateItemDetails(item.id, 'airline', e.target.value)} className="standard-input !py-3" />
                                       </div>
                                       <div className="space-y-2">
                                           <label className="section-label !text-sky-500">PNR / Localizador</label>
                                           <input placeholder="Ej: ABC123" value={item.details.bookingCode || ''} onChange={e => updateItemDetails(item.id, 'bookingCode', e.target.value)} className="standard-input !py-3 !bg-sky-500/5 !border-sky-500/20 text-sky-200" />
                                       </div>
                                   </div>

                                   <div className="space-y-6 pt-4">
                                       <div className="flex justify-between items-center">
                                           <span className="section-label !mb-0">ITINERARIO DE VUELO</span>
                                           <button onClick={() => addFlightSegment(item.id)} className="text-[10px] font-black text-orange-500 hover:text-orange-400 transition-all uppercase tracking-widest">+ Agregar Tramo</button>
                                       </div>
                                       <div className="space-y-3">
                                           {item.details.segments.map((seg: any, sidx: number) => (
                                               <div key={seg.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3 relative group/seg">
                                                   <div className="grid grid-cols-2 gap-4">
                                                       <input placeholder="Origen (EZE)" value={seg.from} onChange={e => updateFlightSegment(item.id, seg.id, 'from', e.target.value.toUpperCase())} className="bg-transparent border-b border-slate-100 p-2 text-xs text-slate-800 font-black" />
                                                       <input placeholder="Destino (MAD)" value={seg.to} onChange={e => updateFlightSegment(item.id, seg.id, 'to', e.target.value.toUpperCase())} className="bg-transparent border-b border-slate-100 p-2 text-xs text-slate-800 font-black" />
                                                   </div>
                                                   <div className="grid grid-cols-2 gap-4">
                                                       <div className="flex gap-2">
                                                           <input placeholder="Fecha" value={seg.departureDate} onChange={e => updateFlightSegment(item.id, seg.id, 'departureDate', e.target.value)} className="w-16 bg-transparent border-b border-slate-100 p-2 text-[10px] text-slate-800" />
                                                           <input placeholder="Hora" value={seg.departureTime} onChange={e => updateFlightSegment(item.id, seg.id, 'departureTime', e.target.value)} className="flex-1 bg-transparent border-b border-slate-100 p-2 text-[10px] text-slate-800" />
                                                       </div>
                                                       <div className="flex gap-2">
                                                           <input placeholder="Llegada" value={seg.arrivalDate} onChange={e => updateFlightSegment(item.id, seg.id, 'arrivalDate', e.target.value)} className="w-16 bg-transparent border-b border-slate-100 p-2 text-[10px] text-slate-800" />
                                                           <input placeholder="Hora" value={seg.arrivalTime} onChange={e => updateFlightSegment(item.id, seg.id, 'arrivalTime', e.target.value)} className="flex-1 bg-transparent border-b border-slate-100 p-2 text-[10px] text-slate-800" />
                                                       </div>
                                                   </div>
                                                   {sidx > 0 && <button onClick={() => removeFlightSegment(item.id, seg.id)} className="absolute -top-2 -right-2 bg-red-500 text-slate-800 p-1 rounded-full opacity-0 group-hover/seg:opacity-100 transition-all"><X className="w-3 h-3" /></button>}
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                                </div>
                            ) : item.type === 'hotel' ? (
                                <div className="space-y-8 pt-4">
                                   <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1">
                                           <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Hotel</label>
                                           <input placeholder="Ej: Marriott Paris" value={item.details.hotelName} onChange={e => updateItemDetails(item.id, 'hotelName', e.target.value)} className="w-full bg-slate-100 border border-slate-200 p-3 rounded-lg text-slate-800 text-[11px] font-black" />
                                       </div>
                                       <div className="space-y-1">
                                           <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Nº Confirmación</label>
                                           <input placeholder="Localizador" value={item.details.confirmationNumber || ''} onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)} className="w-full bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg text-emerald-200 text-[11px] font-black outline-none focus:border-emerald-500" />
                                       </div>
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1">
                                           <span className="text-[9px] font-bold text-slate-600 uppercase">Check-in</span>
                                           <input placeholder="DD/MM" value={item.details.checkIn} onChange={e => updateItemDetails(item.id, 'checkIn', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 text-xs" />
                                       </div>
                                       <div className="space-y-1">
                                           <span className="text-[9px] font-bold text-slate-600 uppercase">Check-out</span>
                                           <input placeholder="DD/MM" value={item.details.checkOut} onChange={e => updateItemDetails(item.id, 'checkOut', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 text-xs" />
                                       </div>
                                   </div>

                                   <div className="space-y-4">
                                       <div className="flex justify-between items-center">
                                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Habitaciones</span>
                                           <button onClick={() => addHotelRoom(item.id)} className="text-[9px] font-black text-orange-500 hover:text-orange-400 transition-all">+ AGREGAR HAB</button>
                                       </div>
                                       <div className="space-y-3">
                                           {item.details.rooms.map((room: any, ridx: number) => (
                                               <div key={room.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 relative group/room">
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      <input placeholder="Tipo (Doble, Single...)" value={room.type} onChange={e => updateHotelRoom(item.id, room.id, 'type', e.target.value)} className="bg-transparent border-b border-slate-100 p-2 text-xs text-slate-800 font-bold" />
                                                      <input placeholder="Regimen (BB, MAP...)" value={room.board} onChange={e => updateHotelRoom(item.id, room.id, 'board', e.target.value)} className="bg-transparent border-b border-slate-100 p-2 text-xs text-slate-800 font-bold" />
                                                  </div>
                                                  {ridx > 0 && <button onClick={() => removeHotelRoom(item.id, room.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/room:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button>}
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                                </div>
                            ) : item.type === 'transfer' ? (
                                <div className="space-y-8 pt-4">
                                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                        <button onClick={() => updateItemDetails(item.id, 'isRoundTrip', false)} className={`flex-1 py-3 rounded-xl text-[9px] font-black transition-all ${!item.details.isRoundTrip ? 'bg-orange-500 text-slate-800 shadow-lg' : 'text-slate-600 hover:text-slate-600'}`}>SÓLO IDA</button>
                                        <button onClick={() => updateItemDetails(item.id, 'isRoundTrip', true)} className={`flex-1 py-3 rounded-xl text-[9px] font-black transition-all ${item.details.isRoundTrip ? 'bg-orange-500 text-slate-800 shadow-lg' : 'text-slate-600 hover:text-slate-600'}`}>IDA Y VUELTA</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Desde</label>
                                            <input placeholder="Origen" value={item.details.origin} onChange={e => updateItemDetails(item.id, 'origin', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 text-xs font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hasta</label>
                                            <input placeholder="Destino" value={item.details.destination} onChange={e => updateItemDetails(item.id, 'destination', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 text-xs font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Nº Confirmación</label>
                                            <input placeholder="Voucher / Ticket" value={item.details.confirmationNumber || ''} onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)} className="w-full bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-emerald-200 text-xs font-black outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fecha / Hora</label>
                                            <div className="flex gap-2">
                                                <input placeholder="DD/MM" value={item.details.date} onChange={e => updateItemDetails(item.id, 'date', e.target.value)} className="w-20 bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 text-xs" />
                                                <input placeholder="HH:MM" value={item.details.time} onChange={e => updateItemDetails(item.id, 'time', e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Descripción General</label>
                                        <textarea value={item.details.description} onChange={e => updateItemDetails(item.id, 'description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-800 text-xs min-h-[100px]" placeholder="Detallar servicios o aclaraciones especialies..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Localizador o Confirmación</label>
                                        <input value={item.details.confirmationNumber || ''} onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)} className="w-full bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-emerald-200 text-xs font-black outline-none" placeholder="PNR / GDS Code / Voucher" />
                                    </div>
                                </div>
                            )}
                         </div>
                      </div>

                      {/* COLUMNA ECONOMÍA */}
                      <div className="space-y-4">
                         <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-5">
                             <div className="flex items-center justify-between">
                                 <h4 className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Rentabilidad</h4>
                                 <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                                     <button onClick={() => updateItemEconomics(item.id, 'pricingModel', 'total')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black transition-all ${item.economics.pricingModel === 'total' ? 'bg-orange-500 text-slate-800' : 'text-slate-600'}`}>TOTAL</button>
                                     <button onClick={() => updateItemEconomics(item.id, 'pricingModel', 'per_passenger')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black transition-all ${item.economics.pricingModel === 'per_passenger' ? 'bg-orange-500 text-slate-800' : 'text-slate-600'}`}>PAX</button>
                                 </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Costo Neto</label>
                                      <div className="relative">
                                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[10px]">{getCurrencySymbol(quote.currency)}</div>
                                          <NumericInput value={item.economics.baseNetCost} onChange={val => updateItemEconomics(item.id, 'baseNetCost', val)} className="w-full bg-slate-50 border border-slate-200 py-2 pl-7 rounded-lg text-slate-800 font-black text-base outline-none focus:border-orange-500/50" />
                                      </div>
                                  </div>
                                  <div className={`space-y-1.5 transition-opacity ${item.economics.pricingModel === 'total' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Pasajeros</label>
                                      <NumericInput value={item.economics.passengerCount} onChange={val => updateItemEconomics(item.id, 'passengerCount', val)} className="w-full bg-slate-50 border border-slate-200 py-2 rounded-lg text-slate-800 font-black text-base text-center outline-none focus:border-orange-500/50" />
                                  </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                  <div className="flex justify-between items-center">
                                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ajustes Manuales</label>
                                      <button onClick={() => handleAddAdjustment(item.id)} className="text-[8px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest">+ Agregar</button>
                                  </div>
                                  <div className="space-y-2">
                                      {item.economics.adjustments.map((adj: any) => (
                                          <div key={adj.id} className="flex gap-1.5 items-center animate-in fade-in duration-300">
                                              <input 
                                                placeholder="Concepto" 
                                                value={adj.label} 
                                                onChange={e => handleUpdateAdjustment(item.id, adj.id, { label: e.target.value })}
                                                className="flex-1 bg-slate-50 border border-slate-100 py-1.5 px-2 rounded text-[10px] text-slate-800 outline-none focus:border-white/20"
                                              />
                                              <div className="flex bg-slate-50 p-0.5 rounded border border-slate-100 shrink-0">
                                                  <button onClick={() => handleUpdateAdjustment(item.id, adj.id, { impact: 'cost' })} className={`p-1 rounded text-[7px] transition-all ${adj.impact !== 'profit' ? 'bg-slate-800 text-slate-800' : 'text-slate-700'}`} title="Impacta en Costo"><Briefcase className="w-2.5 h-2.5" /></button>
                                                  <button onClick={() => handleUpdateAdjustment(item.id, adj.id, { impact: 'profit' })} className={`p-1 rounded text-[7px] transition-all ${adj.impact === 'profit' ? 'bg-emerald-500 text-slate-800' : 'text-slate-700'}`} title="Impacta en Utilidad/Fee"><DollarSign className="w-2.5 h-2.5" /></button>
                                              </div>
                                              <div className="flex bg-slate-50 p-0.5 rounded border border-slate-100 shrink-0">
                                                  <button onClick={() => handleUpdateAdjustment(item.id, adj.id, { type: 'percentage' })} className={`px-1.5 py-0.5 rounded text-[7px] font-black transition-all ${adj.type === 'percentage' ? 'bg-orange-500 text-slate-800' : 'text-slate-600'}`}>%</button>
                                                  <button onClick={() => handleUpdateAdjustment(item.id, adj.id, { type: 'fixed' })} className={`px-1.5 py-0.5 rounded text-[7px] font-black transition-all ${adj.type === 'fixed' ? 'bg-orange-500 text-slate-800' : 'text-slate-600'}`}>{getCurrencySymbol(quote.currency)}</button>
                                              </div>
                                              <div className="relative w-20 shrink-0">
                                                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-[9px]">{adj.type === 'fixed' ? getCurrencySymbol(quote.currency) : '%'}</div>
                                                  <NumericInput 
                                                    value={adj.value} 
                                                    onChange={val => handleUpdateAdjustment(item.id, adj.id, { value: val })}
                                                    className="w-full bg-slate-50 border border-slate-100 py-1.5 pl-5 rounded text-[10px] text-slate-800 font-black outline-none focus:border-white/20 text-right pr-2"
                                                  />
                                              </div>
                                              <button onClick={() => handleRemoveAdjustment(item.id, adj.id)} className="text-slate-700 hover:text-red-500 transition-colors shrink-0"><Trash2 className="w-3 h-3" /></button>
                                          </div>
                                      ))}
                                  </div>
                              </div>

                             <div className="space-y-3">
                                 <div className="flex justify-between items-center">
                                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Comisión</label>
                                     <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                                         <button onClick={() => updateItemEconomics(item.id, 'commissionType', 'percentage')} className={`px-2 py-1 rounded-md text-[8px] font-black transition-all ${item.economics.commissionType === 'percentage' ? 'bg-slate-800 text-orange-500' : 'text-slate-600'}`}>%</button>
                                         <button onClick={() => updateItemEconomics(item.id, 'commissionType', 'fixed')} className={`px-2 py-1 rounded-md text-[8px] font-black transition-all ${item.economics.commissionType === 'fixed' ? 'bg-slate-800 text-orange-500' : 'text-slate-600'}`}>{getCurrencySymbol(quote.currency)}</button>
                                     </div>
                                 </div>
                                 <div className="relative">
                                     <NumericInput value={item.economics.commissionValue} onChange={val => updateItemEconomics(item.id, 'commissionValue', val)} className="w-full bg-slate-50 border border-slate-200 py-2.5 rounded-lg text-slate-800 font-black text-lg text-center outline-none focus:border-orange-500/50" />
                                     <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-700 text-sm">{item.economics.commissionType === 'percentage' ? '%' : getCurrencySymbol(quote.currency)}</div>
                                 </div>
                             </div>

                             <div className="space-y-2 pt-4 border-t border-slate-100">
                                 <div className="flex items-center justify-between text-slate-500">
                                     <span className="text-[8px] font-black uppercase tracking-widest">Costo Total</span>
                                     <span className="text-[11px] font-bold">{quote.currency} {calculateItemEconomics(item).totalCost.toLocaleString()}</span>
                                 </div>
                                 <div className="flex items-center justify-between text-emerald-500">
                                     <span className="text-[8px] font-black uppercase tracking-widest">Utilidad</span>
                                     <span className="text-[11px] font-black">{quote.currency} {calculateItemEconomics(item).totalProfit.toLocaleString()}</span>
                                 </div>
                                 <div className="flex items-center justify-between p-3.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                     <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em]">Precio Venta</span>
                                     <span className="text-xl font-black text-slate-800">{quote.currency} {calculateItemSale(item).toLocaleString()}</span>
                                 </div>
                             </div>

                             <button onClick={() => removeItem(item.id)} className="w-full py-2.5 text-[8px] font-black text-red-500/40 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all uppercase tracking-widest border border-dashed border-red-500/10 hover:border-red-500/30">Eliminar Servicio de la Cotización</button>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {quote.items.length === 0 && (
              <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-white/[0.01]">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Tu cotización está vacía</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Agregá vuelos, hoteles o traslados para comenzar</p>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR TOTALES */}
        <div className="xl:col-span-4 space-y-8">
          <div className="sticky top-6 space-y-6">
            <div className="premium-card p-6 bg-white border-slate-200 shadow-xl">
                <h3 className="section-label mb-6">Consolidado Final</h3>
                
                <div className="space-y-5">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Inversión Neta</p>
                            <p className="text-xl font-black text-slate-400">{quote.currency} {totals.net.toLocaleString()}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Gcia. Bruta</p>
                            <p className="text-xl font-black text-emerald-600">+{quote.currency} {totals.profit.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="p-5 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/20 transform hover:scale-[1.02] transition-all">
                        <p className="text-[8px] font-black text-white/80 uppercase tracking-[0.3em] mb-1">Total a Percibir</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{quote.currency} {totals.sale.toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">Cerrado</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ajuste Global</label>
                            <span className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">(Afecta total final)</span>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">{getCurrencySymbol(quote.currency)}</div>
                            <NumericInput 
                                value={quote.globalAdjustment} 
                                onChange={val => setQuote({ ...quote, globalAdjustment: val })}
                                className="w-full bg-slate-50 border border-slate-100 p-3 pl-8 rounded-xl text-slate-800 font-black text-lg outline-none focus:border-orange-500/30" 
                            />
                        </div>
                    </div>

                    {quote.status === 'sold' && (
                        <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 space-y-4 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-2.5">
                                <Wallet className="w-4 h-4 text-emerald-500" />
                                <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Liquidación Real</h4>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-500 ml-1 uppercase tracking-widest">Cobrado Final</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">{getCurrencySymbol(quote.currency)}</div>
                                        <NumericInput 
                                            value={quote.soldPriceCollected} 
                                            onChange={val => setQuote(prev => ({ ...prev, soldPriceCollected: val }))}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 pl-8 rounded-xl text-slate-800 font-black text-xl outline-none focus:border-emerald-500/50" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-600 uppercase mb-0.5">Renta Real</p>
                                        <p className={`text-base font-black ${ (quote.soldPriceCollected - totals.net) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {quote.currency} {(quote.soldPriceCollected - totals.net).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-600 uppercase mb-0.5">Margen</p>
                                        <p className="text-base font-black text-slate-800">
                                            {totals.net > 0 ? (((quote.soldPriceCollected - totals.net) / totals.net) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-2">
                        <button 
                            onClick={generateWhatsApp}
                            className="btn-outline w-full !py-4"
                        >
                            <Send className="w-4 h-4" /> GENERAR PARA WHATSAPP
                        </button>

                        {whatsappText && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 mt-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
                                    <pre className="text-[10px] text-emerald-500/90 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                                        {whatsappText}
                                    </pre>
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(whatsappText)
                                        toast.success('Texto copiado al portapapeles')
                                    }}
                                    className="w-full primary-button bg-emerald-600 hover:bg-emerald-500 !py-4 shadow-emerald-500/30 text-[11px]"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> COPIAR Y ENVIAR
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="premium-card">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <h4 className="section-label mb-0">Notas Internas</h4>
                </div>
                <textarea 
                  value={quote.notes}
                  onChange={e => setQuote({...quote, notes: e.target.value})}
                  className="standard-input min-h-[100px] resize-none"
                  placeholder="Recordatorios o políticas especiales..."
                />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE HISTORIAL */}
      {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-50 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowHistory(false)} />
              <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500">
                  <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
                            <History className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">HISTORIAL</h3>
                            <p className="section-label mb-0 mt-0.5 text-[10px] opacity-60">GESTIÓN DE ACTIVIDAD</p>
                        </div>
                    </div>
                    <button onClick={() => setShowHistory(false)} className="secondary-button !w-10 !h-10 !p-0 rounded-xl">
                        <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                      {historyQuotes.length > 0 ? historyQuotes.map(q => (
                          <div 
                            key={q.id} 
                            onClick={() => handleLoadQuote(q.id)} 
                            className="group relative bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-between hover:border-orange-500/30"
                          >
                              <div className="flex items-center gap-6">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform ${
                                      q.status === 'sold' ? 'bg-emerald-500/10 text-emerald-500' :
                                      q.status === 'lost' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                                  }`}>
                                      <Calendar className="w-6 h-6" />
                                  </div>
                                  <div>
                                      <p className="text-slate-800 font-black text-lg tracking-tight uppercase group-hover:text-orange-500 transition-colors">{q.title || 'Cotización sin título'}</p>
                                      <div className="flex items-center gap-4 mt-2">
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                              <MapPin className="w-3 h-3" /> {q.destination || 'Sin destino'}
                                          </p>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                              <DollarSign className="w-3 h-3" /> {q.currency} {q.items?.length || 0} items
                                          </p>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-8">
                                  <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Estado</p>
                                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                          q.status === 'sold' ? 'bg-emerald-500/10 text-emerald-500' :
                                          q.status === 'lost' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500'
                                      }`}>
                                          {q.status === 'draft' ? 'Borrador' : 
                                           q.status === 'sent' ? 'Enviada' : 
                                           q.status === 'follow_up' ? 'Seguimiento' : 
                                           q.status === 'reserved' ? 'Reserva' : 
                                           q.status === 'sold' ? 'Vendido' : 'Perdido'}
                                      </span>
                                  </div>
                                  <ChevronDown className="w-5 h-5 text-slate-800 -rotate-90 group-hover:text-orange-500 transition-colors" />
                              </div>
                          </div>
                      )) : (
                          <div className="py-32 text-center">
                              <History className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                              <p className="text-slate-600 text-xs font-black uppercase tracking-[0.2em]">No se encontraron cotizaciones previas</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {itemToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-slate-50 backdrop-blur-sm" onClick={() => setItemToDelete(null)} />
              <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] p-10 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trash2 className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">¿Eliminar este servicio?</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-4 leading-relaxed">Esta acción no se puede deshacer y borrará todos los datos asociados.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-10">
                      <button 
                        onClick={() => setItemToDelete(null)}
                        className="py-4 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all outline-none"
                      >
                          Cancelar
                      </button>
                      <button 
                        onClick={confirmRemoveItem}
                        className="py-4 bg-red-500 hover:bg-red-400 rounded-2xl text-[10px] font-black text-slate-800 uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all outline-none"
                      >
                          Eliminar
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  )
}
