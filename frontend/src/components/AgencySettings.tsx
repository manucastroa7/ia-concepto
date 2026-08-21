import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Save, Upload, Palette, Phone, Building2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export const AgencySettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    name: '',
    phone: '',
    slogan: '',
    colorPrimary: '#1e3a5f',
    colorAccent: '#f97316',
    logoFullUrl: '',
    logoCompactUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings')
      setSettings(res.data)
    } catch (e) {}
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.post('/api/settings', settings)
      toast.success('Ajustes de marca guardados exitosamente')
    } catch (e) {
      toast.error('Error al guardar ajustes')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadLogo = async (file: File, type: 'full' | 'compact') => {
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', type)
      const res = await axios.post('/api/settings/logo', form)
      setSettings(res.data)
      toast.success(type === 'full' ? 'Logo principal actualizado' : 'Isotipo actualizado')
    } catch (e) {
      toast.error('Error al subir logo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      
      {/* HEADER CON BOTÓN DE GUARDAR */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ajustes de Marca</h1>
            <p className="text-xs text-slate-500 font-semibold">Identidad Visual, Logotipos & Presencia Digital de la Agencia</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Ajustes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA IZQUIERDA: LOGOTIPOS E ISOTIPO */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-500" /> Logotipos Institucionales
            </h3>
            <p className="text-xs text-slate-500 font-medium">Símbolo principal para itinerarios HD e Isotipo compacto para la web</p>
          </div>

          {/* LOGO PRINCIPAL */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800">Símbolo Principal (Flyers & Documentos)</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Formato recomendado: PNG transparente HD</p>
              </div>
              <label className="cursor-pointer">
                <span className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all">
                  <Upload className="w-3.5 h-3.5" /> {settings.logoFullUrl ? 'Cambiar Logo' : 'Subir Logo'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleUploadLogo(f, 'full')
                  }}
                />
              </label>
            </div>

            <div className="h-24 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center p-4 shadow-inner">
              {settings.logoFullUrl ? (
                <img src={settings.logoFullUrl} alt="Logo Principal" className="max-h-16 max-w-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sin Logo Vinculado</span>
              )}
            </div>
          </div>

          {/* ISOTIPO COMPACTO */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-800">Compacto Web (Isotipo)</h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Icono o símbolo cuadrado para la web</p>
              </div>
              <label className="cursor-pointer">
                <span className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all">
                  <Upload className="w-3.5 h-3.5" /> {settings.logoCompactUrl ? 'Cambiar Isotipo' : 'Subir Isotipo'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleUploadLogo(f, 'compact')
                  }}
                />
              </label>
            </div>

            <div className="h-20 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center p-4 shadow-inner">
              {settings.logoCompactUrl ? (
                <img src={settings.logoCompactUrl} alt="Isotipo" className="max-h-14 max-w-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sin Isotipo Vinculado</span>
              )}
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN COMERCIAL & COLORES */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" /> Datos Comerciales y Colores
            </h3>
            <p className="text-xs text-slate-500 font-medium">Información de la agencia reflejada en vouchers e itinerarios</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Nombre Comercial de la Agencia</label>
              <input 
                type="text" 
                value={settings.name || ''} 
                onChange={e => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                placeholder="Ej: Concepto Evt"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">WhatsApp Comercial</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input 
                  type="text" 
                  value={settings.phone || ''} 
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                  placeholder="54911..."
                />
              </div>
            </div>

            <div>
              <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Eslogan Institucional</label>
              <input 
                type="text" 
                value={settings.slogan || ''} 
                onChange={e => setSettings({ ...settings, slogan: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-orange-500 focus:bg-white transition-all"
                placeholder="Ej: Viajá con concepto"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Esquema Cromático Visual</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Tono Primario</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={settings.colorPrimary || '#1e3a5f'} 
                    onChange={e => setSettings({ ...settings, colorPrimary: e.target.value })}
                    className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded-xl overflow-hidden shadow-xs shrink-0"
                  />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{settings.colorPrimary}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Tono de Acento</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={settings.colorAccent || '#f97316'} 
                    onChange={e => setSettings({ ...settings, colorAccent: e.target.value })}
                    className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded-xl overflow-hidden shadow-xs shrink-0"
                  />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{settings.colorAccent}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default AgencySettings
