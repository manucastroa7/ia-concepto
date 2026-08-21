import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
    Plus, Trash2, Plane, Hotel, Users, ShieldCheck, Send, Save, History, Search, 
    ChevronDown, CheckCircle2, X, Briefcase, Clock, Calendar, MapPin, DollarSign, 
    Wallet, FileText, XCircle, ArrowRight, Eye, Train, Upload, Camera, Sparkles, UserPlus,
    Luggage, ArrowRightLeft, GripVertical, Building2, CreditCard, ArrowUpDown, Tag, Receipt, Clipboard, RefreshCw,
    AlertTriangle, CalendarDays, Printer, Share2, Download, LayoutDashboard, Copy, Bus, Compass, Utensils, Award, MessageSquare, Calculator
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// --- TIPOS DE DATOS ---

export interface Segment {
  id: string
  from: string
  to: string
  flightNumber: string
  departureDate: string
  departureTime: string
  arrivalDate?: string
  arrivalTime?: string
  stops?: string
  layoverDetails?: string
}

export interface Room {
  id: string
  type: string
  board: string
  paxCount: number
  price: number
}

export interface CustomExpense {
  id: string
  label: string
  amount: number
}

export interface GroupItemDetails {
  // Aéreos
  airline?: string
  bookingCode?: string
  type?: 'ROUND_TRIP' | 'ONE_WAY' | 'MULTI'
  costDividerMode?: 'per_passenger' | 'divided_total'
  segments?: Segment[]
  baggage?: {
    hasHand?: boolean
    handDesc?: string
    hasCarryOn?: boolean
    carryOnDesc?: string
    hasChecked?: boolean
    checkedDesc?: string
  }

  // Hoteles
  hotelName?: string
  confirmationNumber?: string
  checkIn?: string
  checkOut?: string
  rooms?: Room[]
  cancellationDate?: string

  // Trenes
  trainOperator?: string
  trainNumber?: string
  origin?: string
  destination?: string
  departureDate?: string
  departureTime?: string
  arrivalDate?: string
  arrivalTime?: string
  classType?: string
  seatDetails?: string

  // Traslados
  isRoundTrip?: boolean
  date?: string
  time?: string

  // Asistencia y Servicios
  assistanceCompany?: string
  documentNumber?: string
  startDate?: string
  endDate?: string
  planType?: string
  coverage?: string
  serviceName?: string
  description?: string
}

export interface GroupItemEconomics {
  baseNetCost: number
  adjustments: { id: string; label: string; type: 'percentage' | 'fixed'; value: number; impact: 'cost' | 'profit' }[]
  pricingModel: 'per_passenger' | 'divided_total'
  passengerCount: number
  liberados: number
  commissionType: 'percentage' | 'fixed'
  commissionValue: number
  totalComisionable?: number
  comision?: number
  iva?: number
  gastosAdm?: number
  suplementos?: number
  customExpenses?: CustomExpense[]
}

export interface GroupItem {
  id: string
  type: 'flight' | 'hotel' | 'train' | 'transfer' | 'assistance' | 'service' | 'excursion' | 'meal'
  providerId: string
  title?: string
  description?: string
  details: GroupItemDetails
  economics: GroupItemEconomics
}

export interface GroupPayment {
  id: string
  date: string
  amount: number
  method: string
  reference: string
  providerId?: string
  passengerId?: string
}

export type LiberadosRule = 'none' | '1_10' | '1_15' | '1_20' | 'fixed'

export interface GroupQuoteState {
  id?: string
  quoteNumber: string
  groupName: string
  clientName: string
  project: string
  destination: string
  startDate: string
  endDate: string
  validUntil: string
  pax: number
  liberadosRule: LiberadosRule
  fixedLiberados: number
  currency: 'USD' | 'ARS' | 'EUR'
  globalCommission: number
  commissionMode: 'percent' | 'fixed'
  priceOverride?: number | string
  status: 'draft' | 'sent' | 'confirmed' | 'lost'
  includes: string
  excludes: string
  observations: string
  clientNotes: string
  items: GroupItem[]
  payments: GroupPayment[]
  providerPayments: GroupPayment[]
}

