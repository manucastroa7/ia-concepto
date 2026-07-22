import React, { useState, useEffect, useMemo } from 'react'
import { 
    Plus, Trash2, Plane, Hotel, Users, ShieldCheck, Send, Save, History, Search, 
    ChevronDown, CheckCircle2, X, Briefcase, Clock, Calendar, MapPin, DollarSign, 
    Wallet, FileText, XCircle, ArrowRight, Eye, Train, Upload, Camera, Sparkles, UserPlus,
    Luggage, ArrowRightLeft, GripVertical, Building2, CreditCard, ArrowUpDown, Tag, Receipt
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PassengerProfileModal } from './PassengerProfileModal'

// --- COMPONENTES AUXILIARES ---

function NumericInput({ value, onChange, className, placeholder }: { value: number, onChange: (val: number) => void, className?: string, placeholder?: string }) {
  return (
    <input 
      type="text"
      value={value === 0 ? '' : value.toString()}
      onChange={e => {
        const val = e.target.value.replace(/[^0-9.]/g, '');
        onChange(val === '' ? 0 : parseFloat(val));
      }}
      className={className}
      placeholder={placeholder || "0"}
    />
  )
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
        className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-800 text-xs font-bold flex justify-between items-center cursor-pointer hover:border-slate-300 transition-all"
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

  // Otros
  description?: string
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
}

interface Item {
  id: string
  type: 'flight' | 'hotel' | 'train' | 'transfer' | 'assistance' | 'service'
  providerId: string
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
}

interface QuoteState {
  id?: string
  passengerId: string
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
  globalAdjustment: number
  notes: string
  status: 'draft' | 'sent' | 'follow_up' | 'reserved' | 'sold' | 'lost'
}

