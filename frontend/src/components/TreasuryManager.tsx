import { FormEvent, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowDownCircle, ArrowUpCircle, Landmark, Plus, Save, Trash2, Wallet } from 'lucide-react'

type Account = {
  id: string
  name: string
  currency: string
  initialBalance: number | string
  balance: number | string
}

type Transaction = {
  id: string
  accountId: string
  type: string
  category: string
  amount: number | string
  date: string
  reference: string
  relatedEntityType?: string
  relatedEntityId?: string
  paymentMethod?: string
  account?: Account | null
}

const todayDate = () => new Date().toISOString().slice(0, 10)
const asNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
const fmtMoney = (value: unknown) => asNumber(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function TreasuryManager() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [accountForm, setAccountForm] = useState({ name: '', currency: 'ARS', initialBalance: 0 })
  const [transactionForm, setTransactionForm] = useState({
    accountId: '',
    type: 'expense',
    category: 'provider_payment',
    amount: '',
    date: todayDate(),
    reference: '',
    relatedEntityType: '',
    relatedEntityId: '',
    paymentMethod: 'transfer',
  })

  useEffect(() => {
    fetchTreasury()
  }, [])

  const fetchTreasury = async () => {
    try {
      const [accountRes, transactionRes] = await Promise.all([
        axios.get('/api/treasury/accounts'),
        axios.get('/api/treasury/transactions'),
      ])
      const loadedAccounts = accountRes.data || []
      setAccounts(loadedAccounts)
      setTransactions(transactionRes.data || [])
      setTransactionForm(current => ({
        ...current,
        accountId: current.accountId || loadedAccounts[0]?.id || '',
      }))
    } catch (error) {
      toast.error('Error al cargar tesoreria')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = useMemo(() => {
    return selectedAccountId ? transactions.filter(tx => tx.accountId === selectedAccountId) : transactions
  }, [transactions, selectedAccountId])

  const totalsByCurrency = useMemo(() => {
    return accounts.reduce<Record<string, number>>((acc, account) => {
      acc[account.currency] = (acc[account.currency] || 0) + asNumber(account.balance)
      return acc
    }, {})
  }, [accounts])

  const movementSummary = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      if (tx.type === 'income') acc.income += asNumber(tx.amount)
      if (tx.type === 'expense') acc.expense += asNumber(tx.amount)
      return acc
    }, { income: 0, expense: 0 })
  }, [filteredTransactions])

  const saveAccount = async (event: FormEvent) => {
    event.preventDefault()
    if (!accountForm.name.trim()) return
    try {
      await axios.post('/api/treasury/accounts', accountForm)
      setAccountForm({ name: '', currency: 'ARS', initialBalance: 0 })
      await fetchTreasury()
      toast.success('Cuenta creada')
    } catch (error) {
      toast.error('Error al crear cuenta')
    }
  }

  const saveTransaction = async (event: FormEvent) => {
    event.preventDefault()
    if (!transactionForm.accountId || !transactionForm.amount) return
    try {
      await axios.post('/api/treasury/transactions', transactionForm)
      setTransactionForm(current => ({ ...current, amount: '', reference: '', relatedEntityId: '' }))
      await fetchTreasury()
      toast.success('Movimiento registrado')
    } catch (error) {
      toast.error('Error al registrar movimiento')
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Seguro que queres eliminar este movimiento?')) return
    try {
      await axios.delete(`/api/treasury/transactions/${id}`)
      await fetchTreasury()
      toast.success('Movimiento eliminado')
    } catch (error) {
      toast.error('Error al eliminar movimiento')
    }
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3">
            <Wallet className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="page-title">Tesoreria</h1>
            <p className="page-subtitle">Cuentas, gastos, ingresos y origen de fondos</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(totalsByCurrency).map(([currency, total]) => (
            <div key={currency} className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{currency}</span>
              <span className="font-black text-slate-900">{fmtMoney(total)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <aside className="xl:col-span-4 space-y-6">
          <section className="premium-card !rounded-2xl !p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.16em]">Cuentas</h2>
              <span className="badge badge-slate">{accounts.length}</span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedAccountId('')}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedAccountId === '' ? 'border-orange-300 bg-orange-50/60' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <p className="font-black text-slate-900">Todas las cuentas</p>
                <p className="text-xs text-slate-500">{transactions.length} movimientos</p>
              </button>
              {accounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedAccountId === account.id ? 'border-orange-300 bg-orange-50/60' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.currency}</p>
                    </div>
                    <p className="font-mono font-black text-slate-900">{fmtMoney(account.balance)}</p>
                  </div>
                </button>
              ))}
              {loading && <p className="p-6 text-center text-xs font-black uppercase tracking-widest text-slate-400">Cargando...</p>}
            </div>
          </section>

          <form onSubmit={saveAccount} className="premium-card !rounded-2xl !p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.16em]">Nueva cuenta</h2>
            <input className="standard-input" value={accountForm.name} onChange={event => setAccountForm(current => ({ ...current, name: event.target.value }))} placeholder="Nombre de cuenta" />
            <div className="grid grid-cols-2 gap-3">
              <select className="standard-input" value={accountForm.currency} onChange={event => setAccountForm(current => ({ ...current, currency: event.target.value }))}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <input className="standard-input" type="number" value={accountForm.initialBalance} onChange={event => setAccountForm(current => ({ ...current, initialBalance: Number(event.target.value) }))} placeholder="Saldo inicial" />
            </div>
            <button className="btn-primary w-full" type="submit">
              <Plus className="w-4 h-4" /> Crear cuenta
            </button>
          </form>
        </aside>

        <main className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="premium-card !rounded-2xl !p-5">
              <p className="section-label !mb-2">Ingresos</p>
              <p className="text-2xl font-black text-emerald-600">${fmtMoney(movementSummary.income)}</p>
            </div>
            <div className="premium-card !rounded-2xl !p-5">
              <p className="section-label !mb-2">Gastos</p>
              <p className="text-2xl font-black text-red-600">${fmtMoney(movementSummary.expense)}</p>
            </div>
            <div className="premium-card !rounded-2xl !p-5">
              <p className="section-label !mb-2">Resultado</p>
              <p className="text-2xl font-black text-slate-900">${fmtMoney(movementSummary.income - movementSummary.expense)}</p>
            </div>
          </div>

          <form onSubmit={saveTransaction} className="premium-card !rounded-2xl !p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.16em]">Registrar movimiento</h2>
              <button className="btn-primary" type="submit">
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select className="standard-input" value={transactionForm.accountId} onChange={event => setTransactionForm(current => ({ ...current, accountId: event.target.value }))}>
                <option value="">Cuenta</option>
                {accounts.map(account => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}
              </select>
              <select className="standard-input" value={transactionForm.type} onChange={event => setTransactionForm(current => ({ ...current, type: event.target.value }))}>
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </select>
              <select className="standard-input" value={transactionForm.category} onChange={event => setTransactionForm(current => ({ ...current, category: event.target.value }))}>
                <option value="client_payment">Cobro cliente</option>
                <option value="provider_payment">Pago proveedor</option>
                <option value="operating_expense">Gasto operativo</option>
                <option value="refund">Devolucion</option>
                <option value="transfer">Transferencia</option>
                <option value="other">Otro</option>
              </select>
              <input className="standard-input" type="number" value={transactionForm.amount} onChange={event => setTransactionForm(current => ({ ...current, amount: event.target.value }))} placeholder="Monto" />
              <input className="standard-input" type="date" value={transactionForm.date} onChange={event => setTransactionForm(current => ({ ...current, date: event.target.value }))} />
              <select className="standard-input" value={transactionForm.paymentMethod} onChange={event => setTransactionForm(current => ({ ...current, paymentMethod: event.target.value }))}>
                <option value="transfer">Transferencia</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="mp">Mercado Pago</option>
                <option value="other">Otro</option>
              </select>
              <input className="standard-input md:col-span-2" value={transactionForm.reference} onChange={event => setTransactionForm(current => ({ ...current, reference: event.target.value }))} placeholder="Referencia / de donde viene o a donde va" />
              <select className="standard-input" value={transactionForm.relatedEntityType} onChange={event => setTransactionForm(current => ({ ...current, relatedEntityType: event.target.value }))}>
                <option value="">Sin vinculo</option>
                <option value="ManualQuote">Cotizacion individual</option>
                <option value="GroupQuote">Cotizacion grupal</option>
                <option value="Sale">Venta</option>
                <option value="Provider">Proveedor</option>
                <option value="Other">Otro</option>
              </select>
            </div>
          </form>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.16em]">Movimientos</h2>
              <span className="badge badge-slate">{filteredTransactions.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cuenta</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Origen / destino</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Categoria</th>
                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Monto</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 && (
                    <tr><td colSpan={6} className="p-10 text-center text-xs font-black uppercase tracking-widest text-slate-400">No hay movimientos</td></tr>
                  )}
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 text-xs font-bold text-slate-600">{tx.date ? new Date(tx.date).toLocaleDateString('es-AR') : '-'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-black text-slate-800">{tx.account?.name || accounts.find(account => account.id === tx.accountId)?.name || 'Cuenta'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-800">{tx.reference || '-'}</p>
                        {tx.relatedEntityType && <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tx.relatedEntityType}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge badge-slate">{tx.category}</span>
                      </td>
                      <td className={`px-5 py-4 text-right font-mono font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        <span className="inline-flex items-center justify-end gap-2">
                          {tx.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                          {tx.type === 'income' ? '+' : '-'}${fmtMoney(tx.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => deleteTransaction(tx.id)} className="p-2 rounded-xl bg-slate-100 text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
