import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { 
  Plus, Trash2, Edit2, Shield, Mail, Phone, Percent, Save, X, Search, 
  Building2, MessageCircle, FileText, Check, Copy, LayoutGrid, List,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export function OperatorManager() {
  const [operators, setOperators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table') // Default enlisted view
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOperator, setEditingOperator] = useState<any>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [formData, setFormData] = useState({
    name: '',
    defaultCommissionPercentage: '',
    contactEmail: '',
    contactPhone: '',
    internalNotes: ''
  })

  useEffect(() => {
    fetchOperators()
  }, [])

  // Reset to page 1 when search or items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, itemsPerPage])

  const fetchOperators = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/operators')
      setOperators(res.data || [])
    } catch (e) {
      toast.error('Error al cargar la lista de operadores')
    } finally {
      setLoading(false)
    }
  }

  // Filter strictly by operator name (and secondary fields if typed)
  const filteredOperators = useMemo(() => {
    if (!searchTerm.trim()) return operators
    const term = searchTerm.toLowerCase().trim()
    return operators.filter(op => 
      op.name?.toLowerCase().includes(term) ||
      op.contactEmail?.toLowerCase().includes(term) ||
      op.contactPhone?.includes(term)
    )
  }, [operators, searchTerm])

  // Calculate pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredOperators.length / itemsPerPage))
  const paginatedOperators = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredOperators.slice(start, start + itemsPerPage)
  }, [filteredOperators, currentPage, itemsPerPage])

  const stats = useMemo(() => {
    const total = operators.length
    const withCommission = operators.filter(o => Number(o.defaultCommissionPercentage) > 0)
    const avgCommission = withCommission.length > 0 
      ? (withCommission.reduce((acc, curr) => acc + Number(curr.defaultCommissionPercentage || 0), 0) / withCommission.length).toFixed(1) 
      : '0'
    const withContact = operators.filter(o => o.contactEmail || o.contactPhone).length
    return { total, avgCommission, withContact }
  }, [operators])

  const handleEdit = (op: any) => {
    setEditingOperator(op)
    setFormData({
      name: op.name,
      defaultCommissionPercentage: op.defaultCommissionPercentage || '',
      contactEmail: op.contactEmail || '',
      contactPhone: op.contactPhone || '',
      internalNotes: op.internalNotes || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${name}" de la base de operadores?`)) return
    try {
      await axios.delete(`/api/operators/${id}`)
      toast.success('Operador eliminado exitosamente')
      fetchOperators()
    } catch (e) {
      toast.error('Error al eliminar operador')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingOperator) {
        await axios.patch(`/api/operators/${editingOperator.id}`, formData)
        toast.success('Operador actualizado')
      } else {
        await axios.post('/api/operators', formData)
        toast.success('Operador registrado en el sistema')
      }
      setIsModalOpen(false)
      setEditingOperator(null)
      setFormData({ name: '', defaultCommissionPercentage: '', contactEmail: '', contactPhone: '', internalNotes: '' })
      fetchOperators()
    } catch (e) {
      toast.error('Error al guardar datos del operador')
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatPhoneForWhatsapp = (phone: string) => {
    return phone.replace(/[^0-9]/g, '')
  }

  // Calculate starting and ending index for pagination text
  const startItemIndex = filteredOperators.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItemIndex = Math.min(currentPage * itemsPerPage, filteredOperators.length)

  return (
    <div className="space-y-6 pb-32">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 text-white shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100">
                Base de Datos
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
              Proveedores / Operadores
            </h1>
            <p className="text-slate-500 font-medium text-xs">
              Directorio de operadores turísticos, comisiones y contactos directos.
            </p>
          </div>
        </div>

        <button 
          onClick={() => { 
            setEditingOperator(null); 
            setFormData({ name: '', defaultCommissionPercentage: '', contactEmail: '', contactPhone: '', internalNotes: '' }); 
            setIsModalOpen(true) 
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Nuevo Proveedor / Operador
        </button>
      </div>

      {/* Control Bar: Search Filter & View Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input for Operator Name */}
        <div className="relative w-full md:w-96 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input 
            type="text"
            placeholder="Filtrar por nombre de operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 focus:border-orange-500 focus:bg-white rounded-xl pl-10 pr-10 py-2 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter & View Switcher */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total <strong className="text-slate-800 font-black">{filteredOperators.length}</strong> registros
          </span>

          {/* View Toggle Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista enlistada (Tabla)"
            >
              <List className="w-3.5 h-3.5" /> Lista
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista tarjetas (Grid)"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando proveedores...</p>
        </div>
      ) : filteredOperators.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No se encontraron proveedores</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            {searchTerm ? `No se encontró ningún operador con el nombre "${searchTerm}"` : 'Agregá tu primer proveedor para comenzar.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* VISTA ENLISTADA (TABLA COMPACTA Y MODERNA) */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10.5px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Operador / Proveedor</th>
                  <th className="py-3.5 px-4 text-center">Comisión Master</th>
                  <th className="py-3.5 px-4">Email Reservas</th>
                  <th className="py-3.5 px-4">Teléfono / WhatsApp</th>
                  <th className="py-3.5 px-4">Notas Internas</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {paginatedOperators.map((op) => (
                  <tr key={op.id} className="hover:bg-orange-50/30 transition-colors group">
                    {/* Operator Name */}
                    <td className="py-3.5 px-5 font-black text-slate-900 uppercase tracking-tight text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-orange-500 shrink-0 opacity-80" />
                        <span>{op.name}</span>
                      </div>
                    </td>

                    {/* Commission */}
                    <td className="py-3.5 px-4 text-center">
                      {op.defaultCommissionPercentage !== null && op.defaultCommissionPercentage !== undefined ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                          <Percent className="w-3 h-3" /> {op.defaultCommissionPercentage}%
                        </span>
                      ) : (
                        <span className="text-slate-300 font-normal">-</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4">
                      {op.contactEmail ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`mailto:${op.contactEmail}`} className="hover:text-orange-600 hover:underline lowercase font-medium">
                            {op.contactEmail}
                          </a>
                          <button 
                            onClick={() => copyToClipboard(op.contactEmail, `email-${op.id}`)}
                            className="text-slate-300 hover:text-slate-600 p-0.5 transition-colors cursor-pointer"
                            title="Copiar mail"
                          >
                            {copiedId === `email-${op.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic font-normal text-[11px]">Sin email</span>
                      )}
                    </td>

                    {/* WhatsApp / Phone */}
                    <td className="py-3.5 px-4">
                      {op.contactPhone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold text-slate-800">{op.contactPhone}</span>
                          <a 
                            href={`https://wa.me/${formatPhoneForWhatsapp(op.contactPhone)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded-md transition-colors"
                            title="WhatsApp direct chat"
                          >
                            <MessageCircle className="w-3 h-3" /> Chat
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic font-normal text-[11px]">Sin teléfono</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {op.internalNotes ? (
                        <p className="truncate text-slate-500 text-[11px] font-normal" title={op.internalNotes}>
                          {op.internalNotes}
                        </p>
                      ) : (
                        <span className="text-slate-300 italic font-normal text-[11px]">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(op)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(op.id, op.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISTA DE TARJETAS (GRID) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedOperators.map((op) => (
            <div 
              key={op.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-orange-500/40 p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                      {op.name}
                    </h3>
                    {op.defaultCommissionPercentage !== null && op.defaultCommissionPercentage !== undefined && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 mt-1">
                        <Percent className="w-2.5 h-2.5" /> {op.defaultCommissionPercentage}% Com. Master
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => handleEdit(op)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar proveedor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(op.id, op.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar proveedor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contacts */}
                <div className="space-y-2 py-3 border-t border-slate-100">
                  {op.contactEmail ? (
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`mailto:${op.contactEmail}`} className="truncate font-medium text-slate-700 hover:text-orange-600 lowercase">
                          {op.contactEmail}
                        </a>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(op.contactEmail, `email-${op.id}`)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        title="Copiar email"
                      >
                        {copiedId === `email-${op.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : null}

                  {op.contactPhone ? (
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{op.contactPhone}</span>
                      </div>
                      <a 
                        href={`https://wa.me/${formatPhoneForWhatsapp(op.contactPhone)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/60 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded-lg transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" /> Chat
                      </a>
                    </div>
                  ) : null}

                  {!op.contactEmail && !op.contactPhone && (
                    <p className="text-[11px] text-slate-400 italic">Sin datos de contacto cargados</p>
                  )}
                </div>

                {/* Internal Notes */}
                {op.internalNotes && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Notas internas
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-amber-50/50 p-2 rounded-xl border border-amber-100/60 font-normal">
                      {op.internalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION CONTROLS BAR */}
      {filteredOperators.length > 0 && (
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left info & items per page selector */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>
              Mostrando <strong className="text-slate-900 font-bold">{startItemIndex} - {endItemIndex}</strong> de <strong className="text-slate-900 font-bold">{filteredOperators.length}</strong>
            </span>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Filas:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-orange-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right Page Navigation Buttons */}
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Primera página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous page */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            {/* Page indicator */}
            <div className="px-3 py-1.5 text-xs font-black text-slate-800 bg-slate-100 rounded-lg">
              {currentPage} / {totalPages}
            </div>

            {/* Next page */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide / Popup Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsModalOpen(false)} 
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {editingOperator ? 'Editar Proveedor / Operador' : 'Nuevo Proveedor / Operador'}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">Registrá los acuerdos comerciales de tu agencia.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider">
                  Razón Social / Nombre Comercial <span className="text-orange-500">*</span>
                </label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold outline-none transition-all" 
                  placeholder="Ej: Almundo, Julia Tours, Catai, Action Travel..." 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider">
                    Comisión Master (%)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1" 
                      value={formData.defaultCommissionPercentage} 
                      onChange={e => setFormData({...formData, defaultCommissionPercentage: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold outline-none transition-all pr-8" 
                      placeholder="12.0" 
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider">
                    Teléfono / WhatsApp
                  </label>
                  <input 
                    value={formData.contactPhone} 
                    onChange={e => setFormData({...formData, contactPhone: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold outline-none transition-all" 
                    placeholder="+54 9 11 1234 5678" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider">
                  Casilla de Email / Reservas
                </label>
                <input 
                  type="email" 
                  value={formData.contactEmail} 
                  onChange={e => setFormData({...formData, contactEmail: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold outline-none transition-all lowercase" 
                  placeholder="reservas@operador.com" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider">
                  Notas Internas / Operativa
                </label>
                <textarea 
                  value={formData.internalNotes} 
                  onChange={e => setFormData({...formData, internalNotes: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-800 font-semibold outline-none transition-all min-h-[90px] resize-none" 
                  placeholder="Días de pago, ejecutivos asignados, condiciones particulares..." 
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperatorManager
