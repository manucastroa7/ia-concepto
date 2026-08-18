import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
    Plus, Trash2, Plane, Hotel, Users, ShieldCheck, Send, Save, History, Search, 
    ChevronDown, CheckCircle2, X, Briefcase, Clock, Calendar, MapPin, DollarSign, 
    Wallet, FileText, XCircle, ArrowRight, Eye, Train, Upload, Camera, Sparkles, UserPlus,
    Luggage, ArrowRightLeft, GripVertical, Building2, CreditCard, ArrowUpDown, Tag, Receipt, Clipboard, RefreshCw,
    AlertTriangle, CalendarDays, Printer, Share2, Download, LayoutDashboard, Copy
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PassengerProfileModal } from './PassengerProfileModal'

// --- COMPONENTES AUXILIARES ---

function NumericInput({ 
  value, 
  onChange, 
  className, 
  placeholder 
}: { 
  value: number | undefined | null, 
  onChange: (val: number) => void, 
  className?: string, 
  placeholder?: string 
}) {
  const [strValue, setStrValue] = useState<string>(value !== undefined && value !== null && value !== 0 ? String(value) : '')

  useEffect(() => {
    const currentParsed = parseFloat(strValue.replace(',', '.'))
    if (value === 0 && strValue === '') return
    if (isNaN(currentParsed) || currentParsed !== value) {
      setStrValue(value !== undefined && value !== null && value !== 0 ? String(value) : '')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value
    raw = raw.replace(',', '.')
    const clean = raw.replace(/[^0-9.]/g, '')
    const parts = clean.split('.')
    const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : clean

    setStrValue(formatted)
    if (formatted === '' || formatted === '.') {
      onChange(0)
    } else {
      const parsed = parseFloat(formatted)
      if (!isNaN(parsed)) {
        onChange(parsed)
      }
    }
  }

  return (
    <input 
      type="text"
      value={strValue}
      onChange={handleChange}
      onBlur={() => {
        if (strValue.endsWith('.')) {
          const trimmed = strValue.slice(0, -1)
          setStrValue(trimmed)
        }
      }}
      className={className}
      placeholder={placeholder || "0"}
    />
  )
}

const fmtDate = (dStr?: string) => {
  if (!dStr) return 'Sin fecha'
  const match = dStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  return dStr
}

const formatToInputDate = (dateStr?: string | null): string => {
  if (!dateStr || typeof dateStr !== 'string') return ''
  const clean = dateStr.trim()
  if (!clean) return ''
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean

  const dmyMatch = clean.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})$/)
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0')
    const month = dmyMatch[2].padStart(2, '0')
    let year = dmyMatch[3]
    if (year.length === 2) year = parseInt(year, 10) > 45 ? `19${year}` : `20${year}`
    return `${year}-${month}-${day}`
  }

  return ''
}

