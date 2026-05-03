import { useState, useEffect } from 'react'
import axios from 'axios'
import { DollarSign, Calendar, User, TrendingUp, AlertCircle, CheckCircle2, History, CreditCard, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface SalesSummary {
    totalSold: number;
    totalCollected: number;
    totalPending: number;
}

export function SalesTracker() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SalesSummary>({ totalSold: 0, totalCollected: 0, totalPending: 0 })
  
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; saleId: string | null; amount: string; note: string }>({
    isOpen: false,
    saleId: null,
    amount: '',
    note: ''
  })

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const res = await axios.get('/api/sales')
      setSales(res.data)
      
      const stats = res.data.reduce((acc: SalesSummary, sale: any) => ({
        totalSold: acc.totalSold + Number(sale.totalAmount),
        totalCollected: acc.totalCollected + Number(sale.paidAmount),
        totalPending: acc.totalPending + (Number(sale.totalAmount) - Number(sale.paidAmount))
      }), { totalSold: 0, totalCollected: 0, totalPending: 0 })
      
      setSummary(stats)
    } catch (e) {
      toast.error('Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePayment = async () => {
    if (!paymentModal.saleId || !paymentModal.amount) return;
    try {
      await axios.post(`/api/sales/${paymentModal.saleId}/payment`, {
        amount: paymentModal.amount,
        note: paymentModal.note
      })
      toast.success('Pago registrado correctamente')
      setPaymentModal({ isOpen: false, saleId: null, amount: '', note: '' })
      fetchSales()
    } catch (e) {
      toast.error('Error al registrar pago')
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3 transition-transform">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                  <h1 className="page-title">Monitor de Ventas</h1>
                  <p className="page-subtitle">Rendimiento Comercial & Cobranzas</p>
              </div>
          </div>
          <div className="flex bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200">
                <span className="text-xl font-black text-slate-900 leading-none">{sales.length}</span>
                <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Transacciones</span>
          </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="premium-card group">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                    <History className="w-7 h-7" />
                </div>
                <div>
                    <p className="section-label !mb-1">Total Movimiento</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight uppercase">${summary.totalSold.toLocaleString()}</p>
                </div>
            </div>
        </div>
        <div className="premium-card group">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                    <p className="section-label !mb-1">Cobranza Realizada</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight uppercase">${summary.totalCollected.toLocaleString()}</p>
                </div>
            </div>
        </div>
        <div className="premium-card group">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                    <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                    <p className="section-label !mb-1">Deuda Pendiente</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight uppercase">${summary.totalPending.toLocaleString()}</p>
                </div>
            </div>
        </div>
      </div>

      {/* SALES LIST */}
      <div className="premium-card !p-0 overflow-hidden shadow-2xl relative">
        <div className="p-10 border-b border-slate-100 bg-white flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">
                   Libro Diario de Transacciones
                </h2>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-10 py-6 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Pasajero / Concepto</th>
                <th className="px-10 py-6 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Fecha</th>
                <th className="px-10 py-6 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Monto Total</th>
                <th className="px-10 py-6 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Estado Cobro</th>
                <th className="px-10 py-6 text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">Cargando datos...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">No hay ventas registradas aún.</td></tr>
              ) : sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {sale.passengerName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{sale.passengerName}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{sale.quote?.destination || 'CONCEPTO MANUAL'}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {sale.travelDate ? new Date(sale.travelDate).toLocaleDateString() : 'INDETERMINADA'}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                        <p className="text-base font-black text-slate-800 tracking-tight">{sale.currency} ${Number(sale.totalAmount).toLocaleString()}</p>
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Utilidad: <span className="text-emerald-500">+${(Number(sale.totalAmount) - Number(sale.quote?.financials?.netCost || 0)).toLocaleString()}</span></p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-3 max-w-[160px]">
                        <div className="flex justify-between items-end">
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${sale.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                {sale.paymentStatus === 'paid' ? 'SALDADO' : 'EN COBRO'}
                            </span>
                            <span className="text-[10px] font-black text-slate-500">
                                {Math.round((sale.paidAmount / sale.totalAmount) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                            <div 
                                className={`h-full transition-all duration-1000 ${sale.paymentStatus === 'paid' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-orange-500 shadow-[0_0_10px_#f97316]'}`} 
                                style={{ width: `${(sale.paidAmount / sale.totalAmount) * 100}%` }}
                            />
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                        onClick={() => setPaymentModal({ ...paymentModal, isOpen: true, saleId: sale.id })}
                        className="secondary-button !w-12 !h-12 !p-0 flex items-center justify-center mx-auto sm:ml-auto"
                    >
                        <CreditCard className="w-5 h-5 text-orange-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="premium-card p-8 w-full max-w-md bg-white border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-[1.1rem] bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 rotate-3">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Registrar Cobro</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monto del Pago</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="number"
                                autoFocus
                                value={paymentModal.amount}
                                onChange={e => setPaymentModal({...paymentModal, amount: e.target.value})}
                                className="w-full bg-slate-100 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 text-2xl font-black outline-none focus:border-orange-500/50" 
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Observaciones</label>
                        <textarea 
                            value={paymentModal.note}
                            onChange={e => setPaymentModal({...paymentModal, note: e.target.value})}
                            className="w-full bg-slate-100 border border-slate-200 p-4 rounded-2xl text-slate-800 text-sm h-20 outline-none focus:border-orange-500/50 resize-none" 
                            placeholder="Ejem: Pago seña banco Galicia..."
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={() => setPaymentModal({ isOpen: false, saleId: null, amount: '', note: '' })}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-4 rounded-2xl transition-all"
                        >
                            CANCELAR
                        </button>
                        <button 
                            onClick={handleUpdatePayment}
                            className="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-800 font-black py-4 rounded-2xl shadow-xl shadow-orange-900/40 transition-all"
                        >
                            ACEPTAR PAGO
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}
