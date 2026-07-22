import React, { FormEvent, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
    Calculator, CheckCircle2, Copy, DollarSign, Plus, Save, Trash2, Users, X, 
    Plane, Hotel, ShieldCheck, FileText, Clock, ChevronDown, Eye, History, ArrowRight,
    Utensils, Bus, Compass, Wallet, MessageSquare, Send, XCircle
} from 'lucide-react'

// --- TYPES ---
type Category = {
  id: string
  label: string
  value: number | string
  quantity: number | string
  priceMode: string
}

type GroupService = {
  id: string
  type: string
  description: string
  providerId?: string
  billingMode: string
  netUnitCost: number | string
  quantity: number | string
  liberados: number | string
  currency: string
  commission: number | string
  commissionMode: string
  optional: boolean
  notes: string
  categories: Category[]
}

type Payment = {
  id: string
  date: string
  amount: number | string
  method: string
  reference: string
  providerId?: string
}

type GroupQuoteForm = {
  id: string | null
  quoteNumber: string
  groupName: string
  clientName: string
  project: string
  destination: string
  startDate: string
  endDate: string
  validUntil: string
  pax: number | string
  currency: string
  globalCommission: number | string
  commissionMode: string
  priceOverride: number | string
  status: string
  includes: string
  excludes: string
  observations: string
  clientNotes: string
  services: GroupService[]
  payments: Payment[]
  providerPayments: Payment[]
}

// --- UTILS ---
const today = () => new Date().toISOString().slice(0, 10)
const uid = () => Math.random().toString(36).slice(2, 11)
const money = (value: number) => value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const num = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const emptyService = (type = 'hotel'): GroupService => ({
  id: uid(),
  type,
  description: type === 'hotel' ? 'Alojamiento Grupal' : type === 'transport' ? 'Pasajes Aéreos / Bus' : type === 'excursion' ? 'Excursión / Tour Privado' : type === 'meal' ? 'Servicio de Gastronomía' : 'Servicio Adicional',
  providerId: '',
  billingMode: 'per_person',
  netUnitCost: 0,
  quantity: 1,
  liberados: 0,
  currency: 'USD',
  commission: 10,
  commissionMode: 'percent',
  optional: false,
  notes: '',
  categories: [],
})

const emptyForm = (): GroupQuoteForm => ({
  id: null,
  quoteNumber: '',
  groupName: '',
  clientName: '',
  project: '',
  destination: '',
  startDate: '',
  endDate: '',
  validUntil: '',
  pax: 20,
  currency: 'USD',
  globalCommission: 15,
  commissionMode: 'percent',
  priceOverride: '',
  status: 'draft',
  includes: '✓ Hotelería con régimen especificado\n✓ Traslados privados para todo el grupo\n✓ Guía acompañante en destino',
  excludes: '✗ Gastos personales y propinas\n✗ Comidas no especificadas',
  observations: '',
  clientNotes: '',
  services: [],
  payments: [],
  providerPayments: [],
})

const normalizeQuote = (quote: any): GroupQuoteForm => ({
  ...emptyForm(),
  ...quote,
  id: quote.id || null,
  quoteNumber: quote.quoteNumber || '',
  groupName: quote.groupName || '',
  clientName: quote.clientName || '',
  project: quote.project || '',
  destination: quote.destination || '',
  startDate: quote.startDate || '',
  endDate: quote.endDate || '',
  validUntil: quote.validUntil || '',
  currency: quote.currency || 'USD',
  priceOverride: quote.priceOverride ?? '',
  services: Array.isArray(quote.services) ? quote.services.map((service: any) => ({
    ...emptyService(service.type || 'hotel'),
    ...service,
    id: service.id || uid(),
    categories: Array.isArray(service.categories) ? service.categories.map((category: any) => ({
      id: category.id || uid(),
      label: category.label || '',
      value: category.value ?? 0,
      quantity: category.quantity ?? 0,
      priceMode: category.priceMode || 'fixed',
    })) : [],
  })) : [],
  payments: Array.isArray(quote.payments) ? quote.payments.map((payment: any) => ({ id: payment.id || uid(), date: payment.date || today(), amount: payment.amount ?? 0, method: payment.method || 'transfer', reference: payment.reference || '' })) : [],
  providerPayments: Array.isArray(quote.providerPayments) ? quote.providerPayments.map((payment: any) => ({ id: payment.id || uid(), date: payment.date || today(), amount: payment.amount ?? 0, method: payment.method || 'transfer', reference: payment.reference || '', providerId: payment.providerId || '' })) : [],
})

const calculateGroup = (quote: GroupQuoteForm) => {
  const pax = Math.max(0, Math.round(num(quote.pax)))
  let totalNet = 0
  let serviceProfit = 0
  let liberatedPax = 0

  quote.services.forEach(service => {
    const liberados = Math.max(0, Math.round(num(service.liberados)))
    const zeroCategoryPax = service.categories.reduce((sum, category) => {
      const label = String(category.label || '').toLowerCase()
      const isLiberado = label.includes('liberado') || num(category.value) === 0
      return isLiberado ? sum + Math.max(0, Math.round(num(category.quantity))) : sum
    }, 0)
    liberatedPax = Math.max(liberatedPax, liberados, zeroCategoryPax)

    const categoryTotal = service.categories.reduce((sum, category) => sum + num(category.value) * Math.max(0, num(category.quantity)), 0)
    let serviceNet = 0
    if (service.categories.length > 0) {
      serviceNet = categoryTotal
    } else if (service.billingMode === 'per_group') {
      serviceNet = num(service.netUnitCost) * Math.max(1, num(service.quantity) || 1)
    } else {
      serviceNet = num(service.netUnitCost) * Math.max(0, pax - liberados)
    }

    const commission = num(service.commission)
    serviceProfit += service.commissionMode === 'fixed' ? commission : serviceNet * (commission / 100)
    totalNet += serviceNet
  })

  const paidPax = Math.max(0, pax - liberatedPax)
  const override = num(quote.priceOverride)
  if (override > 0) {
    return {
      paidPax,
      liberatedPax,
      totalNet,
      totalSelling: override * (paidPax || pax || 1),
      totalPerPerson: override,
      totalProfit: (override * (paidPax || pax || 1)) - totalNet
    }
  }

  const globalCommission = num(quote.globalCommission)
  const globalProfit = quote.commissionMode === 'fixed'
    ? globalCommission * (paidPax || 1)
    : totalNet * (globalCommission / 100)
  const totalSelling = Math.ceil(totalNet + serviceProfit + globalProfit)
  return {
    paidPax,
    liberatedPax,
    totalNet,
    totalSelling,
    totalProfit: totalSelling - totalNet,
    totalPerPerson: paidPax > 0 ? Math.ceil(totalSelling / paidPax) : totalSelling,
  }
}

export function GroupQuoteManager() {
  const [viewMode, setViewMode] = useState<'builder' | 'list'>('builder')
  const [quotes, setQuotes] = useState<GroupQuoteForm[]>([])
  const [operators, setOperators] = useState<any[]>([])
  const [form, setForm] = useState<GroupQuoteForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [whatsappText, setWhatsappText] = useState('')
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)

  const totals = useMemo(() => calculateGroup(form), [form])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [quoteRes, operatorRes] = await Promise.all([
        axios.get('/api/group-quotes'),
        axios.get('/api/operators'),
      ])
      const loadedQuotes = (quoteRes.data || []).map(normalizeQuote)
      setQuotes(loadedQuotes)
      setOperators(operatorRes.data || [])
      if (loadedQuotes.length > 0) setForm(loadedQuotes[0])
    } catch (error) {
      toast.error('Error al cargar cotizaciones grupales')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (key: keyof GroupQuoteForm, value: any) => {
    setForm(current => ({ ...current, [key]: value }))
  }

  const updateService = (serviceId: string, key: keyof GroupService, value: any) => {
    setForm(current => ({
      ...current,
      services: current.services.map(service => service.id === serviceId ? { ...service, [key]: value } : service),
    }))
  }

  const updateCategory = (serviceId: string, categoryId: string, key: keyof Category, value: any) => {
    setForm(current => ({
      ...current,
      services: current.services.map(service => service.id === serviceId ? {
        ...service,
        categories: service.categories.map(category => category.id === categoryId ? { ...category, [key]: value } : category),
      } : service),
    }))
  }

  const addService = (type: string) => {
    const s = emptyService(type)
    setForm(current => ({ ...current, services: [...current.services, s] }))
    setExpandedServiceId(s.id)
    toast.success('Servicio agregado al grupo')
  }

  const addCategory = (serviceId: string) => {
    setForm(current => ({
      ...current,
      services: current.services.map(service => service.id === serviceId ? {
        ...service,
        categories: [...service.categories, { id: uid(), label: 'Categoría Pax', value: 0, quantity: 1, priceMode: 'fixed' }],
      } : service),
    }))
  }

  const removeCategory = (serviceId: string, categoryId: string) => {
    setForm(current => ({
      ...current,
      services: current.services.map(service => service.id === serviceId ? {
        ...service,
        categories: service.categories.filter(category => category.id !== categoryId),
      } : service),
    }))
  }

  const updatePayment = (kind: 'payments' | 'providerPayments', paymentId: string, key: keyof Payment, value: any) => {
    setForm(current => ({
      ...current,
      [kind]: current[kind].map(payment => payment.id === paymentId ? { ...payment, [key]: value } : payment),
    }))
  }

  const addPayment = (kind: 'payments' | 'providerPayments') => {
    setForm(current => ({
      ...current,
      [kind]: [...current[kind], { id: uid(), date: today(), amount: 0, method: 'transfer', reference: '', providerId: '' }],
    }))
  }

  const removePayment = (kind: 'payments' | 'providerPayments', paymentId: string) => {
    setForm(current => ({
      ...current,
      [kind]: current[kind].filter(payment => payment.id !== paymentId),
    }))
  }

  const saveQuote = async (event?: FormEvent) => {
    if (event) event.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        totalNet: totals.totalNet,
        totalSelling: totals.totalSelling,
        totalPerPerson: totals.totalPerPerson,
      }
      const response = form.id
        ? await axios.patch(`/api/group-quotes/${form.id}`, payload)
        : await axios.post('/api/group-quotes', payload)
      const saved = normalizeQuote(response.data)
      setForm(saved)
      setQuotes(current => [saved, ...current.filter(quote => quote.id !== saved.id)])
      toast.success('Cotización grupal guardada exitosamente')
    } catch (error) {
      toast.error('Error al guardar cotización grupal')
    } finally {
      setSaving(false)
    }
  }

  const deleteQuote = async () => {
    if (!form.id || !confirm('¿Seguro que querés eliminar esta cotización grupal?')) return
    try {
      await axios.delete(`/api/group-quotes/${form.id}`)
      const remaining = quotes.filter(quote => quote.id !== form.id)
      setQuotes(remaining)
      setForm(remaining[0] || emptyForm())
      toast.success('Cotización grupal eliminada')
    } catch (error) {
      toast.error('Error al eliminar cotización')
    }
  }

  const generateWhatsapp = async () => {
    try {
      const response = await axios.post('/api/group-quotes/generate-whatsapp', { quoteData: form })
      const text = response.data.text || ''
      setWhatsappText(text)
      await navigator.clipboard?.writeText(text)
      toast.success('Itinerario para WhatsApp copiado al portapapeles')
    } catch (error) {
      toast.error('Error al generar texto para WhatsApp')
    }
  }

  const totalCollected = form.payments.reduce((sum, payment) => sum + num(payment.amount), 0)
  const totalProviderPaid = form.providerPayments.reduce((sum, payment) => sum + num(payment.amount), 0)

  const handleSelectQuote = (q: GroupQuoteForm) => {
    setForm(q)
    setViewMode('builder')
    setWhatsappText('')
    toast.success(`Grupo cargado: ${q.groupName || 'Cotización Grupal'}`)
  }

  const handleCreateNewGroup = () => {
    setForm(emptyForm())
    setViewMode('builder')
    setWhatsappText('')
  }

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
            <History className="w-4 h-4" /> Historial de Grupos ({quotes.length})
          </button>
          <button
            onClick={() => setViewMode('builder')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'builder' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" /> {form.id ? 'Editando Cotización Grupal' : 'Nueva Cotización Grupal'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={generateWhatsapp} className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-black text-xs uppercase tracking-wider rounded-xl border border-emerald-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs">
            <MessageSquare className="w-4 h-4" /> Copiar WhatsApp
          </button>
          {form.id && (
            <button onClick={deleteQuote} className="px-4 py-2.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-black text-xs uppercase tracking-wider rounded-xl border border-red-200 transition-all flex items-center gap-2 cursor-pointer shadow-xs">
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        /* VISTA LISTADO DE GRUPOS */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Listado de Cotizaciones Grupales</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Gestión integral de viajes grupales, giras de estudios, eventos y salidas acompañadas.</p>
            </div>
            <button
              onClick={handleCreateNewGroup}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" /> Crear Nueva Cotización Grupal
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Cargando grupos...</p>
            </div>
          ) : quotes.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl p-8 space-y-2">
              <Calculator className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No hay cotizaciones grupales creadas</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Creá tu primera cotización grupal para desglosar liberados, comisiones y costos por pax.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quotes.map(q => {
                const qTotals = calculateGroup(q)
                const ST_CFG: any = {
                  draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-600' },
                  sent: { label: 'Enviada', cls: 'bg-blue-100 text-blue-700' },
                  confirmed: { label: 'Confirmada', cls: 'bg-emerald-100 text-emerald-700' },
                  lost: { label: 'Perdida', cls: 'bg-red-100 text-red-700' }
                }
                const st = ST_CFG[q.status] || ST_CFG.draft

                return (
                  <div
                    key={q.id || q.quoteNumber}
                    onClick={() => handleSelectQuote(q)}
                    className="p-5 rounded-2xl border border-slate-200/80 hover:border-orange-300 transition-all hover:shadow-md bg-white flex flex-col justify-between space-y-4 cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.quoteNumber || 'REF: GRUPO'}</span>
                        <span className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-md ${st.cls}`}>{st.label}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-base group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                        {q.groupName || q.clientName || 'Grupo sin nombre'}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Destino: <strong className="text-slate-800">{q.destination || 'Por definir'}</strong> · {q.pax || 0} Pasajeros
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[9.5px] font-bold text-slate-400 uppercase">Venta por Pax</p>
                        <p className="font-black text-orange-600 text-base leading-tight">{q.currency} {money(qTotals.totalPerPerson)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9.5px] font-bold text-slate-400 uppercase">Venta Total Grupo</p>
                        <p className="font-black text-slate-900 text-xs">{q.currency} {money(qTotals.totalSelling)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* VISTA FORMULARIO COTIZADOR GRUPAL */
        <div className="space-y-8">
          
          {/* HEADER DEL COTIZADOR GRUPAL */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cotizador de Grupos</h1>
                <p className="text-xs text-slate-500 font-semibold">Cálculo Inteligente de Liberados, Márgenes y Costo por Pasajero</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* MONEDA */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {(['USD', 'ARS', 'EUR'] as const).map(curr => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => updateField('currency', curr)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      form.currency === curr ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={saveQuote}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Grupo'}
              </button>
            </div>
          </div>

          {/* STATUS PIPELINE FOR GROUPS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 mb-4">Estado del Grupo / Pipeline Comercial</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'draft', label: 'Borrador', icon: FileText, activeCls: 'bg-slate-900 text-white border-slate-900' },
                { id: 'sent', label: 'Enviada', icon: Send, activeCls: 'bg-blue-600 text-white border-blue-600' },
                { id: 'confirmed', label: 'Confirmada', icon: CheckCircle2, activeCls: 'bg-emerald-600 text-white border-emerald-600' },
                { id: 'lost', label: 'Perdida', icon: XCircle, activeCls: 'bg-red-600 text-white border-red-600' }
              ].map(st => {
                const isActive = form.status === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => updateField('status', st.id)}
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

          {/* METRICS CARDS BANNER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pasajeros Pagantes / Liberados</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totals.paidPax} <span className="text-xs font-bold text-slate-500">Pagantes (+{totals.liberatedPax} Lib.)</span></p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Neto Total Grupo</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{form.currency} {money(totals.totalNet)}</p>
            </div>
            <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-5 rounded-2xl text-white shadow-md shadow-orange-500/20">
              <p className="text-[10px] font-black uppercase text-orange-100 tracking-wider">Venta por Pasajero</p>
              <p className="text-2xl font-black mt-1">{form.currency} {money(totals.totalPerPerson)}</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-2xs">
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Ganancia Bruta Estimada</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">+{form.currency} {money(totals.totalProfit)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* MAIN FORM COLUMN */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* GENERAL DATA */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Datos del Grupo & Proyecto</h3>
                    <p className="text-xs text-slate-500 font-medium">Información de la institución, contingente y fechas del viaje.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Nombre del Grupo / Contingente</label>
                    <input
                      value={form.groupName}
                      onChange={e => updateField('groupName', e.target.value)}
                      placeholder="Ej: Gira de Estudios Colegio San Martín"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Cliente / Institución / Encargado</label>
                    <input
                      value={form.clientName}
                      onChange={e => updateField('clientName', e.target.value)}
                      placeholder="Ej: Asociación de Padres / Coord. Juan Pérez"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Destino Principal</label>
                    <input
                      value={form.destination}
                      onChange={e => updateField('destination', e.target.value)}
                      placeholder="Ej: Bariloche / Brasil / Europa"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Pasajeros Totales (Pax)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.pax}
                      onChange={e => updateField('pax', e.target.value)}
                      placeholder="Ej: 30"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-black text-slate-900 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Nombre del Proyecto</label>
                    <input
                      value={form.project}
                      onChange={e => updateField('project', e.target.value)}
                      placeholder="Ej: Egresados 2026"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Fecha de Salida</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => updateField('startDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Fecha de Regreso</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={e => updateField('endDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SERVICIOS DEL GRUPO */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-400">Agregar Servicios al Grupo</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { type: 'hotel', label: 'ALOJAMIENTO', icon: Hotel, bg: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-200/70' },
                    { type: 'transport', label: 'TRANSPORTE', icon: Bus, bg: 'bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white border-sky-200/70' },
                    { type: 'excursion', label: 'EXCURSIONES', icon: Compass, bg: 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border-amber-200/70' },
                    { type: 'meal', label: 'GASTRONOMÍA', icon: Utensils, bg: 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border-orange-200/70' },
                    { type: 'assistance', label: 'ASISTENCIAS', icon: ShieldCheck, bg: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border-indigo-200/70' },
                    { type: 'other', label: 'OTROS', icon: Plus, bg: 'bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white border-slate-200' }
                  ].map(btn => (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => addService(btn.type)}
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

              {/* LISTADO DE SERVICIOS GRUPALES CARGADOS */}
              <div className="space-y-4">
                {form.services.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                    <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-black uppercase text-slate-800">No hay servicios cargados en el grupo</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Seleccioná un tipo de servicio de los botones superiores para armar la estructura de costos del grupo.</p>
                  </div>
                ) : (
                  form.services.map(service => {
                    const provider = operators.find(op => op.id === service.providerId)
                    const isExpanded = expandedServiceId === service.id

                    return (
                      <div key={service.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                        
                        {/* SERVICE HEADER */}
                        <div
                          onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-all border-b border-slate-100"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black">
                              {service.type === 'hotel' ? <Hotel className="w-5 h-5" /> :
                               service.type === 'transport' ? <Bus className="w-5 h-5" /> :
                               service.type === 'excursion' ? <Compass className="w-5 h-5" /> :
                               service.type === 'meal' ? <Utensils className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 uppercase">
                                {service.description || 'Servicio Grupal'}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                Mode: <strong className="text-slate-800">{service.billingMode === 'per_group' ? 'Por Grupo' : 'Por Persona'}</strong> · Provider: <strong className="text-slate-800">{provider ? provider.name : 'Sin Proveedor'}</strong> · Liberados: {service.liberados || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-[9.5px] font-bold text-slate-400 uppercase">Neto Unitario</p>
                              <p className="text-sm font-black text-slate-900">{form.currency} {money(num(service.netUnitCost))}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm(curr => ({ ...curr, services: curr.services.filter(s => s.id !== service.id) }))
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* SERVICE BODY EXPANDED */}
                        {isExpanded && (
                          <div className="p-6 bg-slate-50/70 border-t border-slate-100 space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Descripción del Servicio</label>
                                <input
                                  value={service.description}
                                  onChange={e => updateService(service.id, 'description', e.target.value)}
                                  placeholder="Ej: Hotelería 7 noches All Inclusive"
                                  className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Proveedor / Operador</label>
                                <select
                                  value={service.providerId || ''}
                                  onChange={e => updateService(service.id, 'providerId', e.target.value)}
                                  className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                >
                                  <option value="">Sin proveedor</option>
                                  {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Modo de Facturación</label>
                                <select
                                  value={service.billingMode}
                                  onChange={e => updateService(service.id, 'billingMode', e.target.value)}
                                  className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                >
                                  <option value="per_person">Por Persona</option>
                                  <option value="per_group">Por Grupo Total</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Costo Neto Unitario ({form.currency})</label>
                                <input
                                  type="number"
                                  value={service.netUnitCost}
                                  onChange={e => updateService(service.id, 'netUnitCost', e.target.value)}
                                  className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Pax Liberados (Gratis)</label>
                                <input
                                  type="number"
                                  value={service.liberados}
                                  onChange={e => updateService(service.id, 'liberados', e.target.value)}
                                  className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Comisión del Servicio</label>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    value={service.commission}
                                    onChange={e => updateService(service.id, 'commission', e.target.value)}
                                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                  />
                                  <select
                                    value={service.commissionMode}
                                    onChange={e => updateService(service.id, 'commissionMode', e.target.value)}
                                    className="bg-white border border-slate-200 px-2 py-2 rounded-xl text-xs font-bold text-slate-800 outline-none"
                                  >
                                    <option value="percent">%</option>
                                    <option value="fixed">Fijo</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* CATEGORÍAS DE TARIFAS POR HABITACIÓN / PAX */}
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-black uppercase text-slate-800">Desglose de Categorías y Tipos de Habitación</span>
                                <button type="button" onClick={() => addCategory(service.id)} className="text-[10.5px] font-black uppercase text-orange-600 hover:text-orange-700">
                                  + Agregar Categoría
                                </button>
                              </div>
                              {service.categories.map(cat => (
                                <div key={cat.id} className="grid grid-cols-12 gap-2 items-center">
                                  <input
                                    value={cat.label}
                                    onChange={e => updateCategory(service.id, cat.id, 'label', e.target.value)}
                                    placeholder="Ej: Habitación Doble / Liberado"
                                    className="col-span-6 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                  />
                                  <input
                                    type="number"
                                    value={cat.quantity}
                                    onChange={e => updateCategory(service.id, cat.id, 'quantity', e.target.value)}
                                    placeholder="Cant Pax"
                                    className="col-span-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                  />
                                  <input
                                    type="number"
                                    value={cat.value}
                                    onChange={e => updateCategory(service.id, cat.id, 'value', e.target.value)}
                                    placeholder="Precio"
                                    className="col-span-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeCategory(service.id, cat.id)}
                                    className="col-span-1 p-2 text-slate-400 hover:text-red-600 rounded-xl"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                          </div>
                        )}

                      </div>
                    )
                  })
                )}
              </div>

              {/* COBROS Y PAGOS REGISTRADOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PaymentPanel
                  title="Cobros del Grupo (Ingresos)"
                  items={form.payments}
                  operators={operators}
                  showProvider={false}
                  total={totalCollected}
                  onAdd={() => addPayment('payments')}
                  onUpdate={(id, key, value) => updatePayment('payments', id, key, value)}
                  onRemove={id => removePayment('payments', id)}
                />
                <PaymentPanel
                  title="Pagos a Proveedores (Egresos)"
                  items={form.providerPayments}
                  operators={operators}
                  showProvider
                  total={totalProviderPaid}
                  onAdd={() => addPayment('providerPayments')}
                  onUpdate={(id, key, value) => updatePayment('providerPayments', id, key, value)}
                  onRemove={id => removePayment('providerPayments', id)}
                />
              </div>

              {/* INCLUYE / EXCLUYE Y TEXTO WHATSAPP */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Servicios Incluidos (para presupuesto)</label>
                    <textarea
                      value={form.includes}
                      onChange={e => updateField('includes', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 min-h-[100px] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">No Incluye</label>
                    <textarea
                      value={form.excludes}
                      onChange={e => updateField('excludes', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 min-h-[100px] outline-none"
                    />
                  </div>
                </div>

                {whatsappText && (
                  <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase">
                      <CheckCircle2 className="w-4 h-4" /> Texto Generado para Enviar por WhatsApp
                    </div>
                    <pre className="whitespace-pre-wrap text-xs text-slate-800 font-mono bg-white p-4 rounded-xl border border-emerald-100 max-h-60 overflow-y-auto">
                      {whatsappText}
                    </pre>
                  </div>
                )}
              </div>

            </div>

            {/* SIDEBAR CONSOLIDADO FINAL GRUPAL STICKY */}
            <div className="xl:col-span-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg sticky top-8 space-y-6">
                
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-orange-500" /> Consolidado del Grupo
                </h3>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Neto Total Grupo</p>
                    <p className="text-lg font-black text-slate-900">{form.currency} {money(totals.totalNet)}</p>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Ganancia Bruta Estimada</p>
                    <p className="text-lg font-black text-emerald-700">+{form.currency} {money(totals.totalProfit)}</p>
                  </div>

                  <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-5 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                    <p className="text-[10px] font-black uppercase text-orange-100">Precio Final por Pasajero</p>
                    <p className="text-2xl font-black">{form.currency} {money(totals.totalPerPerson)}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Comisión Global (%)</label>
                    <input
                      type="number"
                      value={form.globalCommission}
                      onChange={e => updateField('globalCommission', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Forzar Precio Final por Pax</label>
                    <input
                      type="number"
                      value={form.priceOverride}
                      onChange={e => updateField('priceOverride', e.target.value)}
                      placeholder="Dejar vacío para cálculo automático"
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveQuote}
                  disabled={saving}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Cotización Grupal'}
                </button>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

function PaymentPanel({
  title,
  items,
  operators,
  showProvider,
  total,
  onAdd,
  onUpdate,
  onRemove,
}: {
  title: string
  items: Payment[]
  operators: any[]
  showProvider?: boolean
  total: number
  onAdd: () => void
  onUpdate: (id: string, key: keyof Payment, value: string | number) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{title}</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">Total registrado: ${money(total)}</p>
        </div>
        <button type="button" onClick={onAdd} className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-500 hover:text-white transition-all cursor-pointer">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs font-bold text-slate-400 italic py-2">Sin movimientos de pago cargados.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={item.date} onChange={e => onUpdate(item.id, 'date', e.target.value)} className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold" />
                <input type="number" value={item.amount} onChange={e => onUpdate(item.id, 'amount', e.target.value)} placeholder="Monto" className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold" />
              </div>
              <div className="flex gap-2">
                <input value={item.reference} onChange={e => onUpdate(item.id, 'reference', e.target.value)} placeholder="Referencia / N° Transacción" className="flex-1 bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold" />
                <button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GroupQuoteManager;