export function ManualQuoteBuilder() {
  const [viewMode, setViewMode] = useState<'builder' | 'list'>('builder')
  const [quote, setQuote] = useState<QuoteState>({
    passengerId: '',
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

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
    setQuote(prev => ({ ...prev, passengerId: passenger.id }))
    setPassengerSearch(`${passenger.surname}, ${passenger.name}`)
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
    ;(quote.providerPayments || []).forEach(p => {
      if (p.providerId) set.add(p.providerId)
    })
    return operators.filter(op => set.has(op.id))
  }, [quote.items, quote.providerPayments, operators])

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
    setQuote({
      passengerId: '',
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
      status: 'draft'
    })
    setPassengerSearch('')
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
      {/* SWITCH DE VISTA: HISTORIAL VS NUEVA / EDITANDO */}
      <div className="flex justify-between items-center">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" /> Listado de Cotizaciones ({historyQuotes.length})
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

      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Listado de Cotizaciones Maestro</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Hacé clic en cualquier cotización para editarla o en <strong>Ficha</strong> para ver el historial y cobros del pasajero.</p>
            </div>
            <button
              onClick={resetQuote}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Crear Nueva Cotización
            </button>
          </div>

          {historyQuotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {historyQuotes.map(q => {
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
                  draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-600' },
                  sent: { label: 'Enviada', cls: 'bg-blue-100 text-blue-700' },
                  follow_up: { label: 'Seguimiento', cls: 'bg-amber-100 text-amber-700' },
                  reserved: { label: 'Reserva', cls: 'bg-purple-100 text-purple-700' },
                  sold: { label: 'Vendido', cls: 'bg-emerald-100 text-emerald-700' },
                  lost: { label: 'Perdido', cls: 'bg-red-100 text-red-700' }
                }
                const st = ST_CFG[q.status] || ST_CFG.draft

                return (
                  <div 
                    key={q.id} 
                    className="p-5 rounded-2xl border border-slate-200/80 hover:border-orange-300 transition-all hover:shadow-md bg-white flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.passenger?.surname ? `${q.passenger.surname}, ${q.passenger.name}` : (q.clientName || 'Sin Pasajero')}</span>
                        <span className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-md ${st.cls}`}>{st.label}</span>
                      </div>

                      <h3 className="font-black text-slate-900 text-base group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                        {q.title || 'Cotización de Viaje'}
                      </h3>

                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Destino: <strong className="text-slate-800">{q.destination || 'Por definir'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const pIdToOpen = q.passengerId || q.passenger?.id;
                          if (pIdToOpen) {
                            setSelectedPassengerProfileId(pIdToOpen);
                          } else if (passengers.length > 0) {
                            setSelectedPassengerProfileId(passengers[0].id);
                          } else {
                            toast.error('No hay registro de pasajeros');
                          }
                        }}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 font-black text-[11px] uppercase rounded-xl border border-orange-200 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                        title="Ver Ficha Completa del Pasajero, Servicios y Pagos"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ficha
                      </button>

                      <div className="text-right">
                        <p className="text-[9.5px] font-bold text-slate-400 uppercase">Total Cotizado</p>
                        <p className="font-black text-orange-600 text-base leading-tight">{q.currency || 'USD'} ${fmtVal(totalSale)}</p>
                      </div>

                      <button 
                        onClick={() => handleLoadQuote(q)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl p-8">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Sin cotizaciones registradas</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Creá una nueva cotización para comenzar a cargar itinerarios aéreos, hoteles y trenes.</p>
            </div>
          )}
        </div>
      ) : (
        /* COTIZADOR MAESTRO FORMULARIO */
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
                { id: 'draft', label: 'Borrador', icon: FileText, activeCls: 'bg-slate-900 text-white border-slate-900' },
                { id: 'sent', label: 'Enviada', icon: Send, activeCls: 'bg-blue-600 text-white border-blue-600' },
                { id: 'follow_up', label: 'Seguimiento', icon: Clock, activeCls: 'bg-amber-500 text-white border-amber-500' },
                { id: 'reserved', label: 'Reserva', icon: ShieldCheck, activeCls: 'bg-purple-600 text-white border-purple-600' },
                { id: 'sold', label: 'Vendido', icon: CheckCircle2, activeCls: 'bg-emerald-600 text-white border-emerald-600' },
                { id: 'lost', label: 'Perdido', icon: XCircle, activeCls: 'bg-red-600 text-white border-red-600' }
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
                          setPassengerSearch(e.target.value);
                          searchPassengers(e.target.value);
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
                                removeItem(item.id);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
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
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-1">
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
                                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-1">
                                    📊 Modo de Cálculo / Costo del Servicio
                                  </label>
                                  <select
                                    value={item.details.costDividerMode || 'per_passenger'}
                                    onChange={e => updateItemDetails(item.id, 'costDividerMode', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                  >
                                    <option value="per_passenger">Costo es Por Pasajero (multiplica x total de pax)</option>
                                    <option value="divided_total">Costo Total Fijo / Se divide entre los pax</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* AÉREOS FORMULARIO COMPLETO */}
                            {item.type === 'flight' && (
                              <div className="space-y-5">
                                
                                {/* IA OCR SCANNER BUTTON */}
                                <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-4 rounded-2xl text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
                                      <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-black uppercase tracking-wider">Lector Automático de Reserva Aérea (OCR)</p>
                                      <p className="text-[11px] text-sky-100 font-medium">Subí un screenshot, ticket o PDF del vuelo para auto-completar los datos.</p>
                                    </div>
                                  </div>

                                  <label className="px-4 py-2 bg-white text-sky-900 hover:bg-sky-50 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-all flex items-center gap-2 shrink-0">
                                    <Upload className="w-4 h-4" /> {isParsingFlight === item.id ? 'Analizando...' : 'Subir Screenshot / Print Vuelo'}
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
                                        value={item.details.cancellationDate || ''}
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
                                        value={item.details.checkIn || ''}
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
                              <div className="space-y-4 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                  <Train className="w-4 h-4 text-orange-500" /> Detalles del Servicio de Tren
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Operador / Empresa</label>
                                    <input
                                      type="text"
                                      value={item.details.trainOperator || ''}
                                      onChange={e => updateItemDetails(item.id, 'trainOperator', e.target.value)}
                                      placeholder="Ej: Renfe / Eurostar"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nº Tren</label>
                                    <input
                                      type="text"
                                      value={item.details.trainNumber || ''}
                                      onChange={e => updateItemDetails(item.id, 'trainNumber', e.target.value)}
                                      placeholder="Ej: AVE 0314"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Código Reserva / Ticket</label>
                                    <input
                                      type="text"
                                      value={item.details.bookingCode || ''}
                                      onChange={e => updateItemDetails(item.id, 'bookingCode', e.target.value)}
                                      placeholder="Ej: REN-7749"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Clase / Asiento</label>
                                    <input
                                      type="text"
                                      value={item.details.classType || ''}
                                      onChange={e => updateItemDetails(item.id, 'classType', e.target.value)}
                                      placeholder="Ej: Preferente - Coche 4 As. 12"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Origen</label>
                                    <input
                                      type="text"
                                      value={item.details.origin || ''}
                                      onChange={e => updateItemDetails(item.id, 'origin', e.target.value)}
                                      placeholder="Ej: Madrid Atocha"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Destino</label>
                                    <input
                                      type="text"
                                      value={item.details.destination || ''}
                                      onChange={e => updateItemDetails(item.id, 'destination', e.target.value)}
                                      placeholder="Ej: Barcelona Sants"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fecha Salida</label>
                                    <input
                                      type="date"
                                      value={item.details.departureDate || ''}
                                      onChange={e => updateItemDetails(item.id, 'departureDate', e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hora Salida</label>
                                    <input
                                      type="text"
                                      value={item.details.departureTime || ''}
                                      onChange={e => updateItemDetails(item.id, 'departureTime', e.target.value)}
                                      placeholder="Ej: 09:30"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* TRASLADO FORMULARIO COMPLETO */}
                            {item.type === 'transfer' && (
                              <div className="space-y-4 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-orange-500" /> Detalles del Traslado
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Origen (Punto de Salida)</label>
                                    <input
                                      type="text"
                                      value={item.details.origin || ''}
                                      onChange={e => updateItemDetails(item.id, 'origin', e.target.value)}
                                      placeholder="Ej: Aeropuerto FCO"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Destino (Llegada)</label>
                                    <input
                                      type="text"
                                      value={item.details.destination || ''}
                                      onChange={e => updateItemDetails(item.id, 'destination', e.target.value)}
                                      placeholder="Ej: Hotel en Roma Centro"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fecha del Servicio</label>
                                    <input
                                      type="date"
                                      value={item.details.date || ''}
                                      onChange={e => updateItemDetails(item.id, 'date', e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Horario Pickup</label>
                                    <input
                                      type="text"
                                      value={item.details.time || ''}
                                      onChange={e => updateItemDetails(item.id, 'time', e.target.value)}
                                      placeholder="Ej: 14:00"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ASISTENCIA MÉDICA Y SERVICIOS ADICIONALES FORMULARIO COMPLETO */}
                            {(item.type === 'assistance' || item.type === 'service') && (
                              <div className="space-y-4 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                                <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-orange-500" /> Descripción y Cobertura del Servicio
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Descripción / Producto</label>
                                    <input
                                      type="text"
                                      value={item.details.description || ''}
                                      onChange={e => updateItemDetails(item.id, 'description', e.target.value)}
                                      placeholder="Ej: Assist Card AC60 USD Cobertura Médica"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nº Confirmación / Póliza</label>
                                    <input
                                      type="text"
                                      value={item.details.confirmationNumber || ''}
                                      onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)}
                                      placeholder="Ej: POL-882319"
                                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* PLANTILLA DETALLE DE RESERVA DE LA AGENCIA Y LÍNEAS DE GASTOS ADICIONALES */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-4 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-orange-500" /> Detalle de Reserva y Neto a Proveedor
                                  </h4>
                                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">El Valor Neto a Pagar es el importe exacto a liquidar a {provider ? provider.name : 'este proveedor'}.</p>
                                </div>
                                <span className="px-2.5 py-1 bg-orange-50 text-orange-600 font-black text-[10px] uppercase rounded-md">Calculadora Directa</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total Comisionable</label>
                                  <NumericInput
                                    value={item.economics.totalComisionable || 0}
                                    onChange={val => updateItemEconomics(item.id, 'totalComisionable', val)}
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-900"
                                    placeholder="216.65"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Comisión</label>
                                  <NumericInput
                                    value={item.economics.comision || 0}
                                    onChange={val => updateItemEconomics(item.id, 'comision', val)}
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-emerald-600"
                                    placeholder="28.16"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">IVA</label>
                                  <NumericInput
                                    value={item.economics.iva || 0}
                                    onChange={val => updateItemEconomics(item.id, 'iva', val)}
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-800"
                                    placeholder="2.67"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Gastos Adm.</label>
                                  <NumericInput
                                    value={item.economics.gastosAdm || 0}
                                    onChange={val => updateItemEconomics(item.id, 'gastosAdm', val)}
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-800"
                                    placeholder="1.89"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Suplementos</label>
                                  <NumericInput
                                    value={item.economics.suplementos || 0}
                                    onChange={val => updateItemEconomics(item.id, 'suplementos', val)}
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-800"
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
                    (quote.payments || []).map(p => (
                      <div key={p.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
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
                            <button
                              type="button"
                              onClick={() => removePayment('payments', p.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all self-end cursor-pointer"
                              title="Eliminar registro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
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
                    (quote.providerPayments || []).map(p => (
                      <div key={p.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
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
                                // Auto sugiere el saldo pendiente de ese proveedor si el monto es 0
                                if (newOpId && p.amount === 0 && providerSummaryMap[newOpId]) {
                                  const pendingForOp = Math.max(0, providerSummaryMap[newOpId].totalNet - providerSummaryMap[newOpId].totalPaid)
                                  if (pendingForOp > 0) {
                                    updatePayment('providerPayments', p.id, 'amount', pendingForOp)
                                  }
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800"
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
                            <button
                              type="button"
                              onClick={() => removePayment('providerPayments', p.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all self-end cursor-pointer"
                              title="Eliminar registro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
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

    </div>
  )
}

export default ManualQuoteBuilder;
