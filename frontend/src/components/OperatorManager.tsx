import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Edit2, Shield, Mail, Phone, Percent, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

export function OperatorManager() {
  const [operators, setOperators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOperator, setEditingOperator] = useState<any>(null)
  
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

  const fetchOperators = async () => {
    try {
      const res = await axios.get('/api/operators')
      setOperators(res.data)
    } catch (e) {
      toast.error('Error al cargar operadores')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (op: any) => {
    setEditingOperator(op)
    setFormData({
      name: op.name,
      defaultCommissionPercentage: op.defaultCommissionPercentage,
      contactEmail: op.contactEmail || '',
      contactPhone: op.contactPhone || '',
      internalNotes: op.internalNotes || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este operador?')) return
    try {
      await axios.delete(`/api/operators/${id}`)
      toast.success('Operador eliminado')
      fetchOperators()
    } catch (e) {
      toast.error('Error al eliminar')
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
        toast.success('Operador creado')
      }
      setIsModalOpen(false)
      setEditingOperator(null)
      setFormData({ name: '', defaultCommissionPercentage: '', contactEmail: '', contactPhone: '', internalNotes: '' })
      fetchOperators()
    } catch (e) {
      toast.error('Error al guardar operador')
    }
  }

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3 transition-transform">
                  <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Central de Operadores</h1>
                  <p className="text-slate-500 font-medium text-sm">Gestión de Alianzas & Comisiones</p>
              </div>
          </div>
          <button 
            onClick={() => { setEditingOperator(null); setFormData({ name: '', defaultCommissionPercentage: '', contactEmail: '', contactPhone: '', internalNotes: '' }); setIsModalOpen(true) }}
            className="btn-primary !px-10 shadow-none"
          >
            <Plus className="w-5 h-5" /> Registrar Operador
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
           <div className="col-span-full py-24 text-center">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Shield className="w-8 h-8 text-slate-800" />
               </div>
               <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Consultando registros...</p>
           </div>
        ) : operators.length === 0 ? (
           <div className="col-span-full py-24 text-center">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <X className="w-8 h-8 text-slate-800" />
               </div>
               <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">No se encontraron operadores</p>
           </div>
        ) : operators.map(op => (
          <div key={op.id} className="premium-card group hover:shadow-blue-500/5 p-4">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all font-black text-lg shadow-inner">
                    {op.name.charAt(0)}
                </div>
                <div className="flex gap-1.5">
                    <button onClick={() => handleEdit(op)} className="secondary-button !w-8 !h-8 !p-0 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(op.id)} className="secondary-button !w-8 !h-8 !p-0 !text-red-500 hover:!bg-red-500/10 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
             </div>
             
             <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1 truncate">{op.name}</h3>
             <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4">
                 <Percent className="w-3 h-3" /> 
                 <span className="text-[9px] font-black uppercase tracking-widest">{op.defaultCommissionPercentage}% Master</span>
             </div>

             <div className="space-y-2 pt-4 border-t border-slate-100">
                {op.contactEmail && (
                    <div className="flex items-center gap-3 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-600" /> 
                        <span className="text-[11px] font-bold tracking-tight lowercase">{op.contactEmail}</span>
                    </div>
                )}
                {op.contactPhone && (
                    <div className="flex items-center gap-3 text-slate-600">
                        <Phone className="w-4 h-4 text-emerald-500" /> 
                        <span className="text-[11px] font-black uppercase tracking-widest">{op.contactPhone}</span>
                    </div>
                )}
             </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                            {editingOperator ? 'Actualizar Registro' : 'Nuevo Operador'}
                        </h3>
                        <p className="text-slate-500 font-medium text-sm mt-2">Configuración técnica de red</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                        <X className="w-5 h-5 text-slate-900" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">Razón Social / Nombre Comercial</label>
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="standard-input" placeholder="Ej: Catai, Travelplan..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">Comisión Base (%)</label>
                            <input type="number" step="0.1" value={formData.defaultCommissionPercentage} onChange={e => setFormData({...formData, defaultCommissionPercentage: e.target.value})} className="standard-input" placeholder="10.0" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest pl-1">WhatsApp / Central</label>
                            <input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="standard-input" placeholder="+54 9 11 ..." />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="section-label !mb-0 pl-1">Casilla de Reservas</label>
                        <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="standard-input lowercase" placeholder="reservas@operador.com" />
                    </div>

                    <div className="space-y-3">
                        <label className="section-label !mb-0 pl-1">Notas de Logística</label>
                        <textarea value={formData.internalNotes} onChange={e => setFormData({...formData, internalNotes: e.target.value})} className="standard-input min-h-[100px] !py-4 resize-none" placeholder="Días de pago, contacto comercial asignado..." />
                    </div>

                    <button type="submit" className="standard-button w-full !py-5 shadow-[0_20px_50px_rgba(249,115,22,0.2)]">
                        <Save className="w-5 h-5 mr-3" /> CONFIRMAR OPERADOR EN RED
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}