const uid = () => Math.random().toString(36).substring(2, 9)
const fmtVal = (v: number) => (Number(v) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d?: string) => {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export function GroupQuoteManager() {
  const [viewMode, setViewMode] = useState<'builder' | 'list'>('builder')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'confirmed' | 'lost'>('all')

  const [quote, setQuote] = useState<GroupQuoteState>({
    quoteNumber: '',
    groupName: '',
    clientName: '',
    project: '',
    destination: '',
    startDate: '',
    endDate: '',
    validUntil: '',
    pax: 20,
    liberadosRule: '1_15',
    fixedLiberados: 0,
    currency: 'USD',
    globalCommission: 15,
    commissionMode: 'percent',
    priceOverride: '',
    status: 'draft',
    includes: '✓ Hotelería con régimen especificado\n✓ Traslados privados para todo el grupo\n✓ Guía acompañante en destino',
    excludes: '✗ Gastos personales y propinas\n✗ Comidas no especificadas',
    observations: '',
    clientNotes: '',
    items: [],
    payments: [],
    providerPayments: []
  })

  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [operators, setOperators] = useState<any[]>([])
  const [passengers, setPassengers] = useState<any[]>([])
  const [historyQuotes, setHistoryQuotes] = useState<any[]>([])
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})
  const [isParsingPayment, setIsParsingPayment] = useState<string | null>(null)
  const [isParsingFlight, setIsParsingFlight] = useState<string | null>(null)
  const [isParsingService, setIsParsingService] = useState<string | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [whatsappText, setWhatsappText] = useState('')
  const isFirstMount = useRef(true)

  useEffect(() => {
    fetchOperators()
    fetchHistory()
    fetchPassengers()
  }, [])

  // Autoguardado debounced (1.5s)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const hasData = quote.id || quote.groupName || quote.clientName || quote.destination || quote.items.length > 0
    if (!hasData) return

    setAutoSaveStatus('unsaved')
    const timer = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving')
        localStorage.setItem('group_quote_draft', JSON.stringify(quote))

        if (quote.id) {
          await axios.patch(`/api/group-quotes/${quote.id}`, quote)
          fetchHistory()
        } else if (quote.groupName || quote.clientName) {
          const res = await axios.post('/api/group-quotes', quote)
          if (res.data?.id) {
            setQuote(prev => ({ ...prev, id: res.data.id, quoteNumber: res.data.quoteNumber || prev.quoteNumber }))
            fetchHistory()
          }
        }
        setAutoSaveStatus('saved')
      } catch (err) {
        console.error('Error en autoguardado de grupo:', err)
        setAutoSaveStatus('saved')
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [quote])

  const fetchOperators = async () => {
    try {
      const res = await axios.get('/api/operators')
      setOperators(Array.isArray(res.data) ? res.data : [])
    } catch {
      setOperators([])
    }
  }

  const fetchPassengers = async () => {
    try {
      const res = await axios.get('/api/passengers')
      setPassengers(Array.isArray(res.data) ? res.data : [])
    } catch {
      setPassengers([])
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/group-quotes')
      setHistoryQuotes(Array.isArray(res.data) ? res.data : [])
    } catch {
      setHistoryQuotes([])
    }
  }

  // --- MOTOR DE CÁLCULO DE LIBERADOS Y ECONOMÍA DEL GRUPO ---
  const liberatedPax = useMemo(() => {
    const totalPax = Math.max(1, Number(quote.pax) || 1)
    if (quote.liberadosRule === '1_10') return Math.floor(totalPax / 10)
    if (quote.liberadosRule === '1_15') return Math.floor(totalPax / 15)
    if (quote.liberadosRule === '1_20') return Math.floor(totalPax / 20)
    if (quote.liberadosRule === 'fixed') return Math.max(0, Number(quote.fixedLiberados) || 0)
    return 0
  }, [quote.pax, quote.liberadosRule, quote.fixedLiberados])

  const paidPax = useMemo(() => {
    const totalPax = Math.max(1, Number(quote.pax) || 1)
    return Math.max(1, totalPax - liberatedPax)
  }, [quote.pax, liberatedPax])

  // Cálculo individual de cada item
  const calculateItemEconomics = (item: GroupItem) => {
    if (!item || !item.economics) {
      return { totalCost: 0, totalProfit: 0, totalSale: 0, netoAPagar: 0, ganancia: 0, totalACobrar: 0 }
    }
    const { baseNetCost = 0, adjustments = [], pricingModel, commissionType = 'percentage', commissionValue = 0, totalComisionable, comision, iva, gastosAdm, suplementos, customExpenses } = item.economics
    
    let netoAPagar = 0
    let ganancia = 0
    let totalACobrar = 0
    const sumCustomExpenses = (customExpenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)

    // Para grupos: por defecto si es por persona se multiplica por el total de pax del grupo
    const isPerPax = pricingModel === 'per_passenger' || item.details?.costDividerMode === 'per_passenger'
    const pCount = isPerPax ? Math.max(1, Number(quote.pax) || 1) : 1

    if (totalComisionable && totalComisionable > 0) {
      const com = Number(comision) || 0
      const iv = Number(iva) || 0
      const gAdm = Number(gastosAdm) || 0
      const sup = Number(suplementos) || 0

      netoAPagar = (Number(totalComisionable) - com + iv + gAdm + sup + sumCustomExpenses) * pCount
      totalACobrar = (Number(totalComisionable) + sup + iv + gAdm + sumCustomExpenses) * pCount
      ganancia = (totalACobrar - netoAPagar)
    } else {
      let totalCost = baseNetCost + sumCustomExpenses
      let totalProfit = 0

      adjustments?.forEach(adj => {
        const val = adj.type === 'percentage' ? (baseNetCost * (adj.value / 100)) : adj.value
        if (adj.impact === 'cost') totalCost += val
        if (adj.impact === 'profit') totalProfit += val
      })

      let comm = commissionType === 'percentage' ? (baseNetCost * (commissionValue / 100)) : commissionValue
      totalProfit += comm

      let saleBeforePax = totalCost + totalProfit
      netoAPagar = totalCost * pCount
      ganancia = totalProfit * pCount
      totalACobrar = saleBeforePax * pCount
    }

    return { totalCost: netoAPagar, totalProfit: ganancia, totalSale: totalACobrar, netoAPagar, ganancia, totalACobrar }
  }

  // Totales consolidados del Grupo
  const totals = useMemo(() => {
    let totalNet = 0
    let serviceProfit = 0
    let totalSale = 0

    quote.items.forEach(it => {
      const eco = calculateItemEconomics(it)
      totalNet += eco.netoAPagar
      serviceProfit += eco.ganancia
      totalSale += eco.totalACobrar
    })

    const override = Number(quote.priceOverride) || 0
    let totalSelling = 0
    let sellingPerPaidPax = 0

    if (override > 0) {
      sellingPerPaidPax = override
      totalSelling = override * paidPax
    } else {
      const globalComm = Number(quote.globalCommission) || 0
      const globalProfit = quote.commissionMode === 'fixed' ? (globalComm * paidPax) : (totalNet * (globalComm / 100))
      totalSelling = Math.ceil(totalNet + serviceProfit + globalProfit)
      sellingPerPaidPax = paidPax > 0 ? Math.ceil(totalSelling / paidPax) : totalSelling
    }

    const totalCollected = (quote.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const totalProviderPaid = (quote.providerPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const pendingCollection = Math.max(0, totalSelling - totalCollected)
    const pendingProviderPayment = Math.max(0, totalNet - totalProviderPaid)
    const realCashProfit = totalCollected - totalProviderPaid
    const totalProfit = totalSelling - totalNet

    return {
      totalNet,
      totalProfit,
      totalSelling,
      sellingPerPaidPax,
      totalCollected,
      pendingCollection,
      totalProviderPaid,
      pendingProviderPayment,
      realCashProfit
    }
  }, [quote, paidPax])

  // Desglose por Operadores
  const providerSummaryMap = useMemo(() => {
    const map: Record<string, { id: string; name: string; totalNet: number; totalPaid: number }> = {}

    quote.items.forEach(it => {
      const eco = calculateItemEconomics(it)
      const opId = it.providerId || 'unassigned'
      const opName = operators.find(o => o.id === opId)?.name || 'Sin Proveedor'

      if (!map[opId]) {
        map[opId] = { id: opId, name: opName, totalNet: 0, totalPaid: 0 }
      }
      map[opId].totalNet += eco.netoAPagar
    })

    ;(quote.providerPayments || []).forEach(p => {
      const opId = p.providerId || 'unassigned'
      if (map[opId]) {
        map[opId].totalPaid += (Number(p.amount) || 0)
      } else if (opId !== 'unassigned') {
        const opName = operators.find(o => o.id === opId)?.name || 'Proveedor'
        map[opId] = { id: opId, name: opName, totalNet: 0, totalPaid: Number(p.amount) || 0 }
      }
    })

    return map
  }, [quote.items, quote.providerPayments, operators])

  const usedOperators = useMemo(() => {
    const set = new Set<string>()
    quote.items.forEach(it => { if (it.providerId) set.add(it.providerId) })
    return operators.filter(op => set.has(op.id))
  }, [quote.items, operators])

  // --- MÉTODOS DE MANIPULACIÓN DE SERVICIOS ---
  const handleAddItem = (type: GroupItem['type']) => {
    const newItem: GroupItem = {
      id: uid(),
      type,
      providerId: '',
      details: type === 'flight' ? {
        airline: '',
        bookingCode: '',
        type: 'ROUND_TRIP',
        costDividerMode: 'per_passenger',
        segments: [{ id: '1', from: '', to: '', flightNumber: '', departureDate: '', departureTime: '', arrivalDate: '', arrivalTime: '', stops: 'Directo' }],
        baggage: { hasHand: true, handDesc: 'Mochila', hasCarryOn: true, carryOnDesc: '10kg', hasChecked: true, checkedDesc: '23kg' }
      } : type === 'hotel' ? {
        hotelName: '',
        confirmationNumber: '',
        checkIn: '',
        checkOut: '',
        rooms: [{ id: '1', type: 'Doble Standard', board: 'Desayuno Buffet', paxCount: 2, price: 0 }]
      } : type === 'train' ? {
        trainOperator: '',
        trainNumber: '',
        origin: '',
        destination: '',
        departureDate: '',
        departureTime: '',
        classType: 'Primera / Confort'
      } : type === 'transfer' ? {
        origin: '',
        destination: '',
        isRoundTrip: true,
        date: '',
        time: ''
      } : {
        description: '',
        confirmationNumber: ''
      },
      economics: {
        baseNetCost: 0,
        adjustments: [],
        pricingModel: 'per_passenger',
        passengerCount: quote.pax || 20,
        liberados: 0,
        commissionType: 'percentage',
        commissionValue: 10,
        customExpenses: []
      }
    }
    setQuote(prev => ({ ...prev, items: [...prev.items, newItem] }))
    setExpandedItem(newItem.id)
    toast.success(`Servicio de ${type.toUpperCase()} agregado al grupo`)
  }

  const removeItem = (itemId: string) => {
    setQuote(prev => ({ ...prev, items: prev.items.filter(it => it.id !== itemId) }))
    toast.success('Servicio eliminado')
  }

  const updateItemDetails = (itemId: string, key: string, value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === itemId ? { ...it, details: { ...it.details, [key]: value } } : it)
    }))
  }

  const updateItemEconomics = (itemId: string, key: string, value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === itemId ? { ...it, economics: { ...it.economics, [key]: value } } : it)
    }))
  }

  // --- LECTURA DE COMPROBANTES CON IA ---
  const handleParsePaymentReceipt = async (paymentType: 'payments' | 'providerPayments', paymentId: string, file: File) => {
    setIsParsingPayment(paymentId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('/api/manual-quotes/parse-payment-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const parsed = res.data
      if (parsed) {
        let formattedDate = ''
        if (parsed.date && typeof parsed.date === 'string') {
          const str = parsed.date.trim()
          if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            formattedDate = str
          } else {
            const match = str.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})$/)
            if (match) {
              const d = match[1].padStart(2, '0')
              const m = match[2].padStart(2, '0')
              let y = match[3]
              if (y.length === 2) y = `20${y}`
              formattedDate = `${y}-${m}-${d}`
            }
          }
        }

        const amt = typeof parsed.amount === 'number' ? parsed.amount : (parseFloat(parsed.amount) || 0)
        const ref = parsed.reference || ''
        const methodVal = parsed.method || 'transfer'

        setExpandedPayments(prev => ({ ...prev, [paymentId]: true }))

        setQuote(prev => ({
          ...prev,
          [paymentType]: prev[paymentType].map(p => {
            if (p.id === paymentId) {
              return {
                ...p,
                amount: amt > 0 ? amt : p.amount,
                date: formattedDate || p.date,
                reference: ref || p.reference,
                method: methodVal || p.method
              }
            }
            return p
          })
        }))

        if (paymentType === 'providerPayments' && parsed.recipientName) {
          const recUpper = String(parsed.recipientName).toUpperCase()
          const matchedOp = operators.find(op => op.name.toUpperCase().includes(recUpper) || recUpper.includes(op.name.toUpperCase()))
          if (matchedOp) {
            setQuote(prev => ({
              ...prev,
              providerPayments: prev.providerPayments.map(p => p.id === paymentId ? { ...p, providerId: matchedOp.id } : p)
            }))
            toast.success(`Proveedor detectado: ${matchedOp.name}`)
          }
        }

        toast.success(`Comprobante procesado con IA: $${amt} (Ref: ${ref || 'Sin ref'})`, { icon: '🤖' })
      }
    } catch {
      toast.error('Error al analizar la imagen del comprobante de pago')
    } finally {
      setIsParsingPayment(null)
    }
  }

  const handlePastePaymentFromClipboard = async (paymentType: 'payments' | 'providerPayments', paymentId: string) => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        toast.error('Presioná Ctrl + V para pegar la captura del comprobante')
        return
      }
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const file = new File([blob], 'comprobante-pago.png', { type: imageType })
          toast.loading('Analizando comprobante con IA...', { id: 'paste-payment' })
          await handleParsePaymentReceipt(paymentType, paymentId, file)
          toast.dismiss('paste-payment')
          return
        }
      }
      toast.error('No se encontró ninguna imagen en el portapapeles. Hacé una captura (Win+Shift+S) e intentá de nuevo.')
    } catch {
      toast.error('Copiá la imagen del comprobante e intentá de nuevo')
    }
  }

  const addPayment = (kind: 'payments' | 'providerPayments') => {
    const newP: GroupPayment = {
      id: uid(),
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      method: 'transfer',
      reference: ''
    }
    setExpandedPayments(prev => ({ ...prev, [newP.id]: true }))
    setQuote(prev => ({ ...prev, [kind]: [...prev[kind], newP] }))
  }

  const updatePayment = (kind: 'payments' | 'providerPayments', id: string, key: keyof GroupPayment, value: any) => {
    setQuote(prev => ({
      ...prev,
      [kind]: prev[kind].map(p => p.id === id ? { ...p, [key]: value } : p)
    }))
  }

  const removePayment = (kind: 'payments' | 'providerPayments', id: string) => {
    setQuote(prev => ({
      ...prev,
      [kind]: prev[kind].filter(p => p.id !== id)
    }))
  }

  const saveGroupQuote = async () => {
    try {
      if (quote.id) {
        await axios.patch(`/api/group-quotes/${quote.id}`, quote)
        toast.success('Cotización de grupo actualizada')
      } else {
        const res = await axios.post('/api/group-quotes', quote)
        if (res.data?.id) {
          setQuote(prev => ({ ...prev, id: res.data.id, quoteNumber: res.data.quoteNumber || prev.quoteNumber }))
          toast.success('Cotización de grupo guardada en CRM')
        }
      }
      fetchHistory()
    } catch {
      toast.error('Error al guardar cotización de grupo')
    }
  }

  const generateWhatsapp = async () => {
    try {
      const res = await axios.post('/api/group-quotes/generate-whatsapp', { quoteData: quote })
      const text = res.data.text || ''
      setWhatsappText(text)
      await navigator.clipboard?.writeText(text)
      toast.success('Itinerario copiado al portapapeles para WhatsApp')
    } catch {
      toast.error('Error al generar texto para WhatsApp')
    }
  }

  const filteredQuotes = useMemo(() => {
    return historyQuotes.filter(q => {
      if (statusFilter !== 'all' && q.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const gName = (q.groupName || '').toLowerCase()
        const cName = (q.clientName || '').toLowerCase()
        const dest = (q.destination || '').toLowerCase()
        return gName.includes(query) || cName.includes(query) || dest.includes(query)
      }
      return true
    })
  }, [historyQuotes, statusFilter, searchQuery])

  return (
    <div className="space-y-8 pb-24">
      
      {/* VISTA SWITCHER HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" /> Historial de Grupos ({historyQuotes.length})
          </button>
          <button
            onClick={() => setViewMode('builder')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'builder' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" /> {quote.id ? 'Editando Cotización Grupal' : 'Nueva Cotización Grupal'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {autoSaveStatus === 'saving' && <span className="text-xs font-bold text-amber-600 animate-pulse">Guardando...</span>}
          {autoSaveStatus === 'saved' && <span className="text-xs font-bold text-emerald-600">✓ Guardado</span>}
          <button onClick={generateWhatsapp} className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-black text-xs uppercase tracking-wider rounded-xl border border-emerald-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs">
            <MessageSquare className="w-4 h-4" /> Copiar WhatsApp
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* VISTA HISTORIAL DE GRUPOS */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Historial de Cotizaciones Grupales</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Gestión avanzada de contingentes, giras, viajes estudiantiles y salidas de grupo.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por grupo, cliente o destino..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 w-64 outline-none"
                />
              </div>
              <button
                onClick={() => {
                  setQuote({
                    quoteNumber: '',
                    groupName: '',
                    clientName: '',
                    project: '',
                    destination: '',
                    startDate: '',
                    endDate: '',
                    validUntil: '',
                    pax: 20,
                    liberadosRule: '1_15',
                    fixedLiberados: 0,
                    currency: 'USD',
                    globalCommission: 15,
                    commissionMode: 'percent',
                    priceOverride: '',
                    status: 'draft',
                    includes: '✓ Hotelería con régimen especificado\n✓ Traslados privados para todo el grupo',
                    excludes: '✗ Gastos personales\n✗ Comidas no especificadas',
                    observations: '',
                    clientNotes: '',
                    items: [],
                    payments: [],
                    providerPayments: []
                  })
                  setViewMode('builder')
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Crear Nueva Cotización Grupal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuotes.map(q => (
              <div
                key={q.id}
                onClick={() => {
                  setQuote(q)
                  setViewMode('builder')
                  toast.success(`Grupo cargado: ${q.groupName || 'Sin Nombre'}`)
                }}
                className="p-5 rounded-2xl border border-slate-200/80 hover:border-orange-300 transition-all hover:shadow-md bg-white flex flex-col justify-between space-y-4 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.quoteNumber || 'REF: GRUPO'}</span>
                    <span className="text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-700">{q.status}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                    {q.groupName || q.clientName || 'Grupo sin nombre'}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Destino: <strong className="text-slate-800">{q.destination || 'Por definir'}</strong> · {q.pax || 0} Pax Totales
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[9.5px] font-bold text-slate-400 uppercase">Precio por Pax Pagante</p>
                    <p className="font-black text-orange-600 text-base leading-tight">{q.currency || 'USD'} ${fmtVal(q.totalPerPerson || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9.5px] font-bold text-slate-400 uppercase">Venta Total Grupo</p>
                    <p className="font-black text-slate-900 text-xs">{q.currency || 'USD'} ${fmtVal(q.totalSelling || 0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VISTA EDITOR COTIZADOR DE GRUPOS */
        <div className="space-y-8">
          
          {/* HEADER DEL COTIZADOR GRUPAL */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cotizador de Grupos</h1>
                <p className="text-xs text-slate-500 font-semibold">Cálculo Inteligente de Liberados, Márgenes y Costos por Pasajero Amortizado</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* SELECTOR DE MONEDA */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {(['USD', 'ARS', 'EUR'] as const).map(curr => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setQuote(prev => ({ ...prev, currency: curr }))}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      quote.currency === curr ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={saveGroupQuote}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" /> Guardar Cotización de Grupo
              </button>
            </div>
          </div>

          {/* MOTOR DE CÁLCULO DE LIBERADOS (KPI CARDS SUPERIORES) */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center font-black">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Configuración de Liberados (Free Spots)</h3>
                  <p className="text-xs text-slate-400 font-medium">Define las plazas sin cargo para coordinadores, profesores o choferes amortizadas en los pagantes</p>
                </div>
              </div>

              {/* SELECTOR DE REGLA DE LIBERADOS */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-300 uppercase">Regla de Liberados:</span>
                <select
                  value={quote.liberadosRule}
                  onChange={e => setQuote(prev => ({ ...prev, liberadosRule: e.target.value as LiberadosRule }))}
                  className="bg-slate-800 border border-slate-700 text-orange-400 font-black text-xs px-3.5 py-2 rounded-xl outline-none"
                >
                  <option value="1_10">1 Liberado cada 10 Pax (10+1)</option>
                  <option value="1_15">1 Liberado cada 15 Pax (15+1)</option>
                  <option value="1_20">1 Liberado cada 20 Pax (20+1)</option>
                  <option value="fixed">Liberados Fijos (Manual)</option>
                  <option value="none">Sin Liberados (Todos Pagantes)</option>
                </select>

                {quote.liberadosRule === 'fixed' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">Cant:</span>
                    <input
                      type="number"
                      value={quote.fixedLiberados}
                      onChange={e => setQuote(prev => ({ ...prev, fixedLiberados: parseInt(e.target.value) || 0 }))}
                      className="w-16 bg-slate-800 border border-slate-700 text-white font-black text-xs px-2.5 py-2 rounded-xl outline-none text-center"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* KPI METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pasajeros Totales Grupo</p>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={quote.pax}
                    onChange={e => setQuote(prev => ({ ...prev, pax: parseInt(e.target.value) || 1 }))}
                    className="w-20 bg-slate-900 border border-slate-700 text-white text-2xl font-black rounded-lg px-2 py-0.5 text-center outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">Pax Totales</span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                <p className="text-[10px] font-black uppercase text-orange-400 tracking-wider">Pax Pagantes vs Liberados</p>
                <p className="text-2xl font-black text-white">{paidPax} <span className="text-xs font-bold text-orange-400">Pagantes (+{liberatedPax} Liberados)</span></p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Neto Total Grupo</p>
                <p className="text-2xl font-black text-slate-200">{quote.currency} ${fmtVal(totals.totalNet)}</p>
              </div>

              <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-4 rounded-2xl text-white shadow-lg space-y-1">
                <p className="text-[10px] font-black uppercase text-orange-100 tracking-wider">Precio Final por Pax Pagante</p>
                <p className="text-2xl font-black">{quote.currency} ${fmtVal(totals.sellingPerPaidPax)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* COLUMNA PRINCIPAL EDITOR */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* DATOS DEL GRUPO */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Datos del Contingente / Proyecto</h3>
                    <p className="text-xs text-slate-500 font-medium">Información comercial, institución y fechas del viaje del grupo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Nombre del Grupo / Contingente</label>
                    <input
                      value={quote.groupName}
                      onChange={e => setQuote(prev => ({ ...prev, groupName: e.target.value }))}
                      placeholder="Ej: Gira de Estudios Colegio San Martín"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Cliente / Encargado / Institución</label>
                    <input
                      value={quote.clientName}
                      onChange={e => setQuote(prev => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Ej: Coord. Juan Pérez / Prof. María"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Destino Principal</label>
                    <input
                      value={quote.destination}
                      onChange={e => setQuote(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="Ej: Bariloche / Brasil / Europa"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Fecha de Salida</label>
                    <input
                      type="date"
                      value={quote.startDate}
                      onChange={e => setQuote(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Fecha de Regreso</label>
                    <input
                      type="date"
                      value={quote.endDate}
                      onChange={e => setQuote(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BOTONES PARA AGREGAR SERVICIOS */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">Agregar Servicios al Grupo</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { type: 'flight', label: 'VUELOS', icon: Plane, bg: 'bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white border-sky-200/70' },
                    { type: 'hotel', label: 'ALOJAMIENTO', icon: Hotel, bg: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-200/70' },
                    { type: 'transfer', label: 'TRASLADOS', icon: Bus, bg: 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border-amber-200/70' },
                    { type: 'train', label: 'TRENES', icon: Train, bg: 'bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white border-purple-200/70' },
                    { type: 'assistance', label: 'ASISTENCIA', icon: ShieldCheck, bg: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border-indigo-200/70' },
                    { type: 'service', label: 'EXCURSIÓN/OTRO', icon: Compass, bg: 'bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white border-slate-200' }
                  ].map(btn => (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => handleAddItem(btn.type as any)}
                      className={`bg-white border ${btn.bg.split(' ').pop()} p-3 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs hover:shadow-md hover:-translate-y-0.5`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${btn.bg.split(' ').slice(0, 4).join(' ')} flex items-center justify-center transition-all shadow-2xs`}>
                        <btn.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase text-center">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* LISTADO DE TARJETAS DE SERVICIO (Mismo diseño que Cotizador Manual) */}
              <div className="space-y-4">
                {quote.items.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                    <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-black uppercase text-slate-800">No hay servicios cargados aún</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Seleccioná un tipo de servicio arriba para comenzar a estructurar los costos del grupo.</p>
                  </div>
                ) : (
                  quote.items.map((item, idx) => {
                    const isExp = expandedItem === item.id
                    const provider = operators.find(o => o.id === item.providerId)
                    const eco = calculateItemEconomics(item)

                    return (
                      <div key={item.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                        
                        {/* BARRA SUPERIOR DE TARJETA (HEADER) */}
                        <div
                          onClick={() => setExpandedItem(isExp ? null : item.id)}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-all border-b border-slate-100"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
                              {item.type === 'flight' ? <Plane className="w-5 h-5" /> :
                               item.type === 'hotel' ? <Hotel className="w-5 h-5" /> :
                               item.type === 'train' ? <Train className="w-5 h-5" /> :
                               item.type === 'transfer' ? <Bus className="w-5 h-5" /> :
                               item.type === 'assistance' ? <ShieldCheck className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 uppercase">
                                {item.type === 'flight' ? (item.details.airline || 'Aéreo Grupal') :
                                 item.type === 'hotel' ? (item.details.hotelName || 'Alojamiento Grupal') :
                                 item.type === 'transfer' ? `Traslado: ${item.details.origin || 'Origen'} ➔ ${item.details.destination || 'Destino'}` :
                                 (item.details.description || item.type.toUpperCase())}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                Proveedor: <strong className="text-slate-800">{provider ? provider.name : 'Sin asignar'}</strong> · Modo: {item.economics.pricingModel === 'per_passenger' ? 'Por Pax' : 'Por Grupo Total'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-[9.5px] font-bold text-slate-400 uppercase">Neto Total Servicio</p>
                              <p className="text-sm font-black text-slate-900">{quote.currency} ${fmtVal(eco.netoAPagar)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeItem(item.id) }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* DETALLE EXPANDIBLE DEL SERVICIO */}
                        {isExp && (
                          <div className="p-6 bg-slate-50/70 border-t border-slate-100 space-y-6">
                            
                            {/* PROVEEDOR Y MODO DE COSTO */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Proveedor / Operador</label>
                                <select
                                  value={item.providerId || ''}
                                  onChange={e => setQuote(prev => ({
                                    ...prev,
                                    items: prev.items.map(it => it.id === item.id ? { ...it, providerId: e.target.value } : it)
                                  }))}
                                  className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                >
                                  <option value="">Seleccionar Proveedor...</option>
                                  {operators.map(op => <option key={op.id} value={op.id}>🏢 {op.name}</option>)}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Modelo de Tarifa</label>
                                <select
                                  value={item.economics.pricingModel}
                                  onChange={e => updateItemEconomics(item.id, 'pricingModel', e.target.value)}
                                  className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                >
                                  <option value="per_passenger">Por Pasajero (Multiplica por Pax Grupo)</option>
                                  <option value="divided_total">Tarifa Total Grupo (Monto Global Fijo)</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Costo Neto Unitario ({quote.currency})</label>
                                <input
                                  type="number"
                                  value={item.economics.baseNetCost || ''}
                                  onChange={e => updateItemEconomics(item.id, 'baseNetCost', parseFloat(e.target.value) || 0)}
                                  placeholder="Ej: 450"
                                  className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-900 outline-none"
                                />
                              </div>
                            </div>

                            {/* CAMPOS ESPECÍFICOS SEGÚN TIPO */}
                            {item.type === 'flight' && (
                              <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200">
                                <h5 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                                  <Plane className="w-4 h-4 text-sky-600" /> Detalle de Vuelo Grupal
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <input
                                    value={item.details.airline || ''}
                                    onChange={e => updateItemDetails(item.id, 'airline', e.target.value)}
                                    placeholder="Aerolínea (ej: Aerolíneas Argentinas)"
                                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold"
                                  />
                                  <input
                                    value={item.details.bookingCode || ''}
                                    onChange={e => updateItemDetails(item.id, 'bookingCode', e.target.value)}
                                    placeholder="Código PNR / Localizador de Grupo"
                                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold"
                                  />
                                </div>
                              </div>
                            )}

                            {item.type === 'hotel' && (
                              <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200">
                                <h5 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                                  <Hotel className="w-4 h-4 text-emerald-600" /> Detalle de Alojamiento Grupal
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <input
                                    value={item.details.hotelName || ''}
                                    onChange={e => updateItemDetails(item.id, 'hotelName', e.target.value)}
                                    placeholder="Nombre del Hotel"
                                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold"
                                  />
                                  <input
                                    type="date"
                                    value={item.details.checkIn || ''}
                                    onChange={e => updateItemDetails(item.id, 'checkIn', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold"
                                  />
                                  <input
                                    type="date"
                                    value={item.details.checkOut || ''}
                                    onChange={e => updateItemDetails(item.id, 'checkOut', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold"
                                  />
                                </div>
                              </div>
                            )}

                            {/* CÁLCULO FINANCIERO Y MARGEN DE ESTE SERVICIO */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                              <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
                                <p className="text-[9.5px] font-black uppercase text-slate-400">Neto a Pagar a Proveedor</p>
                                <p className="text-base font-black">{quote.currency} ${fmtVal(eco.netoAPagar)}</p>
                              </div>
                              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                                <p className="text-[9.5px] font-black uppercase text-emerald-600">Ganancia Agencia</p>
                                <p className="text-base font-black text-emerald-700">+{quote.currency} ${fmtVal(eco.ganancia)}</p>
                              </div>
                              <div className="p-3 bg-orange-50 rounded-xl text-center">
                                <p className="text-[9.5px] font-black uppercase text-orange-600">Total a Cobrar Cliente</p>
                                <p className="text-base font-black text-orange-700">{quote.currency} ${fmtVal(eco.totalACobrar)}</p>
                              </div>
                            </div>

                          </div>
                        )}

                      </div>
                    )
                  })
                )}
              </div>

              {/* COBROS Y PAGOS A PROVEEDORES DEL GRUPO (FINANCIERA & TESORERÍA) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* COBROS DEL GRUPO */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" /> Cobros del Grupo (Ingresos)
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                        Cobrado: <strong className="text-emerald-600">${fmtVal(totals.totalCollected)}</strong> · Pendiente: <strong className="text-orange-600">${fmtVal(totals.pendingCollection)}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePastePaymentFromClipboard('payments', '')}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-black text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Pegar Comprobante IA
                      </button>
                      <button
                        type="button"
                        onClick={() => addPayment('payments')}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-black text-xs uppercase rounded-xl shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Nuevo Cobro
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {quote.payments.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium py-4 italic text-center bg-white rounded-xl border border-slate-200">Sin cobros registrados aún.</p>
                    ) : (
                      quote.payments.map(p => (
                        <div key={p.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={p.date}
                              onChange={e => updatePayment('payments', p.id, 'date', e.target.value)}
                              className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold"
                            />
                            <input
                              type="number"
                              value={p.amount || ''}
                              onChange={e => updatePayment('payments', p.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="Monto"
                              className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-black text-emerald-600"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={p.reference || ''}
                              onChange={e => updatePayment('payments', p.id, 'reference', e.target.value)}
                              placeholder="N° Comprobante / Ref"
                              className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => removePayment('payments', p.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* PAGOS A PROVEEDORES DEL GRUPO */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-sky-600" /> Pagos a Proveedores (Egresos)
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                        Pagado: <strong className="text-sky-600">${fmtVal(totals.totalProviderPaid)}</strong> · Pendiente: <strong className="text-amber-600">${fmtVal(totals.pendingProviderPayment)}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePastePaymentFromClipboard('providerPayments', '')}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-black text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Pegar Comprobante IA
                      </button>
                      <button
                        type="button"
                        onClick={() => addPayment('providerPayments')}
                        className="px-3.5 py-1.5 bg-sky-600 text-white font-black text-xs uppercase rounded-xl shadow-xs hover:bg-sky-700 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Nuevo Pago
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {quote.providerPayments.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium py-4 italic text-center bg-white rounded-xl border border-slate-200">Sin pagos a proveedores registrados.</p>
                    ) : (
                      quote.providerPayments.map(p => (
                        <div key={p.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={p.date}
                              onChange={e => updatePayment('providerPayments', p.id, 'date', e.target.value)}
                              className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold"
                            />
                            <input
                              type="number"
                              value={p.amount || ''}
                              onChange={e => updatePayment('providerPayments', p.id, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="Monto"
                              className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-black text-sky-600"
                            />
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={p.providerId || ''}
                              onChange={e => updatePayment('providerPayments', p.id, 'providerId', e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold"
                            >
                              <option value="">Seleccionar Proveedor...</option>
                              {usedOperators.map(op => <option key={op.id} value={op.id}>🏢 {op.name}</option>)}
                            </select>
                            <input
                              value={p.reference || ''}
                              onChange={e => updatePayment('providerPayments', p.id, 'reference', e.target.value)}
                              placeholder="Ref"
                              className="w-28 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => removePayment('providerPayments', p.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* SIDEBAR CONSOLIDADO FINAL STICKY */}
            <div className="xl:col-span-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg sticky top-8 space-y-6">
                
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-orange-500" /> Consolidado Final del Grupo
                </h3>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Neto Total Grupo</p>
                    <p className="text-lg font-black text-slate-900">{quote.currency} ${fmtVal(totals.totalNet)}</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Ganancia Bruta Estimada</p>
                    <p className="text-lg font-black text-emerald-700">+{quote.currency} ${fmtVal(totals.totalProfit)}</p>
                  </div>

                  <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-5 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                    <p className="text-[10px] font-black uppercase text-orange-100">Precio Final por Pax Pagante</p>
                    <p className="text-2xl font-black">{quote.currency} ${fmtVal(totals.sellingPerPaidPax)}</p>
                    <p className="text-[10px] text-orange-100 font-medium mt-1">Calculado sobre {paidPax} pagantes (+{liberatedPax} liberados)</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Comisión Global (%)</label>
                    <input
                      type="number"
                      value={quote.globalCommission}
                      onChange={e => setQuote(prev => ({ ...prev, globalCommission: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Forzar Precio Final por Pax</label>
                    <input
                      type="number"
                      value={quote.priceOverride}
                      onChange={e => setQuote(prev => ({ ...prev, priceOverride: e.target.value }))}
                      placeholder="Dejar vacío para cálculo automático"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveGroupQuote}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Guardar Cotización Grupal
                </button>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default GroupQuoteManager