const calculateNights = (checkIn?: string, checkOut?: string): number => {
  if (!checkIn || !checkOut) return 0
  const d1Str = formatToInputDate(checkIn) || checkIn
  const d2Str = formatToInputDate(checkOut) || checkOut
  
  const d1 = new Date(d1Str)
  const d2 = new Date(d2Str)
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  
  const diffTime = d2.getTime() - d1.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

function SearchableOperatorSelect({ 
  value, 
  onChange, 
  operators, 
  onAddNewOperator 
}: { 
  value?: string, 
  onChange: (id: string) => void, 
  operators: any[], 
  onAddNewOperator: () => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedOperator = useMemo(() => {
    return operators.find(o => o.id === value)
  }, [value, operators])

  const filteredOperators = useMemo(() => {
    return operators.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
  }, [search, operators])

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800 text-xs font-bold flex justify-between items-center cursor-pointer hover:border-slate-300 transition-all h-[42px]"
      >
        <span className={selectedOperator ? 'text-slate-900 font-black uppercase truncate' : 'text-slate-500 font-normal'}>
          {selectedOperator ? `🏢 ${selectedOperator.name}` : 'Seleccionar Operador / Proveedor...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex gap-1.5 mb-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar proveedor..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs outline-none"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={() => { setIsOpen(false); onAddNewOperator() }}
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              title="Crear Nuevo Proveedor"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
            <button
              onClick={() => { onChange(''); setIsOpen(false) }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
            >
              -- Sin Operador Asignado --
            </button>
            {filteredOperators.map(op => (
              <button
                key={op.id}
                onClick={() => { onChange(op.id); setIsOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${value === op.id ? 'bg-orange-500/10 text-orange-600 font-black' : 'text-slate-800 hover:bg-slate-100'}`}
              >
                🏢 {op.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CompanionSearchableSelect({
  passengers,
  selectedIds,
  titularId,
  onToggle
}: {
  passengers: any[]
  selectedIds: string[]
  titularId: string
  onToggle: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const selectedPassengers = useMemo(() => {
    return passengers.filter(p => selectedIds.includes(p.id))
  }, [passengers, selectedIds])

  const availablePassengers = useMemo(() => {
    return passengers.filter(p => p.id !== titularId && !selectedIds.includes(p.id) && 
      (`${p.surname} ${p.name} ${p.passportNumber || ''}`).toLowerCase().includes(search.toLowerCase())
    )
  }, [passengers, titularId, selectedIds, search])

  return (
    <div className="space-y-3">
      {/* CHIPS DE PASAJEROS SELECCIONADOS */}
      <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-slate-50 rounded-2xl border border-slate-200/80 items-center">
        {selectedPassengers.length === 0 ? (
          <span className="text-xs text-slate-400 font-medium px-2">Sin acompañantes seleccionados</span>
        ) : (
          selectedPassengers.map(p => (
            <span key={p.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-black shadow-2xs">
              {p.surname}, {p.name}
              <button
                type="button"
                onClick={() => onToggle(p.id)}
                className="hover:bg-orange-600 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* BUSCADOR DE ACOMPAÑANTES */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar acompañante por Nombre, Apellido o DNI para agregar..."
          className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
        />

        {isOpen && search && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto p-2 space-y-1">
            {availablePassengers.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-400 font-medium">No se encontraron acompañantes</p>
            ) : (
              availablePassengers.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onToggle(p.id)
                    setSearch('')
                    setIsOpen(false)
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 uppercase">{p.surname}, {p.name}</span>
                  <Plus className="w-4 h-4 text-orange-500" />
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// --- TIPOS DE DATOS ---
interface Adjustment {
  id: string
  label: string
  type: 'percentage' | 'fixed'
  impact: 'cost' | 'profit'
  value: number
}

interface CustomExpense {
  id: string
  label: string
  amount: number
}

interface Segment {
  id: string
  from: string
  to: string
  flightNumber?: string
  departureDate: string
  departureTime: string
  arrivalDate: string
  arrivalTime: string
  stops?: string
  layoverDetails?: string
}

interface Room {
  id: string
  type: string
  board: string
  paxCount: number
  price?: number
}

interface Baggage {
  hasHand: boolean
  handDesc: string
  hasCarryOn: boolean
  carryOnDesc: string
  hasChecked: boolean
  checkedDesc: string
}

interface ItemDetails {
  // Aéreos
  airline?: string
  flightNumber?: string
  bookingCode?: string
  type?: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI'
  costDividerMode?: 'per_passenger' | 'divided_total'
  segments?: Segment[]
  baggage?: Baggage

  // Alojamiento
  hotelName?: string
  confirmationNumber?: string
  checkIn?: string
  checkOut?: string
  rooms?: Room[]
  cancellationDate?: string

  // Tren
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
  route?: string
  serviceName?: string
  description?: string
}

export interface ProviderPurchaseInvoice {
  id?: string
  invoiceNumber?: string
  providerId?: string
  providerName?: string
  taxTreatment?: 'facturable' | 'back_no_facturable'
  netGravado21: number
  iva21: number
  netGravado105: number
  iva105: number
  exento: number
  noComputable: number
  otrosTributos: number
  totalAmount: number
}

interface ItemEconomics {
  baseNetCost: number
  adjustments: Adjustment[]
  pricingModel: 'total' | 'per_passenger'
  passengerCount: number
  commissionType: 'percentage' | 'fixed'
  commissionValue: number

  // Campos de Detalle de Reserva (Agencia)
  totalComisionable?: number
  comision?: number
  iva?: number
  gastosAdm?: number
  suplementos?: number
  customExpenses?: CustomExpense[]
  providerPurchaseInvoice?: ProviderPurchaseInvoice
}

interface Item {
  id: string
  type: 'flight' | 'hotel' | 'train' | 'transfer' | 'assistance' | 'service'
  providerId: string
  title?: string
  description?: string
  assignedPassengerIds?: string[]
  details: ItemDetails
  economics: ItemEconomics
  price?: number
}

interface Payment {
  id: string
  date: string
  amount: number
  method: string
  reference: string
  providerId?: string
  passengerId?: string
}

export interface ArcaInvoice {
  id: string
  date: string
  docType: 'Factura A' | 'Factura B' | 'Factura C' | 'Nota de Débito' | 'Nota de Crédito'
  pointOfSale: number
  invoiceNumber: number
  voucherNumberStr: string
  receiverName: string
  receiverCuit: string
  receiverIvaCondition: 'Responsable Inscripto' | 'Consumidor Final' | 'Monotributo' | 'Exento'
  receiverAddress?: string
  currency: 'USD' | 'ARS'
  exchangeRate: number
  
  // 5 Categorías Impositivas de Turismo ARCA:
  netGravado21: number
  iva21: number
  netGravado105: number
  iva105: number
  exento: number
  noComputable: number
  otrosTributos: number
  totalAmount: number

  status: 'draft' | 'issued_sandbox' | 'issued_official'
  caeNumber?: string
  caeExpirationDate?: string
  legalLegend: string
}

interface QuoteState {
  id?: string
  passengerId: string
  passenger?: any
  clientName?: string
  title: string
  destination: string
  paxCount: number
  startDate: string
  endDate: string
  additionalPassengers: string[]
  currency: 'USD' | 'ARS' | 'EUR'
  items: Item[]
  payments: Payment[]
  providerPayments: Payment[]
  providerPurchaseInvoices?: ProviderPurchaseInvoice[]
  invoices?: ArcaInvoice[]
  globalAdjustment: number
  notes: string
  clientRequestNotes?: string
  status: 'draft' | 'sent' | 'follow_up' | 'reserved' | 'sold' | 'lost'
}

export function ManualQuoteBuilder({ initialViewMode = 'list' }: { initialViewMode?: 'dashboard' | 'list' | 'calendar' | 'builder' }) {
  const [viewMode, setViewMode] = useState<'dashboard' | 'builder' | 'list' | 'calendar'>(initialViewMode)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'reserved' | 'sold' | 'follow_up' | 'lost'>('all')
  const [quoteToDelete, setQuoteToDelete] = useState<any | null>(null)

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportMode, setExportMode] = useState<'package_total' | 'detailed'>('package_total')

  // Estado para Carga de Facturas de Compra de Mayoristas (Let's Travel, Toselli, etc.)
  const [showAddPurchaseInvoiceModal, setShowAddPurchaseInvoiceModal] = useState(false)
  const [purchaseInvoiceForm, setPurchaseInvoiceForm] = useState<ProviderPurchaseInvoice>({
    providerName: 'Let me travel',
    taxTreatment: 'facturable',
    invoiceNumber: '',
    netGravado21: 0,
    iva21: 0,
    netGravado105: 0,
    iva105: 0,
    exento: 0,
    noComputable: 0,
    otrosTributos: 0,
    totalAmount: 0
  })

  // Estados para Facturación ARCA & Proveedores
  const [showArcaInvoiceModal, setShowArcaInvoiceModal] = useState(false)
  const [selectedArcaInvoiceForView, setSelectedArcaInvoiceForView] = useState<ArcaInvoice | null>(null)
  const [arcaInvoiceForm, setArcaInvoiceForm] = useState<any>({
    mode: 'draft',
    docType: 'Factura B',
    pointOfSale: 5,
    invoiceNumber: 10773,
    receiverName: '',
    receiverCuit: '',
    receiverIvaCondition: 'Consumidor Final',
    receiverAddress: '',
    currency: 'USD',
    exchangeRate: 1515,
    netGravado21: 0,
    iva21: 0,
    netGravado105: 0,
    iva105: 0,
    exento: 0,
    noComputable: 0,
    otrosTributos: 0,
    totalAmount: 0
  })

  const [quote, setQuote] = useState<QuoteState>({
    passengerId: '',
    clientName: '',
    title: '',
    destination: '',
    paxCount: 1,
    startDate: '',
    endDate: '',
    additionalPassengers: [],
    currency: 'USD',
    items: [],
    payments: [],
    providerPayments: [],
    globalAdjustment: 0,
    notes: '',
    clientRequestNotes: '',
    status: 'draft'
  })

  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [operators, setOperators] = useState<any[]>([])
  const [passengerSearch, setPassengerSearch] = useState('')
  const [passengerResults, setPassengerResults] = useState<any[]>([])
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [selectedPassengerProfileId, setSelectedPassengerProfileId] = useState<string | null>(null)
  const [historyQuotes, setHistoryQuotes] = useState<any[]>([])
  const [passengers, setPassengers] = useState<any[]>([])

  // Modal para agregar pasajero rápido
  const [showNewPaxModal, setShowNewPaxModal] = useState(false)
  const [newPaxData, setNewPaxData] = useState({ name: '', surname: '', document: '', email: '', phone: '' })
  
  // Modal para agregar proveedor rápido
  const [showNewOperatorModal, setShowNewOperatorModal] = useState(false)
  const [newOperatorName, setNewOperatorName] = useState('')
  const [targetItemForOperator, setTargetItemForOperator] = useState<string | null>(null)

  const [isParsingFlight, setIsParsingFlight] = useState<string | null>(null)
  const [isParsingService, setIsParsingService] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})

  const togglePaymentExpanded = (pId: string) => {
    setExpandedPayments(prev => ({
      ...prev,
      [pId]: prev[pId] === undefined ? false : !prev[pId]
    }))
  }

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle')
  const isFirstMount = useRef(true)

  // Recuperar borrador sin guardar de localStorage al iniciar
  useEffect(() => {
    const savedDraft = localStorage.getItem('manual_quote_draft')
    if (savedDraft && !quote.id) {
      try {
        const parsed = JSON.parse(savedDraft)
        if (parsed && (parsed.items?.length > 0 || parsed.title || parsed.passengerId || parsed.destination)) {
          setQuote(parsed)
          if (parsed.passenger) {
            setPassengerSearch(`${parsed.passenger.surname}, ${parsed.passenger.name}`)
          }
          toast.success('Borrador previo recuperado automáticamente', { icon: '💾' })
        }
      } catch (e) {
        localStorage.removeItem('manual_quote_draft')
      }
    }
  }, [])

  // Autoguardado debounced (1.5s) en LocalStorage y Backend CRM
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const hasData = quote.id || quote.passengerId || quote.title || quote.destination || (quote.items && quote.items.length > 0)
    if (!hasData) return

    setAutoSaveStatus('unsaved')
    const timer = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving')
        localStorage.setItem('manual_quote_draft', JSON.stringify(quote))

        if (quote.id) {
          await axios.patch(`/api/manual-quotes/${quote.id}`, quote)
          fetchHistory()
          setAutoSaveStatus('saved')
        } else if (quote.passengerId || quote.title) {
          const res = await axios.post('/api/manual-quotes', quote)
          if (res.data?.id) {
            setQuote(prev => ({ ...prev, id: res.data.id }))
            fetchHistory()
            setAutoSaveStatus('saved')
          }
        } else {
          setAutoSaveStatus('saved')
        }
      } catch (err) {
        console.error('Error en autoguardado:', err)
        setAutoSaveStatus('saved')
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [quote])

  useEffect(() => {
    fetchOperators()
    fetchHistory()
    fetchAllPassengers()
  }, [])

  const fetchOperators = async () => {
    try {
      const res = await axios.get('/api/operators')
      setOperators(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.error('Error loading operators')
      setOperators([])
    }
  }

  const fetchAllPassengers = async () => {
    try {
      const res = await axios.get('/api/passengers')
      setPassengers(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.error('Error loading passengers')
      setPassengers([])
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/manual-quotes')
      setHistoryQuotes(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.error('Error loading history')
      setHistoryQuotes([])
    }
  }

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      await axios.delete(`/api/manual-quotes/${quoteId}`)
      toast.success('Cotización eliminada exitosamente')
      fetchHistory()
      setQuoteToDelete(null)
      if (quote.id === quoteId) {
        resetQuote()
      }
    } catch (e) {
      toast.error('Error al eliminar la cotización')
    }
  }

  // Notificación de Salidas Próximas (7 días de anticipación)
  const upcoming7DayDepartures = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    in7Days.setHours(23, 59, 59, 999)

    return historyQuotes.filter(q => {
      if (!q.startDate) return false
      const sDate = new Date(q.startDate + 'T00:00:00')
      if (isNaN(sDate.getTime())) return false
      return sDate >= today && sDate <= in7Days
    })
  }, [historyQuotes])

  // Filtrado de Cotizaciones Maestro
  const filteredHistoryQuotes = useMemo(() => {
    return historyQuotes.filter(q => {
      if (statusFilter !== 'all' && q.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const client = (q.passenger ? `${q.passenger.surname} ${q.passenger.name}` : (q.clientName || '')).toLowerCase()
        const title = (q.title || '').toLowerCase()
        const dest = (q.destination || '').toLowerCase()
        return client.includes(query) || title.includes(query) || dest.includes(query)
      }
      return true
    })
  }, [historyQuotes, statusFilter, searchQuery])

  // Cálculo de KPIs Ejecutivos del Listado
  const listKpis = useMemo(() => {
    let totalSaleSum = 0
    let reservedCount = 0
    let soldCount = 0
    let draftCount = 0
    let pendingCollectionSum = 0

    historyQuotes.forEach(q => {
      let itemsList = q.items || []
      if (typeof itemsList === 'string') {
        try { itemsList = JSON.parse(itemsList) } catch { itemsList = [] }
      }
      let sale = Number(q.soldPriceCollected) || 0
      if (sale === 0 && itemsList.length > 0) {
        itemsList.forEach((it: any) => {
          const eco = calculateItemEconomics(it)
          sale += eco.totalSale
        })
      }
      totalSaleSum += sale

      const totalCollected = (q.payments || []).reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
      if (q.status !== 'lost') {
        pendingCollectionSum += Math.max(0, sale - totalCollected)
      }

      if (q.status === 'reserved') reservedCount++
      else if (q.status === 'sold') soldCount++
      else if (q.status === 'draft') draftCount++
    })

    return { totalSaleSum, reservedCount, soldCount, draftCount, pendingCollectionSum, totalCount: historyQuotes.length }
  }, [historyQuotes])

  const handleCreateNewPassenger = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPaxData.name || !newPaxData.surname) {
      toast.error('Ingresá nombre y apellido del pasajero')
      return
    }
    try {
      const res = await axios.post('/api/passengers', {
        name: newPaxData.name,
        surname: newPaxData.surname,
        passportNumber: newPaxData.document,
        email: newPaxData.email,
        whatsapp: newPaxData.phone
      })
      const created = res.data
      setPassengers(prev => [created, ...prev])
      selectPassenger(created)
      setShowNewPaxModal(false)
      setNewPaxData({ name: '', surname: '', document: '', email: '', phone: '' })
      toast.success(`Pasajero guardado y seleccionado: ${created.name} ${created.surname}`)
    } catch (error) {
      toast.error('Error al crear el pasajero')
    }
  }

  const handleCreateNewOperator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOperatorName.trim()) {
      toast.error('Ingresá el nombre del proveedor')
      return
    }
    try {
      const res = await axios.post('/api/operators', { name: newOperatorName.trim() })
      const created = res.data
      setOperators(prev => [...prev, created])
      if (targetItemForOperator) {
        setQuote(prev => ({
          ...prev,
          items: prev.items.map(it => it.id === targetItemForOperator ? { ...it, providerId: created.id } : it)
        }))
      }
      setShowNewOperatorModal(false)
      setNewOperatorName('')
      setTargetItemForOperator(null)
      toast.success(`Proveedor creado y seleccionado: ${created.name}`)
    } catch (error) {
      toast.error('Error al crear proveedor')
    }
  }

  const handleAddItem = (type: 'flight' | 'hotel' | 'train' | 'transfer' | 'service' | 'assistance') => {
    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
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
        costDividerMode: 'divided_total',
        rooms: [{ id: '1', type: 'Doble Standard', board: 'Desayuno Buffet', paxCount: quote.paxCount || 2, price: 0 }],
        cancellationDate: ''
      } : type === 'train' ? {
        trainOperator: '',
        trainNumber: '',
        bookingCode: '',
        origin: '',
        destination: '',
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        costDividerMode: 'per_passenger',
        classType: 'Primera / Confort',
        seatDetails: ''
      } : type === 'transfer' ? {
        origin: '',
        destination: '',
        isRoundTrip: true,
        date: '',
        time: '',
        costDividerMode: 'divided_total',
        confirmationNumber: ''
      } : {
        description: '',
        costDividerMode: 'per_passenger',
        confirmationNumber: ''
      },
      economics: {
        baseNetCost: 0,
        adjustments: [],
        pricingModel: 'total',
        passengerCount: quote.paxCount || 1,
        commissionType: 'percentage',
        commissionValue: 10,
        totalComisionable: 0,
        comision: 0,
        iva: 0,
        gastosAdm: 0,
        suplementos: 0,
        customExpenses: []
      }
    }
    setQuote(prev => ({ ...prev, items: [...prev.items, newItem] }))
    setExpandedItem(newItem.id)
    toast.success('Servicio agregado al cotizador')
  }

  const getItemDate = (item: Item): string => {
    if (item.type === 'flight') return item.details.segments?.[0]?.departureDate || ''
    if (item.type === 'hotel') return item.details.checkIn || ''
    if (item.type === 'train') return item.details.departureDate || ''
    if (item.type === 'transfer') return item.details.date || ''
    return ''
  }

  const handleSortItemsByDate = () => {
    setQuote(prev => {
      const sorted = [...prev.items].sort((a, b) => {
        const dA = getItemDate(a)
        const dB = getItemDate(b)
        if (!dA) return 1
        if (!dB) return -1
        return dA.localeCompare(dB)
      })
      return { ...prev, items: sorted }
    })
    toast.success('Servicios ordenados por fecha')
  }

  // --- LÍNEAS DE GASTOS ADICIONALES ---
  const addCustomExpense = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId) {
          const currentCustom = it.economics.customExpenses || []
          const newExp: CustomExpense = { id: Math.random().toString(36).substr(2, 5), label: '', amount: 0 }
          return { ...it, economics: { ...it.economics, customExpenses: [...currentCustom, newExp] } }
        }
        return it
      })
    }))
  }

  const updateCustomExpense = (itemId: string, expId: string, key: 'label' | 'amount', value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId) {
          const currentCustom = (it.economics.customExpenses || []).map(x => x.id === expId ? { ...x, [key]: value } : x)
          return { ...it, economics: { ...it.economics, customExpenses: currentCustom } }
        }
        return it
      })
    }))
  }

  const removeCustomExpense = (itemId: string, expId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId) {
          const currentCustom = (it.economics.customExpenses || []).filter(x => x.id !== expId)
          return { ...it, economics: { ...it.economics, customExpenses: currentCustom } }
        }
        return it
      })
    }))
  }

  // --- DRAG & DROP SERVICIOS ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const items = [...quote.items]
    const draggedItem = items[draggedIndex]
    items.splice(draggedIndex, 1)
    items.splice(index, 0, draggedItem)
    setQuote(prev => ({ ...prev, items }))
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    toast.success('Orden de servicios actualizado')
  }

  // --- CÁLCULO DE NOCHES DE ALOJAMIENTO ---
  const calculateNights = (checkIn?: string, checkOut?: string): number => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // --- MÉTODOS DE HABITACIONES DE ALOJAMIENTO ---
  const addHotelRoom = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId) {
          const rooms = it.details.rooms || []
          const newRoom: Room = {
            id: Math.random().toString(36).substr(2, 5),
            type: 'Doble Standard',
            board: 'Desayuno Buffet',
            paxCount: 2,
            price: 0
          }
          return { ...it, details: { ...it.details, rooms: [...rooms, newRoom] } }
        }
        return it
      })
    }))
  }

  const updateHotelRoom = (itemId: string, roomId: string, key: keyof Room, value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId && it.details.rooms) {
          const rooms = it.details.rooms.map(r => r.id === roomId ? { ...r, [key]: value } : r)
          return { ...it, details: { ...it.details, rooms } }
        }
        return it
      })
    }))
  }

  const removeHotelRoom = (itemId: string, roomId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId && it.details.rooms) {
          const rooms = it.details.rooms.filter(r => r.id !== roomId)
          return { ...it, details: { ...it.details, rooms } }
        }
        return it
      })
    }))
  }

  const handleParseFlightTicket = async (itemId: string, file: File) => {
    setIsParsingFlight(itemId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('/api/manual-quotes/parse-flight-ticket', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const parsed = res.data
      if (parsed) {
        setQuote(prev => ({
          ...prev,
          items: prev.items.map(it => {
            if (it.id === itemId) {
              return {
                ...it,
                details: {
                  ...it.details,
                  airline: parsed.airline || it.details.airline,
                  bookingCode: parsed.bookingCode || it.details.bookingCode,
                  type: parsed.type || it.details.type,
                  segments: Array.isArray(parsed.segments) && parsed.segments.length > 0 ? parsed.segments : it.details.segments,
                  baggage: parsed.baggage || it.details.baggage
                }
              }
            }
            return it
          })
        }))
        toast.success('Reserva aérea procesada automáticamente con IA')
      }
    } catch (e) {
      toast.error('Error al analizar la imagen/captura de vuelo')
    } finally {
      setIsParsingFlight(null)
    }
  }

  const handlePasteFromClipboard = async (itemId: string) => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        toast.error('Presioná Ctrl + V para pegar la imagen capturada')
        return
      }
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const file = new File([blob], 'clipboard-flight.png', { type: imageType })
          toast.loading('Analizando imagen pegada del portapapeles...', { id: 'paste-flight' })
          await handleParseFlightTicket(itemId, file)
          toast.dismiss('paste-flight')
          return
        }
      }
      toast.error('No se encontró ninguna imagen en el portapapeles. Hacé una captura (Win+Shift+S) e intentá de nuevo.')
    } catch (err) {
      toast.error('Presioná Ctrl + V sobre la sección del vuelo para pegar la imagen')
    }
  }

  const handleParseServiceVoucher = async (itemId: string, file: File, serviceType: string) => {
    setIsParsingService(itemId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('/api/manual-quotes/parse-service-voucher', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const parsed = res.data
      if (parsed) {
        setQuote(prev => ({
          ...prev,
          items: prev.items.map(it => {
            if (it.id === itemId) {
              const updatedDetails = { ...it.details }
              const updatedEconomics = { ...it.economics }

              const formatInputDate = (dStr?: string) => {
                if (!dStr || typeof dStr !== 'string') return undefined
                const str = dStr.trim()
                if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str

                const numMatch = str.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/)
                if (numMatch) {
                  const d = numMatch[1].padStart(2, '0')
                  const m = numMatch[2].padStart(2, '0')
                  let y = numMatch[3]
                  if (y.length === 2) y = `20${y}`
                  return `${y}-${m}-${d}`
                }

                const months: Record<string, string> = {
                  ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
                  jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12',
                  jan: '01', apr: '04', aug: '08', dec: '12'
                }
                const textMatch = str.match(/(\d{1,2})\s*(?:de\s*)?([a-zA-Z]{3,10})\s*(?:de\s*)?(\d{2,4})/)
                if (textMatch) {
                  const d = textMatch[1].padStart(2, '0')
                  const monthKey = textMatch[2].toLowerCase().slice(0, 3)
                  const m = months[monthKey]
                  let y = textMatch[3]
                  if (y.length === 2) y = `20${y}`
                  if (m) return `${y}-${m}-${d}`
                }
                return undefined
              }

              if (parsed.origin) updatedDetails.origin = parsed.origin
              if (parsed.destination) updatedDetails.destination = parsed.destination

              const conf = parsed.confirmationNumber || parsed.bookingCode
              if (conf) {
                updatedDetails.confirmationNumber = conf
                updatedDetails.bookingCode = conf
              }

              const timeVal = parsed.departureTime || parsed.time
              if (timeVal) {
                updatedDetails.time = timeVal
                updatedDetails.departureTime = timeVal
              }
              if (parsed.arrivalTime) {
                updatedDetails.arrivalTime = parsed.arrivalTime
              }

              const dateVal = formatInputDate(parsed.departureDate || parsed.date || parsed.checkIn)
              if (dateVal) {
                updatedDetails.date = dateVal
                updatedDetails.departureDate = dateVal
                updatedDetails.checkIn = dateVal
              }
              if (parsed.checkOut) {
                updatedDetails.checkOut = formatInputDate(parsed.checkOut)
              }

              if (parsed.trainOperator || parsed.providerName) {
                updatedDetails.trainOperator = parsed.trainOperator || parsed.providerName
              }
              if (parsed.trainNumber || parsed.flightNumber) {
                updatedDetails.trainNumber = parsed.trainNumber || parsed.flightNumber
              }
              if (parsed.classType || parsed.seats) {
                updatedDetails.classType = parsed.classType || parsed.seats
              }

              if (parsed.flightNumber) updatedDetails.flightNumber = parsed.flightNumber
              if (parsed.airline || parsed.providerName) updatedDetails.airline = parsed.airline || parsed.providerName
              if (parsed.hotelName) updatedDetails.hotelName = parsed.hotelName

              // Assistance & Insurance specific fields
              if (parsed.assistanceCompany || (serviceType === 'assistance' && parsed.providerName)) {
                updatedDetails.assistanceCompany = parsed.assistanceCompany || parsed.providerName
              }
              if (parsed.documentNumber) {
                updatedDetails.documentNumber = parsed.documentNumber
              }
              if (parsed.startDate) {
                const sDate = formatInputDate(parsed.startDate)
                if (sDate) {
                  updatedDetails.startDate = sDate
                  updatedDetails.date = sDate
                  updatedDetails.checkIn = sDate
                }
              }
              if (parsed.endDate) {
                const eDate = formatInputDate(parsed.endDate)
                if (eDate) {
                  updatedDetails.endDate = eDate
                  updatedDetails.checkOut = eDate
                }
              }

              // Auto-detect plan type (Daily vs Anual) based on dates or OCR
              if (parsed.planType) {
                updatedDetails.planType = parsed.planType
              } else if (updatedDetails.startDate && updatedDetails.endDate) {
                const start = new Date(updatedDetails.startDate)
                const end = new Date(updatedDetails.endDate)
                const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24))
                updatedDetails.planType = diffDays >= 360 ? 'Anual' : 'Daily'
              }

              if (parsed.productName || parsed.coverageAmount) {
                const pParts = []
                if (parsed.productName) pParts.push(parsed.productName)
                if (parsed.coverageAmount) pParts.push(`Cobertura: ${parsed.coverageAmount}`)
                updatedDetails.description = pParts.join(' - ')
              }

              const notesParts = []
              if (parsed.vehicleDetails) notesParts.push(parsed.vehicleDetails)
              if (Array.isArray(parsed.passengers) && parsed.passengers.length > 0) {
                notesParts.push(`Pasajeros: ${parsed.passengers.join(', ')}`)
              }
              if (parsed.description) notesParts.push(parsed.description)

              if (notesParts.length > 0) {
                const combinedNotes = notesParts.join(' | ')
                if (it.type === 'service' || it.type === 'assistance') {
                  updatedDetails.description = combinedNotes
                }
              }

              if (parsed.price && typeof parsed.price === 'number' && parsed.price > 0) {
                updatedEconomics.baseNetCost = parsed.price
              }

              return {
                ...it,
                details: updatedDetails,
                economics: updatedEconomics
              }
            }
            return it
          })
        }))
        toast.success(`Comprobante de ${serviceType.toUpperCase()} procesado automáticamente con IA`)
      }
    } catch (e) {
      toast.error('Error al analizar la imagen del comprobante')
    } finally {
      setIsParsingService(null)
    }
  }

  const handlePasteVoucherFromClipboard = async (itemId: string, serviceType: string) => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        toast.error('Presioná Ctrl + V para pegar la captura')
        return
      }
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const file = new File([blob], `clipboard-${serviceType}.png`, { type: imageType })
          toast.loading(`Analizando comprobante de ${serviceType.toUpperCase()}...`, { id: 'paste-service' })
          await handleParseServiceVoucher(itemId, file, serviceType)
          toast.dismiss('paste-service')
          return
        }
      }
      toast.error('No se encontró ninguna imagen en el portapapeles. Hacé una captura (Win+Shift+S) e intentá de nuevo.')
    } catch (err) {
      toast.error('Presioná Ctrl + V sobre la sección para pegar la imagen')
    }
  }

  // Listener global para capturar Ctrl+V en CUALQUIER servicio expandido (Aéreos, Traslados, Hoteles, Trenes, etc.)
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (!expandedItem) return
      const targetItem = quote.items.find(it => it.id === expandedItem)
      if (!targetItem) return

      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile()
          if (file) {
            e.preventDefault()
            toast.loading(`Analizando captura para ${targetItem.type.toUpperCase()} con IA...`, { id: 'ctrl-v-paste' })
            if (targetItem.type === 'flight') {
              handleParseFlightTicket(targetItem.id, file).finally(() => toast.dismiss('ctrl-v-paste'))
            } else {
              handleParseServiceVoucher(targetItem.id, file, targetItem.type).finally(() => toast.dismiss('ctrl-v-paste'))
            }
            return
          }
        }
      }
    }

    window.addEventListener('paste', handleGlobalPaste)
    return () => window.removeEventListener('paste', handleGlobalPaste)
  }, [expandedItem, quote.items])

  const addFlightSegment = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId && it.details.segments) {
          const newSeg: Segment = {
            id: Math.random().toString(36).substr(2, 5),
            from: '',
            to: '',
            flightNumber: '',
            departureDate: '',
            departureTime: '',
            arrivalDate: '',
            arrivalTime: '',
            stops: 'Directo'
          }
          return { ...it, details: { ...it.details, segments: [...it.details.segments, newSeg] } }
        }
        return it
      })
    }))
  }

  const removeFlightSegment = (itemId: string, segId: string) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId && it.details.segments) {
          return { ...it, details: { ...it.details, segments: it.details.segments.filter(s => s.id !== segId) } }
        }
        return it
      })
    }))
  }

  const updateFlightSegment = (itemId: string, segId: string, key: string, value: any) => {
    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === itemId && it.details.segments) {
          const segments = it.details.segments.map(s => s.id === segId ? { ...s, [key]: value } : s)
          return { ...it, details: { ...it.details, segments } }
        }
        return it
      })
    }))
  }

  const searchPassengers = async (term: string) => {
    if (!term || term.length < 2) {
      setPassengerResults([])
      setShowPassengerDropdown(false)
      return
    }
    try {
      const res = await axios.get(`/api/passengers/search?q=${term}`)
      setPassengerResults(res.data || [])
      setShowPassengerDropdown(true)
    } catch (e) {
      console.error('Error searching passengers')
    }
  }

  const selectPassenger = (passenger: any) => {
    const fullName = `${passenger.surname}, ${passenger.name}`
    setQuote(prev => ({ 
      ...prev, 
      passengerId: passenger.id, 
      passenger,
      clientName: fullName
    }))
    setPassengerSearch(fullName)
    setShowPassengerDropdown(false)
    toast.success(`Cliente seleccionado: ${passenger.name} ${passenger.surname}`)
  }

  const toggleAdditionalPassenger = (paxId: string) => {
    setQuote(prev => {
      const exists = prev.additionalPassengers.includes(paxId)
      const additionalPassengers = exists
        ? prev.additionalPassengers.filter(id => id !== paxId)
        : [...prev.additionalPassengers, paxId]
      return { ...prev, additionalPassengers }
    })
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

  // --- MOVIMIENTOS COBROS Y PAGOS ---
  const addPayment = (kind: 'payments' | 'providerPayments') => {
    const newP: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      method: 'transfer',
      reference: ''
    }
    // Collapse all previous, expand newly created
    setExpandedPayments(prev => {
      const updated: Record<string, boolean> = {}
      Object.keys(prev).forEach(k => { updated[k] = false })
      updated[newP.id] = true
      return updated
    })
    setQuote(prev => ({ ...prev, [kind]: [...(prev[kind] || []), newP] }))
  }

  const updatePayment = (kind: 'payments' | 'providerPayments', id: string, key: keyof Payment, value: any) => {
    setQuote(prev => ({
      ...prev,
      [kind]: (prev[kind] || []).map(p => p.id === id ? { ...p, [key]: value } : p)
    }))
  }

  const removePayment = (kind: 'payments' | 'providerPayments', id: string) => {
    setQuote(prev => ({
      ...prev,
      [kind]: (prev[kind] || []).filter(p => p.id !== id)
    }))
  }

  const removeItem = (id: string) => {
    setItemToDelete(id)
  }

  const confirmRemoveItem = () => {
    if (!itemToDelete) return
    setQuote(prev => ({ ...prev, items: prev.items.filter(it => it.id !== itemToDelete) }))
    setItemToDelete(null)
    toast.success('Servicio eliminado')
  }

  // --- CÁLCULO FINANCIERO CON VALOR NETO DE PROVEEDOR Y GASTOS ADICIONALES ---
  const calculateItemEconomics = (item: Item) => {
    const { baseNetCost, adjustments, pricingModel, passengerCount, commissionType, commissionValue, totalComisionable, comision, iva, gastosAdm, suplementos, customExpenses } = item.economics
    
    let netoAPagar = 0
    let ganancia = 0
    let totalACobrar = 0
    const sumCustomExpenses = (customExpenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0)

    const isPerPax = pricingModel === 'per_passenger' || item.details.costDividerMode === 'per_passenger'
    const pCount = isPerPax ? Math.max(1, passengerCount || quote.paxCount || 1) : 1

    if (totalComisionable && totalComisionable > 0) {
      const com = Number(comision) || 0
      const iv = Number(iva) || 0
      const gAdm = Number(gastosAdm) || 0
      const sup = Number(suplementos) || 0

      // Neto a Pagar a Proveedor = Total Comisionable - Comisión + IVA + Gastos Adm + Suplementos + Líneas de Gastos Adicionales
      netoAPagar = (Number(totalComisionable) - com + iv + gAdm + sup + sumCustomExpenses) * pCount
      ganancia = Math.max(0, com - gAdm - sumCustomExpenses) * pCount
      totalACobrar = (Number(totalComisionable) + sup) * pCount
    } else {
      let totalCost = baseNetCost + sumCustomExpenses
      let totalProfit = 0

      adjustments.forEach(adj => {
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

    return { 
      totalCost: netoAPagar, 
      totalProfit: ganancia, 
      totalSale: totalACobrar,
      netoAPagar,
      ganancia,
      totalACobrar
    }
  }

  // --- DESGLOSE DE NETO Y PAGADO POR PROVEEDOR ESPECÍFICO ---
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
  }, [quote, operators])

  // --- FILTRAR ÚNICAMENTE LOS PROVEEDORES ASOCIADOS A ESTA COTIZACIÓN ---
  const usedOperators = useMemo(() => {
    const set = new Set<string>()
    quote.items.forEach(it => {
      if (it.providerId) set.add(it.providerId)
    })
    return operators.filter(op => set.has(op.id))
  }, [quote.items, quote.providerPayments, operators])

  // --- LISTA CONSOLIDADA DE TODOS LOS PASAJEROS DE ESTA COTIZACIÓN (TITULAR Y ACOMPAÑANTES) ---
  const allQuotePassengers = useMemo(() => {
    const list: { id: string; name: string; isTitular?: boolean }[] = []
    if (quote.passengerId && quote.passenger) {
      list.push({
        id: quote.passengerId,
        name: `${quote.passenger.surname}, ${quote.passenger.name}`,
        isTitular: true
      })
    } else if (quote.clientName) {
      list.push({
        id: quote.passengerId || 'titular',
        name: quote.clientName,
        isTitular: true
      })
    }

    (quote.additionalPassengers || []).forEach(addId => {
      const found = passengers.find(p => p.id === addId)
      if (found) {
        list.push({
          id: found.id,
          name: `${found.surname}, ${found.name}`
        })
      } else {
        list.push({
          id: addId,
          name: `Pasajero ${addId.substring(0, 6)}`
        })
      }
    })

    return list
  }, [quote.passengerId, quote.passenger, quote.clientName, quote.additionalPassengers, passengers])

  const totals = useMemo(() => {
    let net = 0
    let profit = 0
    let sale = 0

    quote.items.forEach(it => {
      const eco = calculateItemEconomics(it)
      net += eco.totalCost
      profit += eco.totalProfit
      sale += eco.totalSale
    })

    sale += quote.globalAdjustment

    const totalCollected = (quote.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const totalProviderPaid = (quote.providerPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    return { 
      totalNet: net, 
      totalProfit: profit, 
      totalSale: Math.max(0, sale),
      totalCollected,
      pendingCollection: Math.max(0, sale - totalCollected),
      totalProviderPaid,
      pendingProviderPayment: Math.max(0, net - totalProviderPaid)
    }
  }, [quote])

  const openNewArcaInvoiceModal = (mode: 'draft' | 'sandbox') => {
    const totalCollected = (quote.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const targetAmount = totalCollected > 0 ? totalCollected : totals.totalSale

    let calcNoComputable = 0
    let calcExento = 0
    let calcGravado21 = 0
    let calcIva21 = 0
    let calcGravado105 = 0
    let calcIva105 = 0
    let calcOtros = 0

    if (quote.providerPurchaseInvoices && quote.providerPurchaseInvoices.length > 0) {
      // Sum up from loaded mayorista purchase invoices:
      quote.providerPurchaseInvoices.forEach(inv => {
        calcNoComputable += Number(inv.noComputable || 0)
        calcExento += Number(inv.exento || 0)
        calcGravado105 += Number(inv.netGravado105 || 0)
        calcIva105 += Number(inv.iva105 || 0)
        calcOtros += Number(inv.otrosTributos || 0)
      })
      // Margin / Commission is Gravado 21%
      calcGravado21 = Math.max(0, Math.round((targetAmount - (totals.totalNet - calcGravado105 - calcExento - calcNoComputable)) * 100) / 100)
      calcIva21 = Math.round(calcGravado21 * 0.21 * 100) / 100
    } else {
      // Auto-calculate suggested Tourism Tax Breakdown if no purchase invoices loaded yet
      calcNoComputable = Math.round(targetAmount * 0.85 * 100) / 100
      calcExento = Math.round(targetAmount * 0.10 * 100) / 100
      calcGravado21 = Math.round(targetAmount * 0.04 * 100) / 100
      calcIva21 = Math.round(calcGravado21 * 0.21 * 100) / 100
    }

    const calculatedTotal = Math.round((calcNoComputable + calcExento + calcGravado21 + calcIva21 + calcGravado105 + calcIva105 + calcOtros) * 100) / 100

    const paxName = quote.passenger ? `${quote.passenger.surname}, ${quote.passenger.name}` : (quote.clientName || 'Cliente Particular')
    const paxCuit = quote.passenger?.document || ''

    setArcaInvoiceForm({
      mode,
      docType: 'Factura B',
      pointOfSale: 5,
      invoiceNumber: (quote.invoices?.length || 0) + 10773,
      receiverName: paxName,
      receiverCuit: paxCuit,
      receiverIvaCondition: 'Consumidor Final',
      receiverAddress: 'Ciudad Autónoma de Buenos Aires',
      currency: quote.currency === 'ARS' ? 'ARS' : 'USD',
      exchangeRate: 1515,
      netGravado21: calcGravado21,
      iva21: calcIva21,
      netGravado105: calcGravado105,
      iva105: calcIva105,
      exento: calcExento,
      noComputable: calcNoComputable,
      otrosTributos: calcOtros,
      totalAmount: calculatedTotal
    })

    setShowArcaInvoiceModal(true)
  }

  const handleIssueArcaInvoice = (mode: 'draft' | 'sandbox') => {
    const posStr = String(arcaInvoiceForm.pointOfSale).padStart(4, '0')
    const numStr = String(arcaInvoiceForm.invoiceNumber).padStart(8, '0')
    const voucherStr = `${posStr}-${numStr}`

    const newInvoice: ArcaInvoice = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('es-AR'),
      docType: arcaInvoiceForm.docType,
      pointOfSale: Number(arcaInvoiceForm.pointOfSale) || 5,
      invoiceNumber: Number(arcaInvoiceForm.invoiceNumber) || 10773,
      voucherNumberStr: voucherStr,
      receiverName: arcaInvoiceForm.receiverName || 'Cliente Particular',
      receiverCuit: arcaInvoiceForm.receiverCuit || '20-00000000-0',
      receiverIvaCondition: arcaInvoiceForm.receiverIvaCondition,
      receiverAddress: arcaInvoiceForm.receiverAddress,
      currency: arcaInvoiceForm.currency,
      exchangeRate: Number(arcaInvoiceForm.exchangeRate) || 1515,
      netGravado21: Number(arcaInvoiceForm.netGravado21) || 0,
      iva21: Number(arcaInvoiceForm.iva21) || 0,
      netGravado105: Number(arcaInvoiceForm.netGravado105) || 0,
      iva105: Number(arcaInvoiceForm.iva105) || 0,
      exento: Number(arcaInvoiceForm.exento) || 0,
      noComputable: Number(arcaInvoiceForm.noComputable) || 0,
      otrosTributos: Number(arcaInvoiceForm.otrosTributos) || 0,
      totalAmount: Number(arcaInvoiceForm.totalAmount) || 0,
      status: mode === 'draft' ? 'draft' : 'issued_sandbox',
      caeNumber: mode === 'draft' ? undefined : '86251037765586',
      caeExpirationDate: mode === 'draft' ? undefined : '04/07/2026',
      legalLegend: 'CONCEPTO EVT declara explícitamente que actúa únicamente como intermediario entre los viajeros y las entidades que prestan los servicios, habiendo efectuado la presente operación a nombre propio por cuenta y orden del prestador del servicio.'
    }

    setQuote(prev => ({
      ...prev,
      invoices: [...(prev.invoices || []), newInvoice]
    }))

    setShowArcaInvoiceModal(false)
    setSelectedArcaInvoiceForView(newInvoice)

    if (mode === 'draft') {
      toast.success('Pre-factura borrador generada en la reserva (Sin CAE / Sin impacto fiscal)')
    } else {
      toast.success(`Factura electrónica ARCA emitida exitosamente (${voucherStr}) - CAE: 86251037765586`)
    }
  }

  const handleAddProviderPurchaseInvoice = () => {
    if (!purchaseInvoiceForm.invoiceNumber) {
      toast.error('Ingresá el número de factura del mayorista')
      return
    }

    const calcTotal = Number(purchaseInvoiceForm.noComputable || 0) +
      Number(purchaseInvoiceForm.exento || 0) +
      Number(purchaseInvoiceForm.netGravado21 || 0) +
      Number(purchaseInvoiceForm.iva21 || 0) +
      Number(purchaseInvoiceForm.netGravado105 || 0) +
      Number(purchaseInvoiceForm.iva105 || 0) +
      Number(purchaseInvoiceForm.otrosTributos || 0)

    const newPurchaseInvoice: ProviderPurchaseInvoice = {
      ...purchaseInvoiceForm,
      id: Date.now().toString(),
      totalAmount: Math.round(calcTotal * 100) / 100
    }

    setQuote(prev => {
      const updatedList = [...(prev.providerPurchaseInvoices || []), newPurchaseInvoice]
      
      // Auto recalculate ARCA Invoice Form if open:
      let sumNoComp = 0
      let sumExento = 0
      let sumGrav105 = 0
      let sumIva105 = 0
      let sumOtros = 0
      updatedList.forEach(inv => {
        sumNoComp += Number(inv.noComputable || 0)
        sumExento += Number(inv.exento || 0)
        sumGrav105 += Number(inv.netGravado105 || 0)
        sumIva105 += Number(inv.iva105 || 0)
        sumOtros += Number(inv.otrosTributos || 0)
      })

      const targetAmount = (prev.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || totals.totalSale
      const calcGrav21 = Math.max(0, Math.round((targetAmount - (totals.totalNet - sumGrav105 - sumExento - sumNoComp)) * 100) / 100)
      const calcIva21 = Math.round(calcGrav21 * 0.21 * 100) / 100
      const totalArca = Math.round((sumNoComp + sumExento + calcGrav21 + calcIva21 + sumGrav105 + sumIva105 + sumOtros) * 100) / 100

      setArcaInvoiceForm((f: any) => ({
        ...f,
        noComputable: sumNoComp,
        exento: sumExento,
        netGravado21: calcGrav21,
        iva21: calcIva21,
        netGravado105: sumGrav105,
        iva105: sumIva105,
        otrosTributos: sumOtros,
        totalAmount: totalArca
      }))

      return {
        ...prev,
        providerPurchaseInvoices: updatedList
      }
    })

    setShowAddPurchaseInvoiceModal(false)
    toast.success(`Factura de mayorista ${purchaseInvoiceForm.providerName} (${purchaseInvoiceForm.invoiceNumber}) registrada. Discriminación volcada a ARCA.`)
  }

  const handleDuplicateItem = (itemId: string) => {
    setQuote(prev => {
      const idx = prev.items.findIndex(it => it.id === itemId)
      if (idx === -1) return prev
      const original = prev.items[idx]
      const cloned: Item = JSON.parse(JSON.stringify(original))
      cloned.id = Date.now().toString()

      const newItems = [...prev.items]
      newItems.splice(idx + 1, 0, cloned)

      return {
        ...prev,
        items: newItems
      }
    })
    toast.success('Servicio duplicado exitosamente')
  }

  const handleParseHotelText = (itemId: string, text: string) => {
    if (!text) return
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    
    let hotelName = ''
    let confirmationNumber = ''
    let checkIn = ''
    let checkOut = ''
    let roomType = ''
    let board = ''

    const confirmMatch = text.match(/(?:reserva|confirmaci[oó]n|voucher|pnr|ref|booking)[:\s]*([a-zA-Z0-9\--]+)/i)
    if (confirmMatch) confirmationNumber = confirmMatch[1]

    const dateMatches = text.match(/(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/g)
    if (dateMatches && dateMatches.length >= 2) {
      checkIn = dateMatches[0]
      checkOut = dateMatches[1]
    }

    const hotelKeywords = ['hotel', 'resort', 'palace', 'inn', 'suites', 'lodge', 'grand', 'plaza', 'posada', 'hostel', 'apart']
    const foundLine = lines.find(l => hotelKeywords.some(k => l.toLowerCase().includes(k)) && !l.includes('.png') && !l.includes('.jpg') && !l.includes('.pdf') && !l.includes('PNG'))
    if (foundLine) hotelName = foundLine.replace(/^(hotel|resort|alojamiento)[:\s]*/i, '')

    if (text.toLowerCase().includes('all inclusive') || text.toLowerCase().includes('todo incluido')) board = 'All Inclusive'
    else if (text.toLowerCase().includes('media pension') || text.toLowerCase().includes('half board')) board = 'Media Pensión'
    else if (text.toLowerCase().includes('desayuno') || text.toLowerCase().includes('breakfast')) board = 'Desayuno Incluido'

    if (text.toLowerCase().includes('doble')) roomType = 'Doble Standard'
    else if (text.toLowerCase().includes('suite')) roomType = 'Suite'
    else if (text.toLowerCase().includes('single')) roomType = 'Single'

    setQuote(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id !== itemId) return it
        const newDetails = { ...it.details }
        if (hotelName && !hotelName.includes('.png') && !hotelName.includes('PNG')) newDetails.hotelName = hotelName
        if (confirmationNumber) newDetails.confirmationNumber = confirmationNumber
        if (checkIn) newDetails.checkIn = formatToInputDate(checkIn) || checkIn
        if (checkOut) newDetails.checkOut = formatToInputDate(checkOut) || checkOut
        if (roomType || board) {
          newDetails.rooms = [
            {
              id: Date.now().toString(),
              type: roomType || 'Standard',
              board: board || 'Desayuno Incluido',
              paxCount: 2
            }
          ]
        }
        return { ...it, details: newDetails }
      })
    }))

    toast.success('Datos del hotel extraídos y autocompletados')
  }

  const handleParseHotelFile = async (itemId: string, file: File) => {
    if (!file) return
    toast.loading('Analizando voucher / reserva de hotel con IA...', { id: 'hotel-ocr' })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post('/api/manual-quotes/parse-service-voucher', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data) {
        const data = res.data
        setQuote(prev => ({
          ...prev,
          items: prev.items.map(it => {
            if (it.id !== itemId) return it
            const newDetails = { ...it.details }
            const hName = data.destination || data.origin || data.providerName
            if (hName && !hName.includes('.png') && !hName.includes('PNG')) {
              newDetails.hotelName = hName
            }
            if (data.confirmationNumber || data.bookingCode) newDetails.confirmationNumber = data.confirmationNumber || data.bookingCode
            
            const rawCheckIn = data.checkIn || data.date || data.startDate || data.departureDate
            const rawCheckOut = data.checkOut || data.endDate || data.arrivalTime
            const rawCancel = data.cancellationDate || data.deadline

            if (rawCheckIn) newDetails.checkIn = formatToInputDate(rawCheckIn) || rawCheckIn
            if (rawCheckOut) newDetails.checkOut = formatToInputDate(rawCheckOut) || rawCheckOut
            if (rawCancel) newDetails.cancellationDate = formatToInputDate(rawCancel) || rawCancel

            return { ...it, details: newDetails }
          })
        }))
        toast.dismiss('hotel-ocr')
        toast.success('Reserva de hotel procesada con IA exitosamente')
        return
      }
    } catch (err) {
      console.warn('Fallback a extractor local de hotel...', err)
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (file.type.includes('image') || file.type.includes('pdf')) {
        handleParseHotelText(itemId, result || '')
      } else {
        handleParseHotelText(itemId, result || '')
      }
      toast.dismiss('hotel-ocr')
    }
    reader.onerror = () => {
      toast.dismiss('hotel-ocr')
      toast.error('No se pudo leer el archivo de hotel')
    }
    reader.readAsText(file)
  }

  const handlePasteHotelClipboard = async (itemId: string) => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find(t => t.startsWith('image/'))
        if (imageType) {
          const blob = await clipboardItem.getType(imageType)
          const file = new File([blob], 'hotel_screenshot.png', { type: imageType })
          handleParseHotelFile(itemId, file)
          toast.success('Captura de pantalla de hotel procesada')
          return
        }
      }

      const text = await navigator.clipboard.readText()
      if (text) {
        handleParseHotelText(itemId, text)
      } else {
        toast.error('No se encontró imagen ni texto en el portapapeles')
      }
    } catch {
      try {
        const text = await navigator.clipboard.readText()
        if (text) handleParseHotelText(itemId, text)
        else toast.error('Permití el acceso al portapapeles (Ctrl+V)')
      } catch {
        toast.error('No se pudo acceder al portapapeles')
      }
    }
  }

  const handleSaveCRM = async () => {
    if (!quote.passengerId && !quote.title) {
      toast.error('Seleccioná un cliente o ingresá un título para la cotización')
      return
    }
    try {
      if (quote.id) {
        await axios.patch(`/api/manual-quotes/${quote.id}`, quote)
        toast.success('Cotización actualizada en CRM')
      } else {
        const res = await axios.post('/api/manual-quotes', quote)
        setQuote(prev => ({ ...prev, id: res.data.id }))
        toast.success('Cotización guardada exitosamente')
      }
      fetchHistory()
    } catch (e) {
      toast.error('Error al guardar en el CRM')
    }
  }

  const handleStatusChange = (newStatus: QuoteState['status']) => {
    setQuote(prev => ({ ...prev, status: newStatus }))
    toast.success(`Estado actualizado a ${newStatus.toUpperCase()}`)
  }

  const resetQuote = () => {
    localStorage.removeItem('manual_quote_draft')
    setQuote({
      passengerId: '',
      clientName: '',
      title: '',
      destination: '',
      paxCount: 1,
      startDate: '',
      endDate: '',
      additionalPassengers: [],
      currency: 'USD',
      items: [],
      payments: [],
      providerPayments: [],
      globalAdjustment: 0,
      notes: '',
      clientRequestNotes: '',
      status: 'draft'
    })
    setPassengerSearch('')
    setAutoSaveStatus('idle')
    setViewMode('builder')
  }

  const handleLoadQuote = (q: any) => {
    let itemsList = q.items || []
    if (typeof itemsList === 'string') {
      try { itemsList = JSON.parse(itemsList) } catch { itemsList = [] }
    }
    setQuote({
      id: q.id,
      passengerId: q.passengerId || q.passenger?.id || '',
      passenger: q.passenger,
      clientName: q.clientName || (q.passenger ? `${q.passenger.surname}, ${q.passenger.name}` : ''),
      title: q.title || '',
      destination: q.destination || '',
      paxCount: Number(q.paxCount) || 1,
      startDate: q.startDate || '',
      endDate: q.endDate || '',
      additionalPassengers: Array.isArray(q.additionalPassengers) ? q.additionalPassengers : [],
      currency: q.currency || 'USD',
      items: itemsList,
      payments: Array.isArray(q.payments) ? q.payments : [],
      providerPayments: Array.isArray(q.providerPayments) ? q.providerPayments : [],
      globalAdjustment: Number(q.globalAdjustment) || 0,
      notes: q.notes || '',
      clientRequestNotes: q.clientRequestNotes || '',
      status: q.status || 'draft'
    })
    if (q.passenger) {
      setPassengerSearch(`${q.passenger.surname}, ${q.passenger.name}`)
    } else {
      setPassengerSearch(q.clientName || '')
    }
    setViewMode('builder')
    toast.success(`Cotización cargada: ${q.title || 'Cotización'}`)
  }

  const fmtVal = (val: number) => val.toLocaleString('es-AR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      {/* SWITCH DE VISTA: DASHBOARD VS HISTORIAL VS CALENDARIO VS COTIZADOR MAESTRO */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-wrap gap-1">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-white" /> Dashboard Comercial
          </button>

          <button
            onClick={() => setViewMode('list')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" /> Listado Maestro ({historyQuotes.length})
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 relative ${
              viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-orange-500" /> Calendario de Salidas
            {upcoming7DayDepartures.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse absolute top-2 right-2 border-2 border-white" />
            )}
          </button>

          <button
            onClick={() => setViewMode('builder')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'builder' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" /> {quote.id ? 'Editando Cotización' : 'Nueva Cotización'}
          </button>
        </div>
      </div>

      {/* VISTA 0: DASHBOARD COMERCIAL DEDICADO */}
      {viewMode === 'dashboard' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-8">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Dashboard Comercial & Flujo de Ingresos</h2>
                <p className="text-xs text-slate-500 font-medium">Análisis ejecutivo de volumen cotizado, ingresos pendientes y tasa de conversión</p>
              </div>
            </div>
            <button
              onClick={() => setViewMode('builder')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Crear Nueva Cotización
            </button>
          </div>

          {/* DASHBOARD KPIS SUPERIORES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-slate-800 to-indigo-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Total Cotizaciones</p>
                <p className="text-xl font-black mt-0.5">{listKpis.totalCount}</p>
                <p className="text-[10.5px] text-amber-400 font-bold mt-1">USD ${fmtVal(listKpis.totalSaleSum)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  💰 Ingresos Pendientes
                </p>
                <p className="text-xl font-black text-emerald-700 mt-0.5">USD ${fmtVal(listKpis.pendingCollectionSum)}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">Por percibir de clientes</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">🟡 Reservas Confirmadas</p>
                <p className="text-xl font-black text-amber-900 mt-0.5">{listKpis.reservedCount}</p>
                <p className="text-[10px] text-amber-700 font-semibold mt-1">En proceso de seña / pago</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 font-black">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-emerald-100/60 p-4 rounded-2xl border border-emerald-300 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-900">🟢 Viajes Vendidos</p>
                <p className="text-xl font-black text-emerald-800 mt-0.5">{listKpis.soldCount}</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">Operaciones cerradas</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-200/80 flex items-center justify-center text-emerald-800 font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border shadow-2xs flex items-center justify-between transition-all ${
              upcoming7DayDepartures.length > 0 ? 'bg-amber-100/80 border-amber-300' : 'bg-white border-slate-200/80'
            }`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Salidas en 7 Días
                </p>
                <p className="text-xl font-black text-amber-900 mt-0.5">{upcoming7DayDepartures.length}</p>
                <p className="text-[10px] text-amber-700 font-bold mt-1">Reconfirmación requerida</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* TABLA DE INGRESOS PENDIENTES A ENTRAR POR PASAJERO */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Cobros Pendientes a Entrar (Saldos a Percibir por Cliente)
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Total a Entrar: USD ${fmtVal(listKpis.pendingCollectionSum)}</span>
            </div>

            {historyQuotes.filter(q => q.status !== 'lost' && (
              (() => {
                let itemsList = q.items || []
                if (typeof itemsList === 'string') { try { itemsList = JSON.parse(itemsList) } catch { itemsList = [] } }
                let sale = Number(q.soldPriceCollected) || 0
                if (sale === 0 && itemsList.length > 0) itemsList.forEach((it: any) => sale += calculateItemEconomics(it).totalSale)
                const collected = (q.payments || []).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
                return sale - collected > 0
              })()
            )).length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-medium">
                No hay saldos pendientes por cobrar en cotizaciones activas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyQuotes.filter(q => q.status !== 'lost').map(q => {
                  let itemsList = q.items || []
                  if (typeof itemsList === 'string') { try { itemsList = JSON.parse(itemsList) } catch { itemsList = [] } }
                  let sale = Number(q.soldPriceCollected) || 0
                  if (sale === 0 && itemsList.length > 0) itemsList.forEach((it: any) => sale += calculateItemEconomics(it).totalSale)
                  const collected = (q.payments || []).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)
                  const pending = Math.max(0, sale - collected)
                  if (pending <= 0) return null

                  const clientName = q.passenger ? `${q.passenger.surname}, ${q.passenger.name}` : (q.clientName || 'Sin Pasajero')

                  return (
                    <div key={q.id} className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 space-y-3 shadow-2xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase">{clientName}</p>
                          <p className="text-[11px] font-semibold text-slate-600 truncate">{q.title || 'Cotización de Viaje'}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          {q.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-emerald-100 pt-2">
                        <div>
                          <p className="text-[9.5px] font-bold text-slate-400 uppercase">Venta Total</p>
                          <p className="font-bold text-slate-800">${fmtVal(sale)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9.5px] font-bold text-emerald-600 uppercase">Pendiente a Entrar</p>
                          <p className="font-black text-emerald-700 text-sm">+${fmtVal(pending)}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleLoadQuote(q)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          Ver Cotización
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 1: LISTADO MAESTRO DE COTIZACIONES */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Listado Maestro de Cotizaciones</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Control centralizado de itinerarios, reservas y seguimiento comercial</p>
            </div>
            <button
              onClick={resetQuote}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Crear Nueva Cotización
            </button>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS TIPO PÍLDORA CON COLORES */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre de cliente, apellido o destino..."
                className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'Todos', activeCls: 'bg-indigo-600 text-white shadow-2xs font-black' },
                { id: 'draft', label: '⚪ Borradores', activeCls: 'bg-white text-slate-800 border-2 border-slate-400 font-black shadow-xs' },
                { id: 'sent', label: '💛 Enviadas', activeCls: 'bg-amber-100 text-amber-900 border-2 border-amber-400 font-black shadow-xs' },
                { id: 'reserved', label: '🟡 Reservas', activeCls: 'bg-amber-200 text-amber-950 border-2 border-amber-400 font-black shadow-xs' },
                { id: 'sold', label: '🟢 Vendidos', activeCls: 'bg-emerald-200 text-emerald-950 border-2 border-emerald-400 font-black shadow-xs' },
                { id: 'follow_up', label: '🔵 Seguimiento', activeCls: 'bg-blue-200 text-blue-950 border-2 border-blue-400 font-black shadow-xs' },
                { id: 'lost', label: '🔴 Perdidos', activeCls: 'bg-red-200 text-red-950 border-2 border-red-400 font-black shadow-xs' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === f.id
                      ? f.activeCls
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* GRILLA DE TARJETAS (CARDS REDISEÑADAS PREMIUM UX) */}
          {filteredHistoryQuotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHistoryQuotes.map(q => {
                let itemsList: any[] = q.items || []
                if (typeof itemsList === 'string') {
                  try { itemsList = JSON.parse(itemsList) } catch { itemsList = [] }
                }
                let totalSale = Number(q.soldPriceCollected) || 0
                if (totalSale === 0 && itemsList.length > 0) {
                  itemsList.forEach((it: any) => {
                    const eco = calculateItemEconomics(it)
                    totalSale += eco.totalSale
                  })
                }

                const ST_CFG: any = {
                  draft: { label: 'Borrador', cls: 'bg-white text-slate-700 border-slate-300 shadow-2xs font-bold' },
                  sent: { label: 'Cotización Enviada', cls: 'bg-amber-50 text-amber-800 border-amber-200 font-bold' },
                  follow_up: { label: 'Seguimiento', cls: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' },
                  reserved: { label: 'Reserva', cls: 'bg-amber-100 text-amber-900 border-amber-300 font-black' },
                  sold: { label: 'Vendido', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' },
                  lost: { label: 'Perdido', cls: 'bg-red-100 text-red-800 border-red-300 font-bold' }
                }
                const st = ST_CFG[q.status] || ST_CFG.draft
                const clientName = q.passenger ? `${q.passenger.surname}, ${q.passenger.name}` : (q.clientName || 'Sin Pasajero Titular')
                const initials = clientName.split(',').map((n: string) => n.trim()[0]).filter(Boolean).join('').slice(0, 2) || 'CL'

                return (
                  <div 
                    key={q.id} 
                    className="p-5 rounded-3xl border border-slate-200/90 hover:border-orange-300 transition-all hover:shadow-lg bg-white flex flex-col justify-between space-y-4 group relative"
                  >
                    <div>
                      {/* HEADER CON AVATAR Y BADGE */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">
                            {clientName}
                          </span>
                        </div>
                        <span className={`text-[10px] uppercase px-2.5 py-1 rounded-xl border shrink-0 ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>

                      {/* TÍTULO Y DESTINO */}
                      <h3 className="font-black text-slate-900 text-sm group-hover:text-orange-600 transition-colors uppercase tracking-tight leading-snug">
                        {q.title || 'Cotización de Viaje'}
                      </h3>

                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="truncate">{q.destination || 'Sin destino especificado'}</span>
                        </p>
                        {q.startDate && (
                          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{fmtDate(q.startDate)} {q.endDate ? `al ${fmtDate(q.endDate)}` : ''}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* FOOTER CON PRECIO Y ACCIONES */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Cotizado</p>
                        <p className="font-black text-orange-600 text-base leading-tight">{q.currency || 'USD'} ${fmtVal(totalSale)}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const pIdToOpen = q.passengerId || q.passenger?.id
                            if (pIdToOpen) {
                              setSelectedPassengerProfileId(pIdToOpen)
                            } else if (passengers.length > 0) {
                              setSelectedPassengerProfileId(passengers[0].id)
                            } else {
                              toast.error('No hay registro de pasajeros')
                            }
                          }}
                          className="p-2 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 rounded-xl border border-orange-200 transition-all cursor-pointer shadow-xs"
                          title="Ver Ficha Pasajero"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => handleLoadQuote(q)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                          title="Editar Cotización"
                        >
                          Editar
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setQuoteToDelete(q)
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all cursor-pointer"
                          title="Eliminar Cotización"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl p-8">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Sin cotizaciones encontradas</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">No hay resultados que coincidan con la búsqueda o el filtro seleccionado.</p>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: CALENDARIO DE SALIDAS & NOTIFICACIONES A 7 DÍAS */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Calendario de Salidas & Reconfirmaciones</h2>
                <p className="text-xs text-slate-500 font-medium">Control de viajes próximos y reconfirmación de servicios a 7 días de la salida</p>
              </div>
            </div>
          </div>

          {/* BANNER NOTIFICACIÓN DE SALIDAS EN 7 DÍAS */}
          {upcoming7DayDepartures.length > 0 ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                      ⚠️ Alerta de Reconfirmación: {upcoming7DayDepartures.length} Salida(s) en los Próximos 7 Días
                    </h4>
                    <p className="text-xs text-amber-800 font-medium">
                      Revisar emisión de vouchers y reconfirmar servicios de aéreos, hoteles y traslados con los proveedores.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {upcoming7DayDepartures.map(q => {
                  const clientName = q.passenger ? `${q.passenger.surname}, ${q.passenger.name}` : (q.clientName || 'Sin Pasajero')
                  return (
                    <div key={q.id} className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-slate-900 uppercase">{clientName}</span>
                        <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          📅 {fmtDate(q.startDate)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold truncate">📍 {q.destination || 'Por definir'}</p>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleLoadQuote(q)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          Ver Reserva
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>No hay salidas programadas para los próximos 7 días. Todos los itinerarios se encuentran al día.</span>
            </div>
          )}

          {/* CRONOGRAMA DE VIAJES / CALENDARIO LISTING */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Línea de Tiempo de Salidas Programadas</h3>

            {historyQuotes.filter(q => q.startDate).length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Sin fechas de salida asignadas a las cotizaciones aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyQuotes
                  .filter(q => q.startDate)
                  .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
                  .map(q => {
                    const clientName = q.passenger ? `${q.passenger.surname}, ${q.passenger.name}` : (q.clientName || 'Sin Pasajero')
                    const isUpcoming7 = upcoming7DayDepartures.some(u => u.id === q.id)
                    return (
                      <div 
                        key={q.id} 
                        className={`p-4 rounded-2xl border transition-all space-y-3 bg-white ${
                          isUpcoming7 ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20' : 'border-slate-200/80 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-slate-900 uppercase truncate">{clientName}</span>
                          <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            📅 {fmtDate(q.startDate)}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">{q.title || 'Cotización de Viaje'}</p>
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" /> {q.destination || 'Por definir'}
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-xs font-black text-orange-600">{q.currency || 'USD'} ${fmtVal(Number(q.soldPriceCollected) || 0)}</span>
                          <button
                            onClick={() => handleLoadQuote(q)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
                          >
                            Abrir
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 3: FORMULARIO COTIZADOR MAESTRO */}
      {viewMode === 'builder' && (
        <div className="space-y-8">
          {/* HEADER DEL COTIZADOR */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cotizador Maestro</h1>
                <p className="text-xs text-slate-500 font-semibold">Gestión Experta de Viajes e Itinerarios Turísticos</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* AUTOSAVE BADGE */}
              {autoSaveStatus !== 'idle' && (
                <div className="hidden sm:flex items-center">
                  {autoSaveStatus === 'saving' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-black rounded-xl border border-amber-200 shadow-2xs animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" /> Guardando...
                    </span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-200 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Autoguardado
                    </span>
                  )}
                  {autoSaveStatus === 'unsaved' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 text-xs font-bold rounded-xl border border-slate-200/80">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Cambios pendientes
                    </span>
                  )}
                </div>
              )}

              {/* MONEDA SELECTOR */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {(['USD', 'ARS', 'EUR'] as const).map(curr => (
                  <button
                    key={curr}
                    onClick={() => setQuote(prev => ({ ...prev, currency: curr }))}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      quote.currency === curr ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              {/* EXPORT PDF BUTTON */}
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Exportar PDF
              </button>

              {/* CRM SAVE BUTTON */}
              <button
                onClick={handleSaveCRM}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" /> Guardar CRM
              </button>
            </div>
          </div>

          {/* STATUS STEPPER PIPELINE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 mb-4">Estado de la Cotización / Pipeline Comercial</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { id: 'draft', label: '⚪ Borrador', icon: FileText, activeCls: 'bg-white text-slate-800 border-2 border-slate-400 font-black' },
                { id: 'sent', label: '💛 Enviada', icon: Send, activeCls: 'bg-amber-100 text-amber-900 border-2 border-amber-400 font-black' },
                { id: 'follow_up', label: '🔵 Seguimiento', icon: Clock, activeCls: 'bg-blue-200 text-blue-950 border-2 border-blue-400 font-black' },
                { id: 'reserved', label: '🟡 Reserva', icon: ShieldCheck, activeCls: 'bg-amber-200 text-amber-950 border-2 border-amber-400 font-black' },
                { id: 'sold', label: '🟢 Vendido', icon: CheckCircle2, activeCls: 'bg-emerald-200 text-emerald-950 border-2 border-emerald-400 font-black' },
                { id: 'lost', label: '🔴 Perdido', icon: XCircle, activeCls: 'bg-red-200 text-red-950 border-2 border-red-400 font-black' }
              ].map(st => {
                const isActive = quote.status === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isActive ? st.activeCls + ' shadow-md scale-102' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <st.icon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{st.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* SOLICITUD INICIAL DEL CLIENTE / BRIEFING DEL VIAJE */}
          <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-amber-600" /> Solicitud Inicial del Cliente / Briefing del Viaje
              </h3>
              <span className="text-[10px] font-bold text-amber-700">Puntapié inicial para armado del itinerario</span>
            </div>
            <textarea
              value={quote.clientRequestNotes || ''}
              onChange={e => setQuote(prev => ({ ...prev, clientRequestNotes: e.target.value }))}
              placeholder="Volcá aquí el pedido original enviado por el pasajero (Ej: Matrimonio con 2 hijos solicitan paquete de 10 noches a Bariloche en julio con hotel 4 estrellas c/desayuno y excursión al Cerro Catedral)..."
              className="w-full bg-white border border-amber-200 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 transition-all min-h-[70px] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
            
            {/* COLUMNA IZQUIERDA DE FORMULARIOS */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* SECCIÓN 1: INFORMACIÓN DEL CLIENTE & PASAJEROS */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Información del Cliente y Pasajeros</h3>
                      <p className="text-xs text-slate-500 font-medium">Titular de la reserva, acompañantes y fechas del viaje</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewPaxModal(true)}
                      className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> + Nuevo Pasajero
                    </button>
                    {quote.passengerId && (
                      <button
                        type="button"
                        onClick={() => setSelectedPassengerProfileId(quote.passengerId)}
                        className="px-3 py-2 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 font-black text-xs uppercase rounded-xl border border-orange-200 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Ficha Titular
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* SELECTOR / BÚSQUEDA DE TITULAR */}
                  <div className="md:col-span-2 relative">
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Nombre del Pasajero Titular</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        value={passengerSearch}
                        onChange={e => {
                          const val = e.target.value;
                          setPassengerSearch(val);
                          setQuote(prev => ({ ...prev, clientName: val }));
                          searchPassengers(val);
                        }}
                        onFocus={() => passengerResults.length > 0 && setShowPassengerDropdown(true)}
                        placeholder="Buscar cliente por DNI, Nombre o Apellido..."
                        className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                      />

                      {showPassengerDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar space-y-1">
                            {passengerResults.map(p => (
                              <button
                                key={p.id}
                                onClick={() => selectPassenger(p)}
                                className="w-full text-left p-3 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-between cursor-pointer"
                              >
                                <div>
                                  <p className="text-slate-900 font-black text-xs uppercase">{p.surname}, {p.name}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold">PAS/DNI: {p.passportNumber || p.document || 'S/D'}</p>
                                </div>
                                <Plus className="w-4 h-4 text-orange-500" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CANTIDAD DE PASAJEROS */}
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Cant. Pasajeros (Pax)</label>
                    <input
                      type="number"
                      min="1"
                      value={quote.paxCount}
                      onChange={e => setQuote({ ...quote, paxCount: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* DESTINO & FECHAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Destino/s</label>
                    <input
                      value={quote.destination}
                      onChange={e => setQuote({ ...quote, destination: e.target.value })}
                      placeholder="Ej: Madrid & Barcelona"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Fecha de Salida</label>
                    <input
                      type="date"
                      value={quote.startDate}
                      onChange={e => setQuote({ ...quote, startDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Fecha de Regreso</label>
                    <input
                      type="date"
                      value={quote.endDate}
                      onChange={e => setQuote({ ...quote, endDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* ACOMPAÑANTES SELECCIONABLES CON BÚSQUEDA Y ELEGANTES CHIPS */}
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Pasajeros Acompañantes ({quote.additionalPassengers.length})</label>
                  <CompanionSearchableSelect
                    passengers={passengers}
                    selectedIds={quote.additionalPassengers}
                    titularId={quote.passengerId}
                    onToggle={toggleAdditionalPassenger}
                  />
                </div>

              </div>

              {/* BOTONES DE LOS 6 SERVICIOS PRINCIPALES CON ORDENAR POR FECHA */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">Agregar Servicios a la Cotización</p>
                  <button
                    type="button"
                    onClick={handleSortItemsByDate}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] uppercase rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Ordenar servicios cronológicamente según fecha de salida/check-in"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-orange-500" /> Ordenar por Fecha
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { type: 'flight' as const, label: 'AÉREOS', icon: Plane, bg: 'bg-sky-50', text: 'text-sky-600', hover: 'hover:bg-sky-500 hover:text-white', border: 'border-sky-200/70' },
                    { type: 'hotel' as const, label: 'ALOJAMIENTO', icon: Hotel, bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-500 hover:text-white', border: 'border-emerald-200/70' },
                    { type: 'train' as const, label: 'TREN', icon: Train, bg: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:bg-amber-500 hover:text-white', border: 'border-amber-200/70' },
                    { type: 'transfer' as const, label: 'TRASLADOS', icon: MapPin, bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-500 hover:text-white', border: 'border-orange-200/70' },
                    { type: 'assistance' as const, label: 'ASISTENCIA', icon: ShieldCheck, bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-500 hover:text-white', border: 'border-indigo-200/70' },
                    { type: 'service' as const, label: 'OTROS', icon: Plus, bg: 'bg-slate-100', text: 'text-slate-700', hover: 'hover:bg-slate-800 hover:text-white', border: 'border-slate-200' }
                  ].map(btn => (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => handleAddItem(btn.type)}
                      className={`bg-white border ${btn.border} p-3 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs hover:shadow-md hover:-translate-y-0.5`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${btn.bg} ${btn.text} flex items-center justify-center transition-all shadow-2xs`}>
                        <btn.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase text-center">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* LISTADO DE SERVICIOS AGREGADOS (DRAGGABLE & CHRONOLOGICAL BADGES) */}
              <div className="space-y-4">
                {quote.items.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                    <Plane className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-black uppercase text-slate-800">No hay servicios cargados en esta cotización</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Seleccioná Aéreos, Alojamiento, Tren, Traslados o Asistencia para comenzar.</p>
                  </div>
                ) : (
                  quote.items.map((item, index) => {
                    const isExpanded = expandedItem === item.id
                    const eco = calculateItemEconomics(item)
                    const provider = operators.find(op => op.id === item.providerId)
                    const itemDate = getItemDate(item)

                    return (
                      <div 
                        key={item.id} 
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-3xl border transition-all shadow-xs overflow-hidden ${
                          draggedIndex === index ? 'border-orange-500 shadow-xl opacity-80 scale-101' : 'border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        
                        {/* SERVICIO HEADER DRAGGABLE */}
                        <div 
                          onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-all border-b border-slate-100"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-1 shrink-0" title="Arrastrar para reordenar">
                              <GripVertical className="w-5 h-5" />
                            </div>

                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shrink-0">
                              {item.type === 'flight' ? <Plane className="w-5 h-5" /> :
                               item.type === 'hotel' ? <Hotel className="w-5 h-5" /> :
                               item.type === 'train' ? <Train className="w-5 h-5" /> :
                               item.type === 'transfer' ? <MapPin className="w-5 h-5" /> :
                               item.type === 'assistance' ? <ShieldCheck className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-black text-slate-900 uppercase truncate">
                                  {item.type === 'flight' ? (item.details.airline || 'Servicio Aéreo') :
                                   item.type === 'hotel' ? (item.details.hotelName || 'Alojamiento') :
                                   item.type === 'train' ? (item.details.trainOperator ? `Tren ${item.details.trainOperator}` : 'Tren') :
                                   item.type === 'transfer' ? 'Traslado Privado' :
                                   item.type === 'assistance' ? 'Asistencia Médica' : 'Servicio Adicional'}
                                </h4>
                                {itemDate && (
                                  <span className="px-2 py-0.5 bg-orange-50 border border-orange-200 text-orange-700 font-mono font-black text-[10px] rounded-md flex items-center gap-1 shrink-0">
                                    <Calendar className="w-3 h-3" /> {itemDate}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                                Proveedor: <strong className={provider ? 'text-slate-900 font-black' : 'text-amber-600 font-bold'}>{provider ? provider.name : '⚠️ Sin Proveedor Asignado'}</strong> · Ref: <strong className="text-slate-800">{item.details.bookingCode || item.details.confirmationNumber || 'S/D'}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-5 shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-[9.5px] font-bold text-slate-400 uppercase">Neto a Proveedor</p>
                              <p className="text-xs font-black text-slate-900">{quote.currency} ${fmtVal(eco.netoAPagar)}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-[9.5px] font-bold text-slate-400 uppercase">Venta Total</p>
                              <p className="text-sm font-black text-orange-600">{quote.currency} ${fmtVal(eco.totalSale)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateItem(item.id);
                              }}
                              className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all cursor-pointer"
                              title="Duplicar servicio / Copiar ítem"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(item.id);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                              title="Eliminar servicio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* SERVICIO CUERPO EXPANDIDO */}
                        {isExpanded && (
                          <div className="p-6 bg-slate-50/70 border-t border-slate-100 space-y-6">
                            
                            {/* PROVEEDOR/OPERADOR ASOCIADO AL SERVICIO Y MODO DE COSTO */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-end">
                                <div>
                                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">
                                    🏢 Operador / Proveedor del Servicio (Obligatorio)
                                  </label>
                                  <SearchableOperatorSelect
                                    value={item.providerId}
                                    onChange={opId => setQuote(prev => ({
                                      ...prev,
                                      items: prev.items.map(it => it.id === item.id ? { ...it, providerId: opId } : it)
                                    }))}
                                    operators={operators}
                                    onAddNewOperator={() => {
                                      setTargetItemForOperator(item.id)
                                      setShowNewOperatorModal(true)
                                    }}
                                  />
                                </div>

                                <div>
                                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">
                                    📊 Modo de Cálculo / Costo del Servicio
                                  </label>
                                  <select
                                    value={item.details.costDividerMode || 'per_passenger'}
                                    onChange={e => updateItemDetails(item.id, 'costDividerMode', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                  >
                                    <option value="per_passenger">Costo es Por Pasajero (multiplica x total de pax)</option>
                                    <option value="divided_total">Costo Total Fijo / Se divide entre los pax</option>
                                  </select>
                                </div>
                              </div>

                              {/* ASIGNACIÓN DE PASAJEROS / SUBGRUPO AL SERVICIO */}
                              {allQuotePassengers.length > 1 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">
                                      👥 Pasajeros Asignados a este Servicio (Subgrupo / Pareja)
                                    </label>
                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                      {(!item.assignedPassengerIds || item.assignedPassengerIds.length === 0)
                                        ? `Aplica a todo el grupo (${allQuotePassengers.length} PAX)`
                                        : `${item.assignedPassengerIds.length} de ${allQuotePassengers.length} PAX asignados`}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mb-2.5">
                                    Seleccioná qué pasajeros viajan en este aéreo o se alojan en esta habitación.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {allQuotePassengers.map(pax => {
                                      const isAssigned = !item.assignedPassengerIds || item.assignedPassengerIds.length === 0 || item.assignedPassengerIds.includes(pax.id)
                                      return (
                                        <button
                                          key={pax.id}
                                          type="button"
                                          onClick={() => {
                                            setQuote(prev => ({
                                              ...prev,
                                              items: prev.items.map(it => {
                                                if (it.id !== item.id) return it
                                                let current = it.assignedPassengerIds || []
                                                if (current.length === 0) {
                                                  current = allQuotePassengers.map(p => p.id)
                                                }
                                                if (current.includes(pax.id)) {
                                                  current = current.filter(id => id !== pax.id)
                                                } else {
                                                  current = [...current, pax.id]
                                                }
                                                if (current.length === allQuotePassengers.length) current = []
                                                return { ...it, assignedPassengerIds: current }
                                              })
                                            }))
                                          }}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            isAssigned
                                              ? 'bg-indigo-600 text-white shadow-2xs font-black'
                                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                          }`}
                                        >
                                          <span>{isAssigned ? '✓' : '+'}</span>
                                          <span>{pax.name}</span>
                                          {pax.isTitular && <span className="text-[9px] opacity-80">(Titular)</span>}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* AÉREOS FORMULARIO COMPLETO */}
                            {item.type === 'flight' && (
                              <div className="space-y-5">
                                
                                {/* IA OCR SCANNER BANNER WITH PASTE & UPLOAD */}
                                <div 
                                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(item.id); }}
                                  onDragLeave={() => setIsDraggingOver(null)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingOver(null);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                      handleParseFlightTicket(item.id, e.dataTransfer.files[0]);
                                    }
                                  }}
                                  className={`p-4 rounded-2xl text-white shadow-md flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3.5 overflow-hidden transition-all ${
                                    isDraggingOver === item.id 
                                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 ring-4 ring-orange-300 scale-[1.01]' 
                                      : 'bg-gradient-to-r from-sky-500 to-indigo-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs shrink-0">
                                      <Sparkles className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span className="text-xs font-black uppercase tracking-wider text-white">
                                          Lector Automático de Reserva Aérea (OCR)
                                        </span>
                                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-md font-mono tracking-normal font-bold shrink-0">PEGA CON CTRL+V</span>
                                      </div>
                                      <p className="text-[11px] text-sky-100 font-medium leading-tight truncate">
                                        Pegá con <strong>Ctrl + V</strong>, arrastrá la captura o subí el archivo/PDF para auto-completar.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full xl:w-auto">
                                    {/* PASTE FROM CLIPBOARD BUTTON */}
                                    <button
                                      type="button"
                                      onClick={() => handlePasteFromClipboard(item.id)}
                                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                                      title="Pegar captura de pantalla desde el portapapeles (Ctrl + V)"
                                    >
                                      <Clipboard className="w-4 h-4 text-slate-950" /> {isParsingFlight === item.id ? 'Analizando...' : 'Pegar Captura (Ctrl+V)'}
                                    </button>

                                    {/* UPLOAD FILE BUTTON */}
                                    <label className="px-3.5 py-2 bg-white text-sky-900 hover:bg-sky-50 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0">
                                      <Upload className="w-4 h-4" /> {isParsingFlight === item.id ? 'Analizando...' : 'Subir Archivo / PDF'}
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={e => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleParseFlightTicket(item.id, e.target.files[0])
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Aerolínea</label>
                                    <input
                                      value={item.details.airline || ''}
                                      onChange={e => updateItemDetails(item.id, 'airline', e.target.value)}
                                      placeholder="Ej: Iberia / LATAM"
                                      className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Localizador / PNR</label>
                                    <input
                                      value={item.details.bookingCode || ''}
                                      onChange={e => updateItemDetails(item.id, 'bookingCode', e.target.value)}
                                      placeholder="Ej: IB-78492X"
                                      className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Tipo de Ruta</label>
                                    <select
                                      value={item.details.type || 'ROUND_TRIP'}
                                      onChange={e => updateItemDetails(item.id, 'type', e.target.value)}
                                      className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                                    >
                                      <option value="ROUND_TRIP">Ida y Vuelta</option>
                                      <option value="ONE_WAY">Sólo Ida</option>
                                      <option value="MULTI">Multidestino / Conexiones</option>
                                    </select>
                                  </div>
                                </div>

                                {/* TRAMOS DE VUELO */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10.5px] font-black uppercase text-slate-800">Tramos e Itinerario de Vuelos</span>
                                    <button
                                      type="button"
                                      onClick={() => addFlightSegment(item.id)}
                                      className="text-[10.5px] font-black uppercase text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Agregar Tramo / Conexión
                                    </button>
                                  </div>

                                  {(item.details.segments || []).map((seg, idx) => (
                                    <div key={seg.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-500">Tramo #{idx + 1}</span>
                                        {(item.details.segments || []).length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeFlightSegment(item.id, seg.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                          <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Origen (Desde)</label>
                                          <input
                                            value={seg.from}
                                            onChange={e => updateFlightSegment(item.id, seg.id, 'from', e.target.value)}
                                            placeholder="Ej: EZE"
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Destino (Hasta)</label>
                                          <input
                                            value={seg.to}
                                            onChange={e => updateFlightSegment(item.id, seg.id, 'to', e.target.value)}
                                            placeholder="Ej: MAD"
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Nº Vuelo</label>
                                          <input
                                            value={seg.flightNumber || ''}
                                            onChange={e => updateFlightSegment(item.id, seg.id, 'flightNumber', e.target.value)}
                                            placeholder="Ej: IB6844"
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Escalas</label>
                                          <select
                                            value={seg.stops || 'Directo'}
                                            onChange={e => updateFlightSegment(item.id, seg.id, 'stops', e.target.value)}
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                          >
                                            <option value="Directo">Directo</option>
                                            <option value="1 Escala">1 Escala</option>
                                            <option value="2+ Escalas">2+ Escalas</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                          <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Fecha Salida</label>
                                          <input
                                            type="text"
                                            value={seg.departureDate}
                                            onChange={e => updateFlightSegment(item.id, seg.id, 'departureDate', e.target.value)}
                                            placeholder="DD/MM/YYYY"
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Hora Salida</label>
                                          <input
                                            type="text"
                                            value={seg.departureTime}
                                            onChange={e => updateFlightSegment(item.id, seg.id, 'departureTime', e.target.value)}
                                            placeholder="HH:MM"
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Fecha Llegada</label>
                                          <input
                                            type="text"
                                            value={seg.arrivalDate}
                                            onChange={e => updateFlightSegment(item.id, seg.id, 'arrivalDate', e.target.value)}
                                            placeholder="DD/MM/YYYY"
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Hora Llegada</label>
                                          <input
                                            type="text"
                                            value={seg.arrivalTime}
                                            onChange={e => updateFlightSegment(item.id, seg.id, 'arrivalTime', e.target.value)}
                                            placeholder="HH:MM"
                                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* EQUIPAJE */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                                  <span className="text-[10.5px] font-black uppercase text-slate-800">Políticas de Equipaje Incluído</span>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={item.details.baggage?.hasHand ?? true}
                                        onChange={e => updateItemDetails(item.id, 'baggage', { ...item.details.baggage, hasHand: e.target.checked })}
                                      />
                                      <span className="text-xs font-bold text-slate-800">Mochila / Bolso Mano</span>
                                    </label>

                                    <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={item.details.baggage?.hasCarryOn ?? true}
                                        onChange={e => updateItemDetails(item.id, 'baggage', { ...item.details.baggage, hasCarryOn: e.target.checked })}
                                      />
                                      <span className="text-xs font-bold text-slate-800">Carry-on (10kg)</span>
                                    </label>

                                    <label className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={item.details.baggage?.hasChecked ?? true}
                                        onChange={e => updateItemDetails(item.id, 'baggage', { ...item.details.baggage, hasChecked: e.target.checked })}
                                      />
                                      <span className="text-xs font-bold text-slate-800">Equipaje Bodega (23kg)</span>
                                    </label>
                                  </div>
                                </div>

                              </div>
                            )}

                            {/* ALOJAMIENTO FORMULARIO COMPLETO */}
                            {item.type === 'hotel' && (
                              <div className="space-y-5">

                                {/* IA OCR SCANNER BANNER PARA HOTEL WITH PASTE, DRAG & DROP AND FILE UPLOAD */}
                                <div 
                                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(item.id); }}
                                  onDragLeave={() => setIsDraggingOver(null)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingOver(null);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                      handleParseHotelFile(item.id, e.dataTransfer.files[0]);
                                    }
                                  }}
                                  className={`p-4 rounded-2xl text-white shadow-md flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3.5 overflow-hidden transition-all ${
                                    isDraggingOver === item.id 
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 ring-4 ring-emerald-300 scale-[1.01]' 
                                      : 'bg-gradient-to-r from-teal-600 to-emerald-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs shrink-0">
                                      <Sparkles className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span className="text-xs font-black uppercase tracking-wider text-white">
                                          Lector Automático de Reserva de Hotel (IA)
                                        </span>
                                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-md font-mono tracking-normal font-bold shrink-0">PEGA CON CTRL+V</span>
                                      </div>
                                      <p className="text-[11px] text-teal-100 font-medium leading-tight truncate">
                                        Pegá la <strong>captura (Ctrl+V)</strong>, arrastrá el voucher o subí la reserva/PDF para autocompletar.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full xl:w-auto">
                                    <button
                                      type="button"
                                      onClick={() => handlePasteHotelClipboard(item.id)}
                                      className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                                      title="Pegar captura de pantalla o voucher desde el portapapeles (Ctrl + V)"
                                    >
                                      <Clipboard className="w-4 h-4 text-slate-950" /> Pegar Captura (Ctrl+V)
                                    </button>

                                    <label className="px-3.5 py-2 bg-white text-teal-900 hover:bg-teal-50 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0">
                                      <Upload className="w-4 h-4" /> Subir Archivo / PDF
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={e => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleParseHotelFile(item.id, e.target.files[0])
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                {/* DATOS DEL HOTEL Y NOCHES CALCULADAS */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                                    <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                      <Hotel className="w-4.5 h-4.5 text-orange-500" /> Información del Hotel
                                    </span>
                                    {calculateNights(item.details.checkIn, item.details.checkOut) > 0 && (
                                      <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-2xs">
                                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> {calculateNights(item.details.checkIn, item.details.checkOut)} Noche{calculateNights(item.details.checkIn, item.details.checkOut) > 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Nombre del Hotel / Complejo</label>
                                      <input
                                        type="text"
                                        value={item.details.hotelName || ''}
                                        onChange={e => updateItemDetails(item.id, 'hotelName', e.target.value)}
                                        placeholder="Ej: Grand Palladium Costa Mujeres"
                                        className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Nº Confirmación / Voucher</label>
                                      <input
                                        type="text"
                                        value={item.details.confirmationNumber || ''}
                                        onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)}
                                        placeholder="Ej: H-994821"
                                        className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold outline-none text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Límite Cancelación Sin Cargo</label>
                                      <input
                                        type="date"
                                        value={formatToInputDate(item.details.cancellationDate)}
                                        onChange={e => updateItemDetails(item.id, 'cancellationDate', e.target.value)}
                                        className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 items-end">
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Fecha Check-In (Entrada)</label>
                                      <input
                                        type="date"
                                        value={formatToInputDate(item.details.checkIn)}
                                        onChange={e => updateItemDetails(item.id, 'checkIn', e.target.value)}
                                        className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Fecha Check-Out (Salida)</label>
                                      <input
                                        type="date"
                                        value={item.details.checkOut || ''}
                                        onChange={e => updateItemDetails(item.id, 'checkOut', e.target.value)}
                                        className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Estadía Calculada</label>
                                      <div className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-black text-slate-700 flex items-center justify-between h-[42px]">
                                        <span>{calculateNights(item.details.checkIn, item.details.checkOut)} Noche(s)</span>
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* HABITACIONES Y REGÍMENES */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-4 shadow-2xs">
                                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                                    <div>
                                      <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                        <Users className="w-4.5 h-4.5 text-orange-500" /> Distribución de Habitaciones y Régimen
                                      </span>
                                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Definí el tipo de habitación, número de pasajeros y régimen alimenticio.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => addHotelRoom(item.id)}
                                      className="px-3.5 py-2 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 font-black text-xs uppercase rounded-xl border border-orange-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Agregar Habitación
                                    </button>
                                  </div>

                                  <div className="space-y-3.5">
                                    {(item.details.rooms || []).map((rm, idx) => (
                                      <div key={rm.id} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-black uppercase text-slate-700 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
                                            <Hotel className="w-3.5 h-3.5 text-orange-500" /> Habitación #{idx + 1}
                                          </span>
                                          {(item.details.rooms || []).length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => removeHotelRoom(item.id, rm.id)}
                                              className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                              title="Eliminar Habitación"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 items-end">
                                          <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Tipo de Habitación</label>
                                            <input
                                              type="text"
                                              value={rm.type}
                                              onChange={e => updateHotelRoom(item.id, rm.id, 'type', e.target.value)}
                                              placeholder="Ej: Doble Matrimonial / Suite"
                                              className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                            />
                                          </div>

                                          <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Régimen de Comidas</label>
                                            <select
                                              value={rm.board}
                                              onChange={e => updateHotelRoom(item.id, rm.id, 'board', e.target.value)}
                                              className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                            >
                                              <option value="Desayuno Buffet">Desayuno Buffet</option>
                                              <option value="Solo Habitación">Solo Habitación (EP)</option>
                                              <option value="Media Pensión">Media Pensión (MAP)</option>
                                              <option value="Pensión Completa">Pensión Completa (FAP)</option>
                                              <option value="All Inclusive">All Inclusive (Todo Incluido)</option>
                                            </select>
                                          </div>

                                          <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Cant. Pasajeros (Pax)</label>
                                            <NumericInput
                                              value={rm.paxCount}
                                              onChange={val => updateHotelRoom(item.id, rm.id, 'paxCount', val)}
                                              className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                              placeholder="2"
                                            />
                                          </div>

                                          <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate" title="Valor / Tarifa Habitación (Opcional)">Valor Tarifa Hab. (Opcional)</label>
                                            <NumericInput
                                              value={rm.price || 0}
                                              onChange={val => updateHotelRoom(item.id, rm.id, 'price', val)}
                                              className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-black text-emerald-600 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all h-[42px]"
                                              placeholder="0.00"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TREN FORMULARIO COMPLETO */}
                            {item.type === 'train' && (
                              <div className="space-y-5">
                                {/* IA OCR SCANNER BANNER PARA TRENES */}
                                <div 
                                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(item.id); }}
                                  onDragLeave={() => setIsDraggingOver(null)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingOver(null);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                      handleParseServiceVoucher(item.id, e.dataTransfer.files[0], 'train');
                                    }
                                  }}
                                  className={`p-4 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                                    isDraggingOver === item.id 
                                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 ring-4 ring-orange-300 scale-[1.01]' 
                                      : 'bg-gradient-to-r from-amber-500 to-orange-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs shrink-0">
                                      <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                        Lector Automático de Ticket de Tren (OCR)
                                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-md font-mono font-bold">PEGA CON CTRL+V</span>
                                      </p>
                                      <p className="text-[11px] text-amber-100 font-medium">
                                        Pegá con <strong>Ctrl + V</strong>, arrastrá la captura o subí el billete para auto-completar operador, tren, fechas y horario.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                                    <button
                                      type="button"
                                      onClick={() => handlePasteVoucherFromClipboard(item.id, 'train')}
                                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                                      title="Pegar captura desde el portapapeles (Ctrl + V)"
                                    >
                                      <Clipboard className="w-4 h-4 text-amber-400" /> {isParsingService === item.id ? 'Analizando...' : '📋 Pegar Captura (Ctrl+V)'}
                                    </button>

                                    <label className="px-3.5 py-2 bg-white text-orange-900 hover:bg-orange-50 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0">
                                      <Upload className="w-4 h-4" /> {isParsingService === item.id ? 'Analizando...' : 'Subir Archivo'}
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={e => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleParseServiceVoucher(item.id, e.target.files[0], 'train')
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                      <Train className="w-4.5 h-4.5 text-orange-500" /> Detalles del Servicio de Tren
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Operador / Empresa</label>
                                      <input
                                        type="text"
                                        value={item.details.trainOperator || ''}
                                        onChange={e => updateItemDetails(item.id, 'trainOperator', e.target.value)}
                                        placeholder="Ej: Renfe / Eurostar"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Nº Tren</label>
                                      <input
                                        type="text"
                                        value={item.details.trainNumber || ''}
                                        onChange={e => updateItemDetails(item.id, 'trainNumber', e.target.value)}
                                        placeholder="Ej: AVE 0314"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Código Reserva / Ticket</label>
                                      <input
                                        type="text"
                                        value={item.details.bookingCode || ''}
                                        onChange={e => updateItemDetails(item.id, 'bookingCode', e.target.value)}
                                        placeholder="Ej: REN-7749"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Clase / Asiento</label>
                                      <input
                                        type="text"
                                        value={item.details.classType || ''}
                                        onChange={e => updateItemDetails(item.id, 'classType', e.target.value)}
                                        placeholder="Ej: Preferente - Coche 4 As. 12"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-100 items-end">
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Origen</label>
                                      <input
                                        type="text"
                                        value={item.details.origin || ''}
                                        onChange={e => updateItemDetails(item.id, 'origin', e.target.value)}
                                        placeholder="Ej: Madrid Atocha"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Destino</label>
                                      <input
                                        type="text"
                                        value={item.details.destination || ''}
                                        onChange={e => updateItemDetails(item.id, 'destination', e.target.value)}
                                        placeholder="Ej: Barcelona Sants"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Fecha Salida</label>
                                      <input
                                        type="date"
                                        value={item.details.departureDate || ''}
                                        onChange={e => updateItemDetails(item.id, 'departureDate', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Hora Salida</label>
                                      <input
                                        type="text"
                                        value={item.details.departureTime || ''}
                                        onChange={e => updateItemDetails(item.id, 'departureTime', e.target.value)}
                                        placeholder="Ej: 09:30"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Hora Llegada</label>
                                      <input
                                        type="text"
                                        value={item.details.arrivalTime || ''}
                                        onChange={e => updateItemDetails(item.id, 'arrivalTime', e.target.value)}
                                        placeholder="Ej: 15:49"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TRASLADO FORMULARIO COMPLETO */}
                            {item.type === 'transfer' && (
                              <div className="space-y-4">
                                {/* IA OCR SCANNER BANNER PARA TRASLADOS */}
                                <div 
                                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(item.id); }}
                                  onDragLeave={() => setIsDraggingOver(null)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingOver(null);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                      handleParseServiceVoucher(item.id, e.dataTransfer.files[0], 'transfer');
                                    }
                                  }}
                                  className={`p-4 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                                    isDraggingOver === item.id 
                                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 ring-4 ring-orange-300 scale-[1.01]' 
                                      : 'bg-gradient-to-r from-orange-500 to-amber-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs shrink-0">
                                      <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                        Lector Automático de Voucher de Traslado (OCR)
                                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-md font-mono font-bold">PEGA CON CTRL+V</span>
                                      </p>
                                      <p className="text-[11px] text-amber-100 font-medium">
                                        Pegá con <strong>Ctrl + V</strong>, arrastrá la captura o subí el comprobante para auto-completar datos y costo.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                                    <button
                                      type="button"
                                      onClick={() => handlePasteVoucherFromClipboard(item.id, 'transfer')}
                                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                                      title="Pegar captura de voucher desde el portapapeles (Ctrl + V)"
                                    >
                                      <Clipboard className="w-4 h-4 text-amber-400" /> {isParsingService === item.id ? 'Analizando...' : '📋 Pegar Captura (Ctrl+V)'}
                                    </button>

                                    <label className="px-3.5 py-2 bg-white text-orange-900 hover:bg-orange-50 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0">
                                      <Upload className="w-4 h-4" /> {isParsingService === item.id ? 'Analizando...' : 'Subir Archivo'}
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={e => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleParseServiceVoucher(item.id, e.target.files[0], 'transfer')
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                      <MapPin className="w-4.5 h-4.5 text-orange-500" /> Detalles del Traslado
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 truncate">Origen (Punto de Salida)</label>
                                      <input
                                        type="text"
                                        value={item.details.origin || ''}
                                        onChange={e => updateItemDetails(item.id, 'origin', e.target.value)}
                                        placeholder="Ej: Barajas, Madrid (MAD-Barajas)"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 truncate">Destino (Llegada)</label>
                                      <input
                                        type="text"
                                        value={item.details.destination || ''}
                                        onChange={e => updateItemDetails(item.id, 'destination', e.target.value)}
                                        placeholder="Ej: Petit Palace Preciados"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 truncate">Fecha del Servicio</label>
                                      <input
                                        type="date"
                                        value={item.details.date || ''}
                                        onChange={e => updateItemDetails(item.id, 'date', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 truncate">Horario Pickup / Llegada</label>
                                      <input
                                        type="text"
                                        value={item.details.time || ''}
                                        onChange={e => updateItemDetails(item.id, 'time', e.target.value)}
                                        placeholder="Ej: 17:10"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 truncate">Nº Vuelo / Tren de Llegada</label>
                                      <input
                                        type="text"
                                        value={item.details.flightNumber || ''}
                                        onChange={e => updateItemDetails(item.id, 'flightNumber', e.target.value)}
                                        placeholder="Ej: 1132 - Aerolineas Argentinas"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 truncate">Nº Confirmación / Localizador</label>
                                      <input
                                        type="text"
                                        value={item.details.confirmationNumber || ''}
                                        onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)}
                                        placeholder="Ej: 3075761"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div className="sm:col-span-1 md:col-span-2">
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1.5 truncate">Vehículo / Pasajeros / Notas</label>
                                      <input
                                        type="text"
                                        value={item.details.description || ''}
                                        onChange={e => updateItemDetails(item.id, 'description', e.target.value)}
                                        placeholder="Ej: Comfort Car | Pasajeros: Luciana Cecilia Abadie, Esmeralda Abadie"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ASISTENCIA MÉDICA Y SERVICIOS ADICIONALES FORMULARIO COMPLETO */}
                            {(item.type === 'assistance' || item.type === 'service') && (
                              <div className="space-y-5">
                                {/* IA OCR SCANNER BANNER PARA ASISTENCIA MÉDICA */}
                                <div 
                                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(item.id); }}
                                  onDragLeave={() => setIsDraggingOver(null)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingOver(null);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                      handleParseServiceVoucher(item.id, e.dataTransfer.files[0], 'assistance');
                                    }
                                  }}
                                  className={`p-4 rounded-2xl text-white shadow-md flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3.5 overflow-hidden transition-all ${
                                    isDraggingOver === item.id 
                                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 ring-4 ring-orange-300 scale-[1.01]' 
                                      : 'bg-gradient-to-r from-emerald-600 to-teal-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs shrink-0">
                                      <Sparkles className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <span className="text-xs font-black uppercase tracking-wider text-white">
                                          Lector Automático de Asistencia Médica (OCR)
                                        </span>
                                        <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-md font-mono font-bold shrink-0">PEGA CON CTRL+V</span>
                                      </div>
                                      <p className="text-[11px] text-emerald-100 font-medium leading-tight truncate">
                                        Pegá con <strong>Ctrl + V</strong>, arrastrá la captura o subí el voucher (Assist Card, Universal, etc.) para auto-completar.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full xl:w-auto">
                                    <button
                                      type="button"
                                      onClick={() => handlePasteVoucherFromClipboard(item.id, 'assistance')}
                                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                                      title="Pegar captura de voucher desde el portapapeles (Ctrl + V)"
                                    >
                                      <Clipboard className="w-4 h-4 text-emerald-400" /> {isParsingService === item.id ? 'Analizando...' : 'Pegar Captura (Ctrl+V)'}
                                    </button>

                                    <label className="px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0">
                                      <Upload className="w-4 h-4" /> {isParsingService === item.id ? 'Analizando...' : 'Subir Archivo'}
                                      <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={e => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleParseServiceVoucher(item.id, e.target.files[0], 'assistance')
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Descripción y Cobertura del Servicio
                                    </span>
                                    {(item.details.startDate || item.details.date) && (item.details.endDate || item.details.checkOut) && (
                                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-2xs">
                                        <Clock className="w-3.5 h-3.5 text-emerald-500" /> {calculateNights(item.details.startDate || item.details.date, item.details.endDate || item.details.checkOut)} Días de Cobertura
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Empresa / Compañía</label>
                                      <input
                                        type="text"
                                        value={item.details.assistanceCompany || ''}
                                        onChange={e => updateItemDetails(item.id, 'assistanceCompany', e.target.value)}
                                        placeholder="Ej: Assist Card / Universal Assistance"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Nº Póliza / Voucher / Nº Assist Card</label>
                                      <input
                                        type="text"
                                        value={item.details.confirmationNumber || ''}
                                        onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)}
                                        placeholder="Ej: 540 25243905 05O RIC45"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Producto / Cobertura</label>
                                      <input
                                        type="text"
                                        value={item.details.description || ''}
                                        onChange={e => updateItemDetails(item.id, 'description', e.target.value)}
                                        placeholder="Ej: AC 100 - Cobertura USD 100.000"
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Modalidad / Tipo de Plan</label>
                                      <select
                                        value={
                                          item.details.planType ||
                                          (item.details.startDate && item.details.endDate && Math.round((new Date(item.details.endDate).getTime() - new Date(item.details.startDate).getTime()) / (1000 * 3600 * 24)) >= 360 ? 'Anual' : 'Daily')
                                        }
                                        onChange={e => updateItemDetails(item.id, 'planType', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      >
                                        <option value="Daily">Daily (Por Días / Viaje)</option>
                                        <option value="Anual">Anual (Multiviaje / 365 Días)</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 items-end">
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Vigencia Desde (Inicio)</label>
                                      <input
                                        type="date"
                                        value={item.details.startDate || item.details.date || ''}
                                        onChange={e => {
                                          updateItemDetails(item.id, 'startDate', e.target.value)
                                          updateItemDetails(item.id, 'date', e.target.value)
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Vigencia Hasta (Fin)</label>
                                      <input
                                        type="date"
                                        value={item.details.endDate || item.details.checkOut || ''}
                                        onChange={e => {
                                          updateItemDetails(item.id, 'endDate', e.target.value)
                                          updateItemDetails(item.id, 'checkOut', e.target.value)
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Días de Cobertura Calculados</label>
                                      <div className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-black text-slate-700 flex items-center justify-between h-[42px]">
                                        <span>{calculateNights(item.details.startDate || item.details.date, item.details.endDate || item.details.checkOut)} Días</span>
                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* PLANTILLA DETALLE DE RESERVA DE LA AGENCIA Y LÍNEAS DE GASTOS ADICIONALES */}
                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 space-y-5 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                    <Receipt className="w-4.5 h-4.5 text-orange-500" /> Detalle de Reserva y Neto a Proveedor
                                  </h4>
                                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">El Valor Neto a Pagar es el importe exacto a liquidar a {provider ? provider.name : 'este proveedor'}.</p>
                                </div>
                                <span className="px-2.5 py-1 bg-orange-50 text-orange-600 font-black text-[10px] uppercase rounded-md border border-orange-200/60">Calculadora Directa</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                <div>
                                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Total Comisionable</label>
                                  <NumericInput
                                    value={item.economics.totalComisionable || 0}
                                    onChange={val => updateItemEconomics(item.id, 'totalComisionable', val)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                    placeholder="216.65"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Comisión</label>
                                  <NumericInput
                                    value={item.economics.comision || 0}
                                    onChange={val => updateItemEconomics(item.id, 'comision', val)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-black text-emerald-600 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                    placeholder="28.16"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">IVA</label>
                                  <NumericInput
                                    value={item.economics.iva || 0}
                                    onChange={val => updateItemEconomics(item.id, 'iva', val)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                    placeholder="2.67"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Gastos Adm.</label>
                                  <NumericInput
                                    value={item.economics.gastosAdm || 0}
                                    onChange={val => updateItemEconomics(item.id, 'gastosAdm', val)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                    placeholder="1.89"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block h-7 flex items-end mb-1.5 truncate">Suplementos</label>
                                  <NumericInput
                                    value={item.economics.suplementos || 0}
                                    onChange={val => updateItemEconomics(item.id, 'suplementos', val)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all h-[42px]"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>

                              {/* LÍNEAS DE GASTOS ADICIONALES (DYNAMIC EXPENSE LINES) */}
                              <div className="space-y-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-black uppercase text-slate-800 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-orange-500" /> Líneas de Gastos Adicionales / Tasas / Fees
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addCustomExpense(item.id)}
                                    className="px-3 py-1 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 font-black text-[10.5px] uppercase rounded-xl border border-orange-200 transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Agregar Línea de Gasto
                                  </button>
                                </div>

                                {(item.economics.customExpenses || []).length === 0 ? (
                                  <p className="text-[11px] text-slate-400 italic font-medium">Sin líneas de gastos adicionales.</p>
                                ) : (
                                  (item.economics.customExpenses || []).map(exp => (
                                    <div key={exp.id} className="flex gap-3 items-center">
                                      <input
                                        value={exp.label || ''}
                                        onChange={e => updateCustomExpense(item.id, exp.id, 'label', e.target.value)}
                                        placeholder="Concepto (Ej: Fee GDS / Tasa de Aeropuerto / Impuesto PAIS)"
                                        className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                      />
                                      <div className="w-36">
                                        <NumericInput
                                          value={exp.amount || 0}
                                          onChange={val => updateCustomExpense(item.id, exp.id, 'amount', val)}
                                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-black text-slate-900 outline-none"
                                          placeholder="Monto Gasto"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeCustomExpense(item.id, exp.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* RESULTADOS CALCULADOS */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                                <div className="p-3 bg-slate-900 text-white rounded-xl text-center shadow-xs">
                                  <p className="text-[9.5px] font-black uppercase text-slate-400">Neto a Pagar a {provider ? provider.name : 'Proveedor'}</p>
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

                          </div>
                        )}

                      </div>
                    )
                  })
                )}
              </div>

            </div>

            {/* SIDEBAR DERECHA RESUMEN FINANCIERO TOTAL STICKY */}
            <div className="lg:col-span-4 z-20">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg sticky top-8 space-y-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-orange-500" /> Resumen Financiero Total
                </h3>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Costo Neto Total a Proveedores</p>
                    <p className="text-lg font-black text-slate-900">{quote.currency} ${fmtVal(totals.totalNet)}</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Ganancia Bruta Estimada</p>
                    <p className="text-lg font-black text-emerald-700">+{quote.currency} ${fmtVal(totals.totalProfit)}</p>
                  </div>

                  <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-5 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                    <p className="text-[10px] font-black uppercase text-orange-100">Total Final a Percibir</p>
                    <p className="text-2xl font-black">{quote.currency} ${fmtVal(totals.totalSale)}</p>
                  </div>

                  {/* COBROS Y SALDOS PENDIENTES SUMMARY */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Cobrado Pasajeros:</span>
                      <span className="text-emerald-600 font-black">{quote.currency} ${fmtVal(totals.totalCollected)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Pagado Proveedores:</span>
                      <span className="text-sky-600 font-black">{quote.currency} ${fmtVal(totals.totalProviderPaid)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCRM}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Guardar Cotización en CRM
                </button>
              </div>
            </div>

          </div>

          {/* SECCIÓN REGISTRO EXPERTO UX DE COBROS Y PAGOS A PROVEEDORES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Gestión Financiera de Cobros y Pagos</h3>
                <p className="text-xs text-slate-500 font-medium">Control en tiempo real de ingresos recibidos de pasajeros y egresos por proveedor</p>
              </div>
            </div>

            {/* DESGLOSE EN TIEMPO REAL DE SALDOS NETOS POR PROVEEDOR */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" /> Desglose de Saldos Netos por Proveedor
              </h4>
              {usedOperators.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium italic py-2">
                  No hay proveedores asignados a los servicios de esta cotización aún. Asigná un proveedor en las tarjetas de servicio arriba.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {usedOperators.map(op => {
                    const pItem = providerSummaryMap[op.id] || { name: op.name, totalNet: 0, totalPaid: 0 }
                    const pending = Math.max(0, pItem.totalNet - pItem.totalPaid)
                    return (
                      <div key={op.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <p className="text-xs font-black text-slate-900 uppercase truncate">🏢 {op.name}</p>
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Neto: ${fmtVal(pItem.totalNet)}</span>
                          <span className="text-sky-600">Pagado: ${fmtVal(pItem.totalPaid)}</span>
                        </div>
                        <p className="text-[11px] font-black text-amber-600 text-right">
                          Pendiente: ${fmtVal(pending)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* COBROS A PASAJEROS LEDGER */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Cobros a Pasajeros (Ingresos)
                    </h4>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                      Cobrado: <strong className="text-emerald-600">${fmtVal(totals.totalCollected)}</strong> · Pendiente: <strong className="text-orange-600">${fmtVal(totals.pendingCollection)}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addPayment('payments')}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white font-black text-xs uppercase rounded-xl shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nuevo Cobro
                  </button>
                </div>

                {/* BARRA DE PROGRESO DE COBRO */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${totals.totalSale > 0 ? Math.min(100, (totals.totalCollected / totals.totalSale) * 100) : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9.5px] font-bold text-slate-500 uppercase">
                    <span>{totals.totalSale > 0 ? Math.round((totals.totalCollected / totals.totalSale) * 100) : 0}% COBRADO</span>
                    <span>VENTA TOTAL: {quote.currency} ${fmtVal(totals.totalSale)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(quote.payments || []).length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium py-4 italic text-center bg-white rounded-xl border border-slate-200">Sin cobros registrados aún.</p>
                  ) : (
                    (quote.payments || []).map(p => {
                      const isExp = !!expandedPayments[p.id]
                      return (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
                          {/* BARRA RESUMEN COLAPSADA */}
                          <div 
                            onClick={() => togglePaymentExpanded(p.id)}
                            className="p-3.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0">
                                <DollarSign className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {fmtDate(p.date)}
                                </span>
                                <span className="text-slate-500 font-medium">
                                  💳 {p.method === 'transfer' ? 'Transferencia' : p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : 'Mercado Pago'}
                                </span>
                                {p.reference && (
                                  <span className="font-mono text-[11px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                                    Ref: {p.reference}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-sm font-black text-emerald-600">
                                +${fmtVal(p.amount)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removePayment('payments', p.id)
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Eliminar cobro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExp ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {/* DETALLE EXPANDIBLE */}
                          {isExp && (
                            <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Fecha Cobro</label>
                                  <input
                                    type="date"
                                    value={p.date}
                                    onChange={e => updatePayment('payments', p.id, 'date', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Monto Cobrado</label>
                                  <input
                                    type="number"
                                    value={p.amount || ''}
                                    onChange={e => updatePayment('payments', p.id, 'amount', parseFloat(e.target.value) || 0)}
                                    placeholder="Ej: 500"
                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-black text-emerald-600"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                <div>
                                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Imputar a Pasajero / Pareja</label>
                                  <select
                                    value={p.passengerId || ''}
                                    onChange={e => updatePayment('payments', p.id, 'passengerId', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                                  >
                                    <option value="">Todo el Grupo (Consolidado)</option>
                                    {allQuotePassengers.map(pax => (
                                      <option key={pax.id} value={pax.id}>
                                        👤 {pax.name} {pax.isTitular ? '(Titular)' : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Método de Pago</label>
                                  <select
                                    value={p.method || 'transfer'}
                                    onChange={e => updatePayment('payments', p.id, 'method', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                                  >
                                    <option value="transfer">Transferencia Bancaria</option>
                                    <option value="cash">Efectivo</option>
                                    <option value="card">Tarjeta de Crédito/Débito</option>
                                    <option value="mercadopago">Mercado Pago</option>
                                  </select>
                                </div>

                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">N° Comprobante / Ref</label>
                                    <input
                                      value={p.reference || ''}
                                      onChange={e => updatePayment('payments', p.id, 'reference', e.target.value)}
                                      placeholder="Ej: TRANSF-9921"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* PAGOS A PROVEEDORES LEDGER CON AUTO-SUGERENCIA Y FORMA DE PAGO */}
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
                  <button
                    type="button"
                    onClick={() => addPayment('providerPayments')}
                    className="px-3.5 py-1.5 bg-sky-600 text-white font-black text-xs uppercase rounded-xl shadow-xs hover:bg-sky-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nuevo Pago
                  </button>
                </div>

                {/* BARRA DE PROGRESO DE PAGOS PROVEEDORES */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-sky-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${totals.totalNet > 0 ? Math.min(100, (totals.totalProviderPaid / totals.totalNet) * 100) : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9.5px] font-bold text-slate-500 uppercase">
                    <span>{totals.totalNet > 0 ? Math.round((totals.totalProviderPaid / totals.totalNet) * 100) : 0}% PAGADO</span>
                    <span>NETO PROVEEDORES: {quote.currency} ${fmtVal(totals.totalNet)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {(quote.providerPayments || []).length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium py-4 italic text-center bg-white rounded-xl border border-slate-200">Sin pagos a proveedores registrados.</p>
                  ) : (
                    (quote.providerPayments || []).map(p => {
                      const isExp = !!expandedPayments[p.id]
                      const pProvider = operators.find(o => o.id === p.providerId)
                      return (
                        <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all">
                          {/* BARRA RESUMEN COLAPSADA */}
                          <div 
                            onClick={() => togglePaymentExpanded(p.id)}
                            className="p-3.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-black text-xs shrink-0">
                                <Building2 className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {fmtDate(p.date)}
                                </span>
                                <span className="font-bold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">
                                  🏢 {pProvider ? pProvider.name : 'Proveedor no asignado'}
                                </span>
                                <span className="text-slate-500 font-medium">
                                  💳 {p.method === 'transfer' ? 'Transferencia' : p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : p.method === 'mercadopago' ? 'Mercado Pago' : 'Cta Cte'}
                                </span>
                                {p.reference && (
                                  <span className="font-mono text-[11px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                                    Ref: {p.reference}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-sm font-black text-sky-600">
                                ${fmtVal(p.amount)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removePayment('providerPayments', p.id)
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Eliminar pago"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExp ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {/* DETALLE EXPANDIBLE */}
                          {isExp && (
                            <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Fecha Pago</label>
                                  <input
                                    type="date"
                                    value={p.date}
                                    onChange={e => updatePayment('providerPayments', p.id, 'date', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Monto Pagado al Proveedor</label>
                                  <input
                                    type="number"
                                    value={p.amount || ''}
                                    onChange={e => updatePayment('providerPayments', p.id, 'amount', parseFloat(e.target.value) || 0)}
                                    placeholder="Ej: 300"
                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-black text-sky-600"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                                <div>
                                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Proveedor Destino</label>
                                  <select
                                    value={p.providerId || ''}
                                    onChange={e => {
                                      const newOpId = e.target.value
                                      updatePayment('providerPayments', p.id, 'providerId', newOpId)
                                      if (newOpId && p.amount === 0 && providerSummaryMap[newOpId]) {
                                        const pendingForOp = Math.max(0, providerSummaryMap[newOpId].totalNet - providerSummaryMap[newOpId].totalPaid)
                                        if (pendingForOp > 0) {
                                          updatePayment('providerPayments', p.id, 'amount', pendingForOp)
                                        }
                                      }
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800"
                                  >
                                    {usedOperators.length === 0 ? (
                                      <option value="">-- Asigná proveedores a los servicios primero --</option>
                                    ) : (
                                      <>
                                        <option value="">Seleccionar proveedor del viaje...</option>
                                        {usedOperators.map(op => {
                                          const opSummary = providerSummaryMap[op.id]
                                          const opNet = opSummary ? opSummary.totalNet : 0
                                          const pending = opSummary ? Math.max(0, opSummary.totalNet - opSummary.totalPaid) : 0
                                          return (
                                            <option key={op.id} value={op.id}>
                                              🏢 {op.name} (Neto: ${fmtVal(opNet)} - Pendiente: ${fmtVal(pending)})
                                            </option>
                                          )
                                        })}
                                      </>
                                    )}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Forma de Pago al Proveedor</label>
                                  <select
                                    value={p.method || 'transfer'}
                                    onChange={e => updatePayment('providerPayments', p.id, 'method', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                                  >
                                    <option value="transfer">Transferencia Bancaria</option>
                                    <option value="cash">Efectivo</option>
                                    <option value="card">Tarjeta de Crédito Corporativa</option>
                                    <option value="mercadopago">Mercado Pago</option>
                                    <option value="account">Cuenta Corriente / Crédito</option>
                                  </select>
                                </div>

                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">N° Comprobante / Ref</label>
                                    <input
                                      value={p.reference || ''}
                                      onChange={e => updatePayment('providerPayments', p.id, 'reference', e.target.value)}
                                      placeholder="Ej: OP-8812"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* BLOQUE DE FACTURACIÓN ARCA (PASAJERO) & PROVEEDORES */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 mt-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" /> Facturación Electrónica ARCA (Pasajero)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Emisión de comprobantes A/B/C con la discriminación reglamentaria de Turismo Argentina</p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => openNewArcaInvoiceModal('draft')}
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-wider rounded-xl border border-indigo-200 cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <Eye className="w-4 h-4" /> 🔎 Generar Vista Previa (Borrador)
                </button>

                <button
                  type="button"
                  onClick={() => openNewArcaInvoiceModal('sandbox')}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> ⚡ Emitir Factura ARCA (Prueba Sandbox)
                </button>
              </div>
            </div>

            {/* LISTA DE FACTURAS DE ESTA COTIZACIÓN */}
            {(!quote.invoices || quote.invoices.length === 0) ? (
              <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-2">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">No hay comprobantes ARCA registrados para esta reserva aún.</p>
                <p className="text-[11px] text-slate-400">Podés simular una Vista Previa Borrador o emitir la Factura Electrónica por el total del viaje.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quote.invoices.map((inv, invIdx) => (
                  <div key={inv.id || invIdx} className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          inv.status === 'draft' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {inv.docType} {inv.voucherNumberStr}
                        </span>
                        <span className="font-bold text-slate-900">{inv.receiverName} ({inv.receiverIvaCondition})</span>
                        <span className="text-[10px] text-slate-400 font-mono">CUIT: {inv.receiverCuit || 'Sin CUIT'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Fecha: {inv.date} | Moneda: {inv.currency} | T.C: {inv.exchangeRate} | CAE: <strong className="font-mono text-slate-700">{inv.caeNumber || 'Sin CAE (Borrador)'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-slate-900">{inv.currency} ${fmtVal(inv.totalAmount)}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedArcaInvoiceForView(inv)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" /> Ver / Imprimir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL FICHA PERFIL DE PASAJERO */}
      {selectedPassengerProfileId && (
        <PassengerProfileModal
          passengerId={selectedPassengerProfileId}
          onClose={() => setSelectedPassengerProfileId(null)}
          onOpenQuote={q => handleLoadQuote(q)}
        />
      )}

      {/* MODAL CREACIÓN RÁPIDA DE NUEVO PASAJERO */}
      {showNewPaxModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase">Añadir Nuevo Pasajero</h3>
              <button onClick={() => setShowNewPaxModal(false)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPassenger} className="space-y-4">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Nombre</label>
                <input
                  required
                  value={newPaxData.name}
                  onChange={e => setNewPaxData({ ...newPaxData, name: e.target.value })}
                  placeholder="Ej: Juan Carlos"
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Apellido</label>
                <input
                  required
                  value={newPaxData.surname}
                  onChange={e => setNewPaxData({ ...newPaxData, surname: e.target.value })}
                  placeholder="Ej: Pérez García"
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">DNI / N° Pasaporte</label>
                <input
                  value={newPaxData.document}
                  onChange={e => setNewPaxData({ ...newPaxData, document: e.target.value })}
                  placeholder="Ej: 38920112 / AAH99124"
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">WhatsApp</label>
                  <input
                    value={newPaxData.phone}
                    onChange={e => setNewPaxData({ ...newPaxData, phone: e.target.value })}
                    placeholder="Ej: +54 9 11..."
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    value={newPaxData.email}
                    onChange={e => setNewPaxData({ ...newPaxData, email: e.target.value })}
                    placeholder="cliente@mail.com"
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPaxModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
                >
                  Guardar y Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREACIÓN RÁPIDA DE NUEVO PROVEEDOR */}
      {showNewOperatorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" /> Crear Nuevo Proveedor
              </h3>
              <button onClick={() => setShowNewOperatorModal(false)} className="p-2 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOperator} className="space-y-4">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Nombre del Proveedor / Operador</label>
                <input
                  required
                  value={newOperatorName}
                  onChange={e => setNewOperatorName(e.target.value)}
                  placeholder="Ej: Iberia Airlines / Juliá Tours"
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewOperatorModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
                >
                  Guardar y Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN / EMISIÓN DE FACTURA ARCA */}
      {showArcaInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* HEADER STICKY */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {arcaInvoiceForm.mode === 'draft' ? '🔎 Generar Vista Previa Borrador' : '⚡ Emitir Factura Electrónica ARCA'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {arcaInvoiceForm.mode === 'draft' ? 'Cálculo de comprobante sin CAE / Sin impacto impositivo' : 'Conexión con entorno Sandbox / AFIP'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowArcaInvoiceModal(false)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar text-xs">
              {/* FILTRO DE PASAJERO / SUBGRUPO SI HAY MÁS DE 1 PASAJERO */}
              {allQuotePassengers.length > 1 && (
                <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" /> Facturar a Pasajero / Pareja Específica ({allQuotePassengers.length} PAX)
                    </p>
                    <p className="text-[10.5px] text-indigo-700 font-medium">Podés emitir la factura para todo el grupo consolidado o discriminar solo a una pareja.</p>
                  </div>
                  <select
                    onChange={e => {
                      const paxId = e.target.value
                      if (!paxId) {
                        openNewArcaInvoiceModal(arcaInvoiceForm.mode)
                        return
                      }
                      const foundPax = allQuotePassengers.find(p => p.id === paxId)
                      if (foundPax) {
                        const filteredItems = quote.items.filter(it => !it.assignedPassengerIds || it.assignedPassengerIds.length === 0 || it.assignedPassengerIds.includes(paxId))
                        let fNoComp = 0
                        let fExento = 0
                        let fNet = 0
                        filteredItems.forEach(it => {
                          const eco = calculateItemEconomics(it)
                          fNet += eco.totalSale
                          if (it.economics.providerPurchaseInvoice) {
                            fNoComp += Number(it.economics.providerPurchaseInvoice.noComputable || 0)
                            fExento += Number(it.economics.providerPurchaseInvoice.exento || 0)
                          } else {
                            fNoComp += Math.round(eco.totalSale * 0.85 * 100) / 100
                            fExento += Math.round(eco.totalSale * 0.10 * 100) / 100
                          }
                        })
                        const fGrav21 = Math.max(0, Math.round((fNet - fNoComp - fExento) * 100) / 100)
                        const fIva21 = Math.round(fGrav21 * 0.21 * 100) / 100
                        const fTot = Math.round((fNoComp + fExento + fGrav21 + fIva21) * 100) / 100

                        const foundFull = passengers.find(p => p.id === paxId)
                        const doc = foundFull?.document || ''

                        setArcaInvoiceForm((prev: any) => ({
                          ...prev,
                          receiverName: foundPax.name,
                          receiverCuit: doc,
                          noComputable: fNoComp,
                          exento: fExento,
                          netGravado21: fGrav21,
                          iva21: fIva21,
                          totalAmount: fTot
                        }))
                      }
                    }}
                    className="bg-white border border-indigo-200 px-3 py-2 rounded-xl text-xs font-bold text-indigo-900 outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="">Reserva Completa ({allQuotePassengers.length} PAX Consolidado)</option>
                    {allQuotePassengers.map(p => (
                      <option key={p.id} value={p.id}>
                        👤 {p.name} {p.isTitular ? '(Titular)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* RECEPTOR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre / Razón Social del Pasajero</label>
                  <input
                    type="text"
                    value={arcaInvoiceForm.receiverName}
                    onChange={e => setArcaInvoiceForm({ ...arcaInvoiceForm, receiverName: e.target.value })}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-indigo-600"
                    placeholder="Ej: ABADIE, LUCIANA CECILIA"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CUIT / DNI / CUIL</label>
                  <input
                    type="text"
                    value={arcaInvoiceForm.receiverCuit}
                    onChange={e => setArcaInvoiceForm({ ...arcaInvoiceForm, receiverCuit: e.target.value })}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-600"
                    placeholder="Ej: 27389201124"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Condición Frente al IVA</label>
                  <select
                    value={arcaInvoiceForm.receiverIvaCondition}
                    onChange={e => {
                      const cond = e.target.value
                      const suggestedType = cond === 'Responsable Inscripto' ? 'Factura A' : 'Factura B'
                      setArcaInvoiceForm({ ...arcaInvoiceForm, receiverIvaCondition: cond, docType: suggestedType })
                    }}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="Consumidor Final">Consumidor Final (Factura B/C)</option>
                    <option value="Responsable Inscripto">Responsable Inscripto (Factura A)</option>
                    <option value="Monotributo">Monotributo (Factura B/C)</option>
                    <option value="Exento">Exento (Factura B/C)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipo de Comprobante</label>
                  <select
                    value={arcaInvoiceForm.docType}
                    onChange={e => setArcaInvoiceForm({ ...arcaInvoiceForm, docType: e.target.value })}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black text-indigo-700 outline-none"
                  >
                    <option value="Factura B">FACTURA B (Código 6)</option>
                    <option value="Factura A">FACTURA A (Código 1)</option>
                    <option value="Factura C">FACTURA C (Código 11)</option>
                    <option value="Nota de Crédito">NOTA DE CRÉDITO B (Código 8)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Moneda & Tipo de Cambio</label>
                  <div className="flex gap-2">
                    <select
                      value={arcaInvoiceForm.currency}
                      onChange={e => setArcaInvoiceForm({ ...arcaInvoiceForm, currency: e.target.value })}
                      className="bg-white border border-slate-200 px-2 py-2 rounded-xl text-xs font-black text-slate-800"
                    >
                      <option value="USD">U$S (Dólares)</option>
                      <option value="ARS">$ (Pesos)</option>
                    </select>
                    <input
                      type="number"
                      value={arcaInvoiceForm.exchangeRate}
                      onChange={e => setArcaInvoiceForm({ ...arcaInvoiceForm, exchangeRate: parseFloat(e.target.value) || 1 })}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
                      placeholder="T.C: 1515"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN CARGA DE FACTURAS DE COMPRA DE MAYORISTAS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" /> Facturas de Compra Recibidas del Mayorista
                    </p>
                    <p className="text-[10.5px] text-slate-500">Cargá las facturas de Let me travel, Santa Catalina o Toselli para volcar automáticamente el No Computable exterior e IVA a ARCA.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddPurchaseInvoiceModal(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Cargar Factura Mayorista
                  </button>
                </div>

                {(!quote.providerPurchaseInvoices || quote.providerPurchaseInvoices.length === 0) ? (
                  <div className="p-3 bg-white border border-dashed border-slate-200 rounded-xl text-center">
                    <p className="text-[11px] text-slate-400">Sin facturas de compra registradas aún. Podés ingresar la factura del mayorista o ajustar los importes manualmente abajo.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {quote.providerPurchaseInvoices.map((pinv, pidx) => (
                      <div key={pinv.id || pidx} className="p-2.5 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-black text-slate-900">{pinv.providerName}</span>
                          <span className="ml-2 font-mono text-[10px] text-slate-500">N° {pinv.invoiceNumber || 'S/N'}</span>
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            pinv.taxTreatment === 'back_no_facturable' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {pinv.taxTreatment === 'back_no_facturable' ? 'Back / No Facturable' : 'Facturable'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">${fmtVal(pinv.totalAmount)}</span>
                          <span className="ml-2 text-[10px] text-slate-500">(Ext: ${fmtVal(pinv.noComputable)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5 RUBROS IMPOSITIVOS REGLAMENTARIOS DE TURISMO ARCA */}
              <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                  <p className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-indigo-600" /> Discriminación de Rubros de Turismo (RG 1415)
                  </p>
                  <span className="text-[11px] font-bold text-indigo-700">Total: {arcaInvoiceForm.currency} ${fmtVal(
                    Number(arcaInvoiceForm.noComputable || 0) +
                    Number(arcaInvoiceForm.exento || 0) +
                    Number(arcaInvoiceForm.netGravado21 || 0) +
                    Number(arcaInvoiceForm.iva21 || 0) +
                    Number(arcaInvoiceForm.netGravado105 || 0) +
                    Number(arcaInvoiceForm.iva105 || 0) +
                    Number(arcaInvoiceForm.otrosTributos || 0)
                  )}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Servicios Turísticos - No Computable (Exterior)</label>
                    <input
                      type="number"
                      value={arcaInvoiceForm.noComputable || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        const tot = val + Number(arcaInvoiceForm.exento) + Number(arcaInvoiceForm.netGravado21) + Number(arcaInvoiceForm.iva21)
                        setArcaInvoiceForm({ ...arcaInvoiceForm, noComputable: val, totalAmount: Math.round(tot * 100) / 100 })
                      }}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Servicios Turísticos - Exento</label>
                    <input
                      type="number"
                      value={arcaInvoiceForm.exento || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        const tot = Number(arcaInvoiceForm.noComputable) + val + Number(arcaInvoiceForm.netGravado21) + Number(arcaInvoiceForm.iva21)
                        setArcaInvoiceForm({ ...arcaInvoiceForm, exento: val, totalAmount: Math.round(tot * 100) / 100 })
                      }}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Gravado al 21% (Comisión / Margen)</label>
                    <input
                      type="number"
                      value={arcaInvoiceForm.netGravado21 || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        const calcIva = Math.round(val * 0.21 * 100) / 100
                        const tot = Number(arcaInvoiceForm.noComputable) + Number(arcaInvoiceForm.exento) + val + calcIva
                        setArcaInvoiceForm({ ...arcaInvoiceForm, netGravado21: val, iva21: calcIva, totalAmount: Math.round(tot * 100) / 100 })
                      }}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">IVA (21%)</label>
                    <input
                      type="number"
                      value={arcaInvoiceForm.iva21 || ''}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0
                        const tot = Number(arcaInvoiceForm.noComputable) + Number(arcaInvoiceForm.exento) + Number(arcaInvoiceForm.netGravado21) + val
                        setArcaInvoiceForm({ ...arcaInvoiceForm, iva21: val, totalAmount: Math.round(tot * 100) / 100 })
                      }}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER STICKY */}
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setShowArcaInvoiceModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleIssueArcaInvoice(arcaInvoiceForm.mode)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                {arcaInvoiceForm.mode === 'draft' ? <Eye className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {arcaInvoiceForm.mode === 'draft' ? 'Generar Vista Previa Borrador' : 'Emitir Factura ARCA (Sandbox)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VOUCHER / IMPRESIÓN COMPROBANTE OFICIAL ARCA */}
      {selectedArcaInvoiceForView && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* HEADER STICKY */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0 z-10">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  Comprobante Electrónico ARCA - {selectedArcaInvoiceForView.docType} ({selectedArcaInvoiceForView.voucherNumberStr})
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedArcaInvoiceForView.status === 'draft' ? '🔎 MODO VISTA PREVIA BORRADOR (SIN VALOR FISCAL)' : '⚡ EMISIÓN AUTORIZADA POR ARCA / AFIP'}
                </p>
              </div>
              <button onClick={() => setSelectedArcaInvoiceForView(null)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VOUCHER IMPRIMIBLE REGLAMENTARIO ARCA */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
              <div id="printable-arca-invoice" className="p-8 bg-white border-2 border-slate-800 rounded-2xl space-y-6 shadow-xs font-sans text-slate-900 relative">
                
                {/* MARCA DE AGUA BORRADOR */}
                {selectedArcaInvoiceForView.status === 'draft' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-25deg] select-none">
                    <p className="text-6xl font-black text-red-600 uppercase tracking-widest text-center">BORRADOR DE PRUEBA<br/>NO VÁLIDO COMO FACTURA</p>
                  </div>
                )}

                {/* ENCABEZADO REGLAMENTARIO COMPROBANTE OFICIAL ARCA */}
                <div className="grid grid-cols-12 border-b-2 border-slate-900 pb-4 gap-4 items-center">
                  <div className="col-span-5 space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">CONCEPTO EVT</h2>
                    <p className="text-xs font-bold text-slate-600">Empresa de Viajes y Turismo · Leg. 18291</p>
                    <p className="text-[11px] text-slate-500">Rivadavia 1223, CABA | CUIT: 30-71683140-6</p>
                    <p className="text-[10px] font-bold text-indigo-700 uppercase">IVA RESPONSABLE INSCRIPTO</p>
                  </div>

                  <div className="col-span-2 text-center border-x-2 border-slate-900 py-2">
                    <span className="text-4xl font-black text-slate-900 block">
                      {selectedArcaInvoiceForView.docType.includes('A') ? 'A' : (selectedArcaInvoiceForView.docType.includes('B') ? 'B' : 'C')}
                    </span>
                    <span className="text-[9px] font-bold uppercase text-slate-500 block">Código {selectedArcaInvoiceForView.docType.includes('A') ? '1' : '6'}</span>
                    <span className="text-[9px] font-black uppercase bg-slate-100 px-1 py-0.5 rounded mt-1 block">ORIGINAL</span>
                  </div>

                  <div className="col-span-5 text-right space-y-1">
                    <h3 className="text-base font-black uppercase tracking-tight">{selectedArcaInvoiceForView.docType.toUpperCase()}</h3>
                    <p className="text-xs font-mono font-bold text-slate-900">N° {selectedArcaInvoiceForView.voucherNumberStr}</p>
                    <p className="text-xs text-slate-600 font-medium">Fecha Emisión: <strong>{selectedArcaInvoiceForView.date}</strong></p>
                    <p className="text-xs text-slate-600 font-medium">Moneda: <strong>{selectedArcaInvoiceForView.currency}</strong> (T.C: {selectedArcaInvoiceForView.exchangeRate})</p>
                  </div>
                </div>

                {/* RECEPTOR */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[9.5px]">Señor(es):</p>
                    <p className="font-black text-slate-900 text-sm uppercase">{selectedArcaInvoiceForView.receiverName}</p>
                    <p className="text-slate-600 font-medium">{selectedArcaInvoiceForView.receiverAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-400 uppercase text-[9.5px]">CUIT / DNI:</p>
                    <p className="font-black text-slate-900 font-mono text-sm">{selectedArcaInvoiceForView.receiverCuit}</p>
                    <p className="text-indigo-700 font-bold uppercase text-[11px]">Condición IVA: {selectedArcaInvoiceForView.receiverIvaCondition}</p>
                  </div>
                </div>

                {/* TABLA DE DETALLE FISCAL DE TURISMO */}
                <div className="space-y-2">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Detalle de Conceptos de Turismo</th>
                        <th className="p-3 text-right">Importe ({selectedArcaInvoiceForView.currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {selectedArcaInvoiceForView.netGravado21 > 0 && (
                        <tr>
                          <td className="p-3">Servicios Turísticos - Gravados al 21% (Margen / Comisión)</td>
                          <td className="p-3 text-right font-bold">${fmtVal(selectedArcaInvoiceForView.netGravado21)}</td>
                        </tr>
                      )}
                      {selectedArcaInvoiceForView.iva21 > 0 && (
                        <tr>
                          <td className="p-3">IVA 21%</td>
                          <td className="p-3 text-right font-bold text-indigo-700">${fmtVal(selectedArcaInvoiceForView.iva21)}</td>
                        </tr>
                      )}
                      {selectedArcaInvoiceForView.exento > 0 && (
                        <tr>
                          <td className="p-3">Servicios Turísticos - Exento</td>
                          <td className="p-3 text-right font-bold">${fmtVal(selectedArcaInvoiceForView.exento)}</td>
                        </tr>
                      )}
                      {selectedArcaInvoiceForView.noComputable > 0 && (
                        <tr>
                          <td className="p-3">Servicios Turísticos - No Computable (Exterior Art. 1 Inc. b)</td>
                          <td className="p-3 text-right font-bold">${fmtVal(selectedArcaInvoiceForView.noComputable)}</td>
                        </tr>
                      )}
                      {selectedArcaInvoiceForView.otrosTributos > 0 && (
                        <tr>
                          <td className="p-3">Importe Otros Tributos / Percepciones</td>
                          <td className="p-3 text-right font-bold">${fmtVal(selectedArcaInvoiceForView.otrosTributos)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* IMPORTE TOTAL Y TIPO DE CAMBIO */}
                <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-2xl">
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-300">IMPORTE TOTAL DEL COMPROBANTE</p>
                    <p className="text-[10.5px] text-slate-300 font-medium">A efectos contables e impositivos tipo de cambio 1 = {selectedArcaInvoiceForView.exchangeRate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">{selectedArcaInvoiceForView.currency} ${fmtVal(selectedArcaInvoiceForView.totalAmount)}</span>
                  </div>
                </div>

                {/* LEYENDA LEGAL DE INTERMEDIACIÓN EN TURISMO */}
                <p className="text-[10.5px] text-slate-500 italic leading-snug border-t border-slate-200 pt-3">
                  {selectedArcaInvoiceForView.legalLegend}
                </p>

                {/* BLOQUE CÓDIGO QR Y CAE ARCA / AFIP */}
                <div className="flex justify-between items-end border-t-2 border-slate-900 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center p-1">
                      <div className="w-full h-full border-2 border-slate-800 flex items-center justify-center font-black text-[9px] text-slate-800 text-center leading-none">
                        QR<br/>ARCA
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">ARCA</h4>
                      <p className="text-[9.5px] font-bold text-slate-500 uppercase">Agencia de Recaudación y Control Aduanero</p>
                      <p className="text-[9.5px] text-slate-400">Comprobante Autorizado por WebService WSFE</p>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs space-y-0.5">
                    <p className="font-bold text-slate-800">CAE N°: <strong>{selectedArcaInvoiceForView.caeNumber || '86251037765586'}</strong></p>
                    <p className="text-slate-500 text-[11px]">Vto CAE: <strong>{selectedArcaInvoiceForView.caeExpirationDate || '04/07/2026'}</strong></p>
                  </div>
                </div>

              </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const printContent = document.getElementById('printable-arca-invoice')
                  if (!printContent) return
                  const printWindow = window.open('', '_blank')
                  if (!printWindow) return
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>FacturaARCA_${selectedArcaInvoiceForView.voucherNumberStr}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                      </head>
                      <body class="bg-white p-8">
                        ${printContent.innerHTML}
                        <script>
                          window.onload = function() { window.print(); window.close(); }
                        </script>
                      </body>
                    </html>
                  `)
                  printWindow.document.close()
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimir Comprobante ARCA (Ctrl + P)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN ELIMINAR SERVICIO */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" /> Eliminar Servicio
              </h3>
              <button onClick={() => setItemToDelete(null)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              ¿Estás seguro de que deseas eliminar este servicio de la cotización? Esta acción eliminará los costos y detalles del servicio.
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRemoveItem}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN ELIMINAR COTIZACIÓN COMPLETA */}
      {quoteToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 uppercase flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" /> Eliminar Cotización
              </h3>
              <button onClick={() => setQuoteToDelete(null)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                ¿Estás seguro de que deseas eliminar esta cotización? Esta acción la borrará permanentemente de la base de datos.
              </p>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase">
                  {quoteToDelete.title || 'Cotización de Viaje'}
                </p>
                <p className="text-xs text-slate-600 font-semibold">
                  Pasajero: {quoteToDelete.passenger ? `${quoteToDelete.passenger.surname}, ${quoteToDelete.passenger.name}` : (quoteToDelete.clientName || 'Sin Pasajero')}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Destino: {quoteToDelete.destination || 'Por definir'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuote(quoteToDelete.id)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EXPORTACIÓN A PDF / VISTA PREVIA IMPRIMIBLE COMERCIAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* HEADER STICKY DE EXPORTACIÓN */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 z-10 shadow-2xs">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> Exportar Cotización Comercial
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Seleccioná la modalidad de presentación para enviar o imprimir para el cliente</p>
              </div>

              <div className="flex items-center gap-3">
                {/* SELECTOR DE FORMATO */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setExportMode('package_total')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      exportMode === 'package_total' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📦 Total Paquete
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportMode('detailed')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      exportMode === 'detailed' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📋 Desglose por Servicio
                  </button>
                </div>

                <button onClick={() => setShowExportModal(false)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer rounded-xl hover:bg-slate-100 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CUERPO SCROLLABLE CON EL DOCUMENTO IMPRIMIBLE */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar bg-slate-50/50">
              <div id="printable-quote-document" className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-xs font-sans text-slate-800">
                
                {/* CABECERA VOUCHER DE AGENCIA */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                  <div>
                    <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">CONCEPTO EVT</h1>
                    <p className="text-xs font-bold text-slate-500">Empresa de Viajes y Turismo · Leg. 18291</p>
                    <p className="text-xs text-slate-400">info@conceptoviajes.com.ar | www.conceptoviajes.com.ar</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase rounded-lg border border-indigo-200 inline-block mb-1">
                      COTIZACIÓN OFICIAL DE VIAJE
                    </span>
                    <p className="text-xs text-slate-500 font-medium">Fecha: <strong>{new Date().toLocaleDateString('es-AR')}</strong></p>
                    <p className="text-xs text-slate-500 font-medium">Moneda: <strong>{quote.currency}</strong></p>
                  </div>
                </div>

                {/* DATOS DEL PASAJERO Y DETALLES DEL VIAJE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Pasajero Principal</p>
                    <p className="font-black text-slate-900 text-sm uppercase">{quote.passenger ? `${quote.passenger.surname}, ${quote.passenger.name}` : (quote.clientName || 'Cliente Particular')}</p>
                    <p className="text-slate-600 font-medium">Pasajeros Totales: {quote.paxCount} pax</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Detalles del Itinerario</p>
                    <p className="font-black text-slate-900 text-sm uppercase">{quote.title || 'Propuesta de Viaje'}</p>
                    <p className="text-slate-600 font-medium">Destino: {quote.destination || 'Por definir'} {quote.startDate ? `| Fechas: ${fmtDate(quote.startDate)} al ${fmtDate(quote.endDate)}` : ''}</p>
                  </div>
                </div>

                {/* BRIEFING DE SOLICITUD INICIAL (SI EXISTE) */}
                {quote.clientRequestNotes && (
                  <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-0.5">
                    <p className="font-black uppercase text-[10px] text-amber-900">Solicitud / Solicitado por el Pasajero:</p>
                    <p className="text-slate-700 italic font-medium">{quote.clientRequestNotes}</p>
                  </div>
                )}

                {/* DETALLE DE SERVICIOS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    Resumen del Itinerario de Servicios
                  </h4>

                  {quote.items.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No hay servicios añadidos a la cotización aún.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {quote.items.map((item, idx) => {
                        const eco = calculateItemEconomics(item)
                        const d = item.details || {}
                        const itemTitle = item.title || d.hotelName || d.airline || d.route || d.serviceName || `${item.type.toUpperCase()} de Viaje`

                        return (
                          <div key={item.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 text-xs space-y-2">
                            <div className="flex justify-between items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase text-[11px]">
                                  {idx + 1}. [{item.type}]
                                </span>
                                <span className="font-black text-slate-900 uppercase text-xs">{itemTitle}</span>
                              </div>

                              {exportMode === 'detailed' && (
                                <div className="text-right shrink-0">
                                  <span className="font-black text-slate-900 text-sm">{quote.currency} ${fmtVal(eco.totalSale)}</span>
                                </div>
                              )}
                            </div>

                            {/* DESGLOSE INFORMATIVO DETALLADO DEL SERVICIO */}
                            {/* AÉREO */}
                            {item.type === 'flight' && (
                              <div className="space-y-2 pt-1">
                                {d.segments && d.segments.length > 0 && (
                                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/80">
                                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Itinerario de Vuelos ({d.segments.length} tramo{d.segments.length > 1 ? 's' : ''}):</p>
                                    {d.segments.map((seg: any, sIdx: number) => (
                                      <div key={seg.id || sIdx} className="flex flex-wrap items-center justify-between text-[11px] border-b border-slate-100 last:border-0 pb-1 last:pb-0 gap-2">
                                        <span className="font-bold text-slate-800 flex items-center gap-1">
                                          ✈️ {seg.from || 'Origen'} ➔ {seg.to || 'Destino'}
                                          {seg.flightNumber && <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">Vuelo: {seg.flightNumber}</span>}
                                        </span>
                                        <span className="text-slate-600 font-medium">
                                          {seg.departureDate ? `Salida: ${fmtDate(seg.departureDate)} ${seg.departureTime || ''}` : ''}
                                          {seg.arrivalDate ? ` | Llegada: ${fmtDate(seg.arrivalDate)} ${seg.arrivalTime || ''}` : ''}
                                          {seg.stops && ` (${seg.stops})`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {d.baggage && (
                                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 bg-slate-100/70 px-3 py-1.5 rounded-lg border border-slate-200/60">
                                    <span className="font-bold text-slate-700 text-[10px] uppercase">Equipaje:</span>
                                    <span>{d.baggage.hasHand ? `🎒 Mano: ${d.baggage.handDesc || 'Incluido'}` : '🎒 Mano: No'}</span>
                                    <span>{d.baggage.hasCarryOn ? `🧳 Carry-on: ${d.baggage.carryOnDesc || 'Incluido'}` : '🧳 Carry-on: No'}</span>
                                    <span>{d.baggage.hasChecked ? `🧳 Bodega: ${d.baggage.checkedDesc || 'Incluida'}` : '🧳 Bodega: No'}</span>
                                  </div>
                                )}

                                {d.bookingCode && (
                                  <p className="text-[10.5px] font-semibold text-slate-500">Código de Reserva / GDS: <strong className="font-mono text-slate-800">{d.bookingCode}</strong></p>
                                )}
                              </div>
                            )}

                            {/* HOTEL */}
                            {item.type === 'hotel' && (
                              <div className="space-y-2 pt-1">
                                <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-slate-700 font-medium">
                                  {d.checkIn && d.checkOut && (
                                    <span>📅 Entrada: <strong>{fmtDate(d.checkIn)}</strong> ➔ Salida: <strong>{fmtDate(d.checkOut)}</strong></span>
                                  )}
                                  {d.cancellationDate && (
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10.5px] font-bold">
                                      Cancelación sin gasto hasta: {fmtDate(d.cancellationDate)}
                                    </span>
                                  )}
                                </div>

                                {d.rooms && d.rooms.length > 0 && (
                                  <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200/80">
                                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Habitaciones / Alojamiento:</p>
                                    {d.rooms.map((rm: any, rIdx: number) => (
                                      <div key={rm.id || rIdx} className="flex justify-between text-[11px] text-slate-700 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                                        <span>🏨 Hab. {rIdx + 1}: <strong>{rm.type || 'Standard'}</strong></span>
                                        <span>Régimen: <strong>{rm.board || 'Solo Habitación'}</strong> ({rm.paxCount || 1} pax)</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {d.confirmationNumber && (
                                  <p className="text-[10.5px] font-semibold text-slate-500">Confirmación Hotelera: <strong className="font-mono text-slate-800">{d.confirmationNumber}</strong></p>
                                )}
                              </div>
                            )}

                            {/* TREN */}
                            {item.type === 'train' && (
                              <div className="space-y-1.5 pt-1 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80">
                                <div className="flex flex-wrap items-center justify-between text-[11.5px]">
                                  <span className="font-bold text-slate-900">🚆 Tramo: {d.origin || 'Origen'} ➔ {d.destination || 'Destino'}</span>
                                  {d.trainNumber && <span className="font-mono text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded">Tren Nº: {d.trainNumber}</span>}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 mt-1">
                                  {d.departureDate && <span>Salida: {fmtDate(d.departureDate)} {d.departureTime || ''}</span>}
                                  {d.arrivalDate && <span>Llegada: {fmtDate(d.arrivalDate)} {d.arrivalTime || ''}</span>}
                                  {d.classType && <span>Clase: <strong>{d.classType}</strong></span>}
                                  {d.seatDetails && <span>Asiento: <strong>{d.seatDetails}</strong></span>}
                                </div>
                              </div>
                            )}

                            {/* TRASLADO */}
                            {item.type === 'transfer' && (
                              <div className="space-y-1.5 pt-1 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80">
                                <p className="font-bold text-slate-900 text-[11.5px]">🚐 Traslado: {d.origin || 'Origen'} ➔ {d.destination || 'Destino'}</p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                                  <span>Modalidad: <strong>{d.isRoundTrip ? 'Ida y Vuelta (Round Trip)' : 'Solo Ida (One Way)'}</strong></span>
                                  {d.date && <span>Fecha: <strong>{fmtDate(d.date)}</strong> {d.time || ''}</span>}
                                </div>
                              </div>
                            )}

                            {/* ASISTENCIA */}
                            {item.type === 'assistance' && (
                              <div className="space-y-1.5 pt-1 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80">
                                <p className="font-bold text-slate-900 text-[11.5px]">🛡️ Cobertura Médica de Viaje</p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                                  {d.startDate && d.endDate && <span>Vigencia: <strong>{fmtDate(d.startDate)}</strong> al <strong>{fmtDate(d.endDate)}</strong></span>}
                                  {d.coverage && <span>Monto Máximo Cobertura: <strong>{d.coverage}</strong></span>}
                                </div>
                              </div>
                            )}

                            {/* DESCRIPCIÓN GENERAL DE OTROS SERVICIOS / EXCURSIONES */}
                            {(() => {
                              const desc = (item.description || d.description || '').trim()
                              if (desc && desc.length > 1 && desc.toLowerCase() !== 'x') {
                                return (
                                  <div className="pt-1 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/70">
                                    <p className="font-medium text-[11px]">{desc}</p>
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* RESUMEN FINANCIERO TOTAL */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                      {exportMode === 'package_total' ? 'PRECIO TOTAL DEL PAQUETE DE VIAJE' : 'SUMA TOTAL DE SERVICIOS COTIZADOS'}
                    </p>
                    <p className="text-xs text-slate-300 font-medium">Incluye todos los ítems e impuestos del itinerario descripto.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">{quote.currency} ${fmtVal(totals.totalSale)}</span>
                  </div>
                </div>

                {/* AVISO LEGAL / DISCLAIMER OBLIGATORIO */}
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <p className="font-black uppercase flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Condiciones Importantes de Cotización:
                  </p>
                  <p className="font-semibold text-amber-800 leading-snug">
                    Todas las tarifas y servicios expresados en el presente presupuesto están estrictamente sujetos a disponibilidad al momento de solicitar la confirmación efectiva de la reserva y a posibles modificaciones de tarifa sin previo aviso.
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER STICKY DE ACCIONES */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-wrap justify-between items-center gap-3 shrink-0 z-10">
              <button
                type="button"
                onClick={() => {
                  const printContent = document.getElementById('printable-quote-document')
                  if (!printContent) return
                  const printWindow = window.open('', '_blank')
                  if (!printWindow) return
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Cotizacion_${quote.clientName || 'Cliente'}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                      </head>
                      <body class="bg-white p-8">
                        ${printContent.innerHTML}
                        <script>
                          window.onload = function() { window.print(); window.close(); }
                        </script>
                      </body>
                    </html>
                  `)
                  printWindow.document.close()
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimir / Guardar en PDF (Ctrl + P)
              </button>

              <button
                type="button"
                onClick={() => {
                  let txt = `*COTIZACIÓN DE VIAJE - CONCEPTO EVT*\n`
                  txt += `*Pasajero:* ${quote.clientName || 'Cliente Particular'}\n`
                  txt += `*Destino:* ${quote.destination || 'Por definir'}\n\n`
                  txt += `*ITINERARIO DE SERVICIOS:*\n`
                  quote.items.forEach((it, i) => {
                    const eco = calculateItemEconomics(it)
                    const d = it.details || {}
                    const title = it.title || d.hotelName || d.airline || d.route || `${it.type.toUpperCase()} de Viaje`
                    txt += `${i+1}. [${it.type.toUpperCase()}] ${title}\n`

                    // Informational breakdown for WhatsApp
                    if (it.type === 'flight' && d.segments) {
                      d.segments.forEach((s: any) => {
                        txt += `   ✈️ ${s.from || ''} -> ${s.to || ''} | ${s.departureDate ? fmtDate(s.departureDate) : ''} ${s.departureTime || ''}\n`
                      })
                    } else if (it.type === 'hotel') {
                      if (d.checkIn && d.checkOut) txt += `   🏨 Check-in: ${fmtDate(d.checkIn)} -> Check-out: ${fmtDate(d.checkOut)}\n`
                      if (d.rooms) d.rooms.forEach((r: any) => txt += `   • Habitación: ${r.type || 'Standard'} (${r.board || 'Solo hab'})\n`)
                    } else if (it.type === 'train') {
                      txt += `   🚆 ${d.origin || ''} -> ${d.destination || ''} | ${d.departureDate ? fmtDate(d.departureDate) : ''}\n`
                    } else if (it.type === 'transfer') {
                      txt += `   🚐 ${d.origin || ''} -> ${d.destination || ''} | ${d.date ? fmtDate(d.date) : ''}\n`
                    } else if (it.type === 'assistance') {
                      if (d.startDate && d.endDate) txt += `   🛡️ Vigencia: ${fmtDate(d.startDate)} al ${fmtDate(d.endDate)}\n`
                    }

                    if (exportMode === 'detailed') txt += `   Precio: ${quote.currency} $${fmtVal(eco.totalSale)}\n`
                    txt += `\n`
                  })
                  txt += `*TOTAL DEL PAQUETE:* ${quote.currency} $${fmtVal(totals.totalSale)}\n\n`
                  txt += `_Nota: Tarifas y servicios sujetos a disponibilidad al momento de confirmar la reserva y a cambios de tarifa sin previo aviso._`
                  navigator.clipboard.writeText(txt)
                  toast.success('Resumen informativo de cotización copiado para WhatsApp')
                }}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <Share2 className="w-4 h-4" /> Copiar para WhatsApp
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PARA CARGAR FACTURA DE COMPRA DE MAYORISTA (Let's Travel, Toselli, etc.) */}
      {showAddPurchaseInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" /> Cargar Factura de Mayorista
                </h3>
                <p className="text-xs text-slate-500 font-medium">Ingresá el desglose de la factura recibida del proveedor para sincronizar la Factura ARCA al Pasajero.</p>
              </div>
              <button onClick={() => setShowAddPurchaseInvoiceModal(false)} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mayorista / Proveedor</label>
                  <input
                    type="text"
                    value={purchaseInvoiceForm.providerName || ''}
                    onChange={e => setPurchaseInvoiceForm({ ...purchaseInvoiceForm, providerName: e.target.value })}
                    placeholder="Ej: Let me travel / Santa Catalina"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">N° Comprobante Mayorista</label>
                  <input
                    type="text"
                    value={purchaseInvoiceForm.invoiceNumber || ''}
                    onChange={e => setPurchaseInvoiceForm({ ...purchaseInvoiceForm, invoiceNumber: e.target.value })}
                    placeholder="Ej: 0005-00010773"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tratamiento de Comisión / Facturación</label>
                <select
                  value={purchaseInvoiceForm.taxTreatment || 'facturable'}
                  onChange={e => setPurchaseInvoiceForm({ ...purchaseInvoiceForm, taxTreatment: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="facturable">Facturable (Mayorista emite Factura A/B a la Agencia - ej: Let's Travel)</option>
                  <option value="back_no_facturable">Back / No Facturable (Over-comisión sin IVA - ej: Toselli Back)</option>
                </select>
              </div>

              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
                <p className="font-black text-indigo-900 text-xs uppercase">Desglose Impositivo de la Factura de Compra:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">No Computable (Exterior)</label>
                    <input
                      type="number"
                      value={purchaseInvoiceForm.noComputable || ''}
                      onChange={e => setPurchaseInvoiceForm({ ...purchaseInvoiceForm, noComputable: parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: 2550"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Exento</label>
                    <input
                      type="number"
                      value={purchaseInvoiceForm.exento || ''}
                      onChange={e => setPurchaseInvoiceForm({ ...purchaseInvoiceForm, exento: parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: 0"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Gravado 21%</label>
                    <input
                      type="number"
                      value={purchaseInvoiceForm.netGravado21 || ''}
                      onChange={e => {
                        const net = parseFloat(e.target.value) || 0
                        setPurchaseInvoiceForm({ ...purchaseInvoiceForm, netGravado21: net, iva21: Math.round(net * 0.21 * 100) / 100 })
                      }}
                      placeholder="Ej: 100"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">IVA 21%</label>
                    <input
                      type="number"
                      value={purchaseInvoiceForm.iva21 || ''}
                      onChange={e => setPurchaseInvoiceForm({ ...purchaseInvoiceForm, iva21: parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: 21"
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddPurchaseInvoiceModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddProviderPurchaseInvoice}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Registrar y Sincronizar con ARCA
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ManualQuoteBuilder;
