import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Save, Upload, Image as ImageIcon, Palette, Type, Phone, CheckCircle2 } from 'lucide-react'

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
  const [saved, setSaved] = useState(false)

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
    setLoading(true)
    try {
      await axios.post('/api/settings', settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      alert("Error al guardar")
    } finally {
      setLoading(false)
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
    } catch (e) {
      alert("Error al subir logo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3 transition-transform">
                  <Palette className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                  <h1 className="page-title">Ajustes de Marca</h1>
                  <p className="page-subtitle">Identidad Visual & Presencia en Web</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LOGOS SECTION */}
        <div className="space-y-8">
          <div className="premium-card">
            <h3 className="section-label">Logotipos Institucionales</h3>
            
            <div className="space-y-6">
              {/* Logo Entero */}
              <div className="space-y-2">
                <label className="section-label !text-[9px] opacity-70">Símbolo Principal (Flyers HD)</label>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center gap-4 shadow-inner relative group">
                  {settings.logoFullUrl ? (
                    <img src={settings.logoFullUrl} alt="Full Logo" className="h-16 object-contain transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-[9px]">Pendiente</div>
                  )}
                  <label className="w-full">
                    <div className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[9px] font-black py-2.5 rounded-xl cursor-pointer transition-all border border-slate-200 uppercase tracking-widest">
                      <Upload className="w-3.5 h-3.5 text-orange-500" /> {settings.logoFullUrl ? 'Actualizar' : 'Vincular Logo'}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0]; if(f) handleUploadLogo(f, 'full')
                    }} />
                  </label>
                </div>
              </div>

              {/* Logo Compacto */}
              <div className="space-y-2">
                <label className="section-label !text-[9px] opacity-70">Compacto Web (Isotipo)</label>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col items-center gap-4 shadow-inner relative group">
                  {settings.logoCompactUrl ? (
                    <img src={settings.logoCompactUrl} alt="Compact Logo" className="h-12 object-contain transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="h-12 flex items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-[9px]">Pendiente</div>
                  )}
                  <label className="w-full">
                    <div className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[9px] font-black py-2.5 rounded-xl cursor-pointer transition-all border border-slate-200 uppercase tracking-widest">
                      <Upload className="w-3.5 h-3.5 text-indigo-500" /> {settings.logoCompactUrl ? 'Actualizar' : 'Vincular Isotipo'}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0]; if(f) handleUploadLogo(f, 'compact')
                    }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INFO & COLORS SECTION */}
        <div className="space-y-8">
          <div className="premium-card">
            <h3 className="section-label">Información de Negocio</h3>
            
            <div className="space-y-4">
              <div>
                <label className="section-label !text-[9px] opacity-70 ml-1">Nombre Comercial</label>
                <input 
                  type="text" 
                  value={settings.name} 
                  onChange={e => setSettings({...settings, name: e.target.value})}
                  className="standard-input !py-3 text-xs"
                  placeholder="Ej: Concepto Evt"
                />
              </div>
              <div>
                <label className="section-label !text-[9px] opacity-70 ml-1">WhatsApp Comercial</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input 
                    type="text" 
                    value={settings.phone} 
                    onChange={e => setSettings({...settings, phone: e.target.value})}
                    className="standard-input pl-12 !py-3 text-xs"
                    placeholder="54911..."
                  />
                </div>
              </div>
              <div>
                <label className="section-label !text-[9px] opacity-70 ml-1">Eslogan</label>
                <input 
                  type="text" 
                  value={settings.slogan} 
                  onChange={e => setSettings({...settings, slogan: e.target.value})}
                  className="standard-input !py-3 text-xs"
                  placeholder="Ej: Viajá con quien sabe"
                />
              </div>
            </div>

            <h3 className="section-label !mt-12">Esquema Cromático</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                <div className="absolute inset-0 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" style={{ backgroundColor: settings.colorPrimary }} />
                <label className="section-label !text-[10px] opacity-60 block !mb-4">Tono Primario</label>
                <div className="flex items-center gap-4 relative">
                  <input 
                    type="color" 
                    value={settings.colorPrimary} 
                    onChange={e => setSettings({...settings, colorPrimary: e.target.value})}
                    className="w-14 h-14 bg-transparent border-0 cursor-pointer rounded-2xl overflow-hidden shadow-2xl"
                  />
                  <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest">{settings.colorPrimary}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                <div className="absolute inset-0 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" style={{ backgroundColor: settings.colorAccent }} />
                <label className="section-label !text-[10px] opacity-60 block !mb-4">Tono de Acento</label>
                <div className="flex items-center gap-4 relative">
                  <input 
                    type="color" 
                    value={settings.colorAccent} 
                    onChange={e => setSettings({...settings, colorAccent: e.target.value})}
                    className="w-14 h-14 bg-transparent border-0 cursor-pointer rounded-2xl overflow-hidden shadow-2xl"
                  />
                  <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest">{settings.colorAccent}</span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>

      {/* SAVE BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white backdrop-blur-2xl border border-slate-200 rounded-2xl p-3 flex items-center gap-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[100] min-w-[320px] justify-between group">
        <div className="flex items-center gap-3 pl-4">
          {saved ? (
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-in zoom-in-50">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div> 
              OK
            </div>
          ) : (
            <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Pendiente
            </div>
          )}
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="standard-button !shadow-none !py-3 px-6 text-[11px] group-hover:scale-105"
        >
          {loading ? <Save className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {loading ? '...' : 'GUARDAR'}
        </button>
      </div>
    </div>
  )
}
