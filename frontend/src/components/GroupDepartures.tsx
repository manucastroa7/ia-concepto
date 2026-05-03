import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Upload, Plus, MessageSquare, Download, Trash2, RefreshCw, Copy, Check, X, Globe, Star, Plane } from 'lucide-react'
import toast from 'react-hot-toast'

const initialForm = {
  operator: '', destination: '', title: '', departureDate: '', returnDate: '',
  price: '', currency: 'USD', inclusions: '', capacity: '', deadline: '', guide: ''
}

export function GroupDepartures() {
  const [departures, setDepartures] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [copied, setCopied] = useState(false)
  const [showFlyer, setShowFlyer] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchDepartures() }, [])

  const fetchDepartures = async () => {
    try {
      const r = await axios.get('/api/departures')
      setDepartures(r.data)
    } catch (e) { console.error(e) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = { ...formData, inclusions: formData.inclusions.split('\n').filter(Boolean) }
      const r = await axios.post('/api/departures', body)
      setDepartures(d => [r.data.departure, ...d])
      setSelected({ departure: r.data.departure, whatsapp: r.data.whatsapp, flyerHtml: r.data.flyerHtml })
      setShowForm(false)
      setFormData(initialForm)
      toast.success("Guardado exitosamente")
    } catch (e: any) {
      toast.error('Error: ' + (e.response?.data?.message || e.message))
    } finally { setSaving(false) }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const r = await axios.post('/api/departures/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDepartures(d => [r.data.departure, ...d])
      setSelected({ departure: r.data.departure, whatsapp: r.data.whatsapp, flyerHtml: r.data.flyerHtml })
      setFile(null)
      inputRef.current && (inputRef.current.value = "")
      toast.success("Salida cargada por IA")
    } catch (e: any) {
      toast.error('Error: ' + (e.response?.data?.message || e.message))
    } finally { setUploading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseás eliminar esta salida grupal?")) return;
    try {
      await axios.delete(`/api/departures/${id}`)
      setDepartures(d => d.filter(x => x.id !== id))
      if (selected?.departure?.id === id) setSelected(null)
      toast.success("Salida grupal eliminada exitosamente")
    } catch (e: any) { 
      toast.error("Error al eliminar salida grupal")
    }
  }

  const handleRegenerate = async (id: string) => {
    try {
      const idToast = toast.loading('Regenerando...');
      const r = await axios.post(`/api/departures/${id}/regenerate`)
      setSelected((prev: any) => ({ ...prev, ...r.data }))
      toast.success('Contenido regenerado', { id: idToast })
    } catch (e: any) { toast.error('Error: ' + e.message) }
  }

  const toggleWebPublish = async (id: string, currentStatus: boolean, webCategory: string) => {
    try {
      const res = await axios.put(`/api/departures/${id}/publish`, {
        isPublished: !currentStatus,
        webCategory: webCategory || 'SPORTS'
      });
      toast.success(!currentStatus ? "¡Publicado en la Web!" : "Removido de la web");
      setDepartures(departures.map(x => x.id === id ? res.data.departure : x));
      if (selected?.departure?.id === id) {
          setSelected({ ...selected, departure: res.data.departure });
      }
    } catch (e: any) {
      toast.error("No se pudo actualizar el estado de publicación.");
    }
  }

  const copy = () => {
    if (selected?.whatsapp) {
      navigator.clipboard.writeText(selected.whatsapp)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadFlyer = () => {
    const html = selected?.flyerHtml
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `salida-${selected?.departure?.destination || 'grupal'}.html`
    a.click()
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3 transition-transform">
            <Plane className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="page-title">Salidas Grupales</h1>
            <p className="page-subtitle">Calendario de Operaciones Propias</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200">
            <span className="text-xl font-black text-slate-900 leading-none">{departures.length}</span>
            <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Salidas</span>
          </div>
          <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
          <button 
             onClick={() => inputRef.current?.click()}
             className="btn-primary !px-8 shadow-none"
          >
            <Upload className="w-5 h-5" /> Subir Archivo
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-secondary !px-8 shadow-none"
          >
            <Plus className="w-5 h-5" /> Nueva Manual
          </button>
        </div>
      </div>

      {file && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row items-end md:items-center gap-4 animate-in zoom-in-95">
          <div className="flex items-center gap-3 flex-1 min-w-0">
             <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500"><Upload className="w-4 h-4" /></div>
             <div className="min-w-0">
               <span className="text-[11px] text-indigo-900 font-bold block truncate">{file.name}</span>
               <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">Listo para AI Extract</span>
             </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setFile(null)} className="flex-1 md:flex-none text-slate-400 font-bold text-xs hover:text-slate-600 px-3 py-2 bg-white rounded-lg">Cancelar</button>
            <button onClick={handleUpload} disabled={uploading}
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] uppercase tracking-widest font-black px-5 py-2 rounded-lg shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Procesando AI</> : '💡 Extraer'}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Nueva Salida Grupal</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 bg-slate-50 p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {[
              { label: 'Operadora *', key: 'operator', placeholder: 'Ej: Almundo' },
              { label: 'Destino *', key: 'destination', placeholder: 'Ej: Cancún' },
              { label: 'Título', key: 'title', placeholder: 'Ej: Cancún HD' },
              { label: 'Precio', key: 'price', placeholder: 'Ej: 1800' },
              { label: 'Moneda', key: 'currency', placeholder: 'USD' },
              { label: 'Salida', key: 'departureDate', placeholder: 'Ej: 15 Ago' },
              { label: 'Regreso', key: 'returnDate', placeholder: 'Ej: 22 Ago' },
              { label: 'Cupo', key: 'capacity', placeholder: 'Ej: 40 pax' },
              { label: 'Cierre', key: 'deadline', placeholder: 'Ej: 30 Jul' },
              { label: 'Guía', key: 'guide', placeholder: 'Guía local' },
            ].map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{field.label}</label>
                <input
                  value={(formData as any)[field.key]}
                  onChange={(e) => setFormData(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            ))}
          </div>
          <div className="mb-6 space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Qué incluye (Uno por línea)</label>
            <textarea
              value={formData.inclusions}
              onChange={(e) => setFormData(f => ({ ...f, inclusions: e.target.value }))}
              placeholder="Vuelo directo...\nHotel All Inclusive..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <button onClick={() => setShowForm(false)} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 px-4 py-2 transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !formData.destination}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-md disabled:opacity-50 flex items-center gap-2">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Generar y Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
             <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Historial Activo ({departures.length})</h3>
          </div>
          <div className="space-y-3 custom-scrollbar overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {departures.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No hay salidas disponibles</p>
                </div>
            )}
            {departures.map((d) => (
              <div key={d.id}
                onClick={() => setSelected({ departure: d, whatsapp: d.whatsappMessage, flyerHtml: d.flyerHtml })}
                className={`p-4 rounded-xl border border-slate-200 cursor-pointer shadow-sm transition-all group ${selected?.departure?.id === d.id ? 'ring-2 ring-indigo-500/30 bg-indigo-50/10' : 'bg-white hover:border-indigo-200 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start">
                    <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1.5 break-words">
                           <span className="text-[9px] text-indigo-600 font-black uppercase tracking-widest break-all bg-indigo-50 py-0.5 px-2 rounded-md">{d.destination}</span>
                           {d.isPublished && <span className="bg-emerald-50 text-emerald-600 rounded px-1.5 py-0.5 flex items-center gap-1"><Globe className="w-2.5 h-2.5"/> <span className="text-[8px] font-black uppercase">Web</span></span>}
                        </div>
                        <p className="text-slate-800 text-xs font-black truncate tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{d.title || d.operator}</p>
                        {d.departureDate && (
                            <p className="text-slate-400 text-[10px] mt-2 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                            🚀 Salida: <span className="text-indigo-500 font-black">{d.departureDate}</span>
                            </p>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-8">
          {selected ? (
            <div className="space-y-5 lg:pl-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                 <div className="flex gap-2">
                    <button onClick={() => setShowFlyer(!showFlyer)}
                    className={`flex items-center gap-2 px-6 py-2.5 text-[10px] uppercase tracking-widest font-black rounded-lg transition-all ${showFlyer ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white'}`}>
                    Contenido Visual
                    </button>
                    <button onClick={() => setShowFlyer(false)}
                    className={`flex items-center gap-2 px-6 py-2.5 text-[10px] uppercase tracking-widest font-black rounded-lg transition-all ${!showFlyer ? 'bg-[#25d366] text-white shadow-md shadow-[#25d366]/20' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white'}`}>
                    Texto WhatsApp
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <button onClick={copy} className="flex items-center justify-center p-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:text-emerald-500 rounded-lg transition-colors" title="Copiar WhatsApp">
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={downloadFlyer} className="flex items-center justify-center p-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:text-indigo-500 rounded-lg transition-colors" title="Descargar Web HTML">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRegenerate(selected.departure.id)} className="flex items-center justify-center p-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:text-orange-500 rounded-lg transition-colors" title="Regenerar IA">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                     <button onClick={() => handleDelete(selected.departure.id)} className="flex items-center justify-center p-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Salida">
                        <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {/* Publisher Web Controller */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-xl ${selected.departure.isPublished ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                         <Globe className={`w-5 h-5 ${selected.departure.isPublished ? 'text-emerald-500' : 'text-slate-400'}`} />
                     </div>
                     <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Estatus Web Pipeline</p>
                         <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">
                             {selected.departure.isPublished ? 'Actualmente en Producción' : 'No Publicado'}
                         </p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-4">
                     <select 
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 py-2 outline-none cursor-pointer"
                        value={selected.departure.webCategory || 'SPORTS'}
                        onChange={(e) => { 
                           if (selected.departure.isPublished) toggleWebPublish(selected.departure.id, true, e.target.value); 
                        }}
                        disabled={!selected.departure.isPublished}
                     >
                        <option value="SPORTS">Eventos & Deportes</option>
                        <option value="SHOWS">Conciertos & Shows</option>
                        <option value="CARIBE">Caribe y Playas</option>
                        <option value="EXOTIC">Destinos Exóticos</option>
                        <option value="EUROPE">Mundo Clásico</option>
                     </select>
                     
                     <button 
                        onClick={() => toggleWebPublish(selected.departure.id, selected.departure.isPublished, selected.departure.webCategory)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none shadow-inner ${selected.departure.isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
                     >
                         <span aria-hidden="true" className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${selected.departure.isPublished ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                     </button>
                  </div>
              </div>

              {/* Viewport */}
              {showFlyer && selected.flyerHtml ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-6 shadow-sm" style={{ height: '500px' }}>
                     <div className="relative w-full max-w-[320px] shadow-2xl rounded-2xl overflow-hidden border border-slate-300 aspect-[1080/1350]">
                        <iframe srcDoc={selected.flyerHtml} className="absolute inset-0 bg-white origin-top-left" style={{ transform: 'scale(calc(320 / 1080))', width: '1080px', height: '1350px' }} />
                     </div>
                </div>
              ) : (
                <div className="bg-white border border-[#25d366]/20 rounded-2xl p-6 shadow-sm relative overflow-hidden h-[500px] flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#25d366]"></div>
                  <div className="flex items-center gap-3 mb-6 bg-[#25d366]/10 w-fit px-4 py-2 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-[#25d366]" />
                    <span className="text-[#25d366] font-black text-xs uppercase tracking-widest">Optimizado para WhatsApp</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <pre className="text-slate-700 text-[13px] whitespace-pre-wrap font-sans leading-[1.7]">{selected.whatsapp}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                 <Star className="w-8 h-8 text-indigo-300" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Seleccioná una salida para ver su panel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
