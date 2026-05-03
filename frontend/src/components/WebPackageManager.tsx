import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Globe, Plus, Pencil, Trash2, Eye, EyeOff, Zap, X, Save,
  Tag, DollarSign, Clock, MapPin, Image, ToggleLeft, ToggleRight,
  AlertTriangle, CheckCircle2, Upload, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'SPORTS',          label: '⚽ Sports' },
  { value: 'CARIBE',          label: '🌴 Caribe' },
  { value: 'BRASIL',          label: '🌅 Brasil' },
  { value: 'EUROPA',          label: '🏛️ Europa' },
  { value: 'USA',             label: '✈️ USA / Disney' },
  { value: 'SALIDAS_GRUPALES',label: '👥 Salidas Grupales' },
];

const CURRENCIES = ['USD', 'EUR', 'ARS'];

interface WebPackage {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  location: string;
  webCategory: string;
  imageUrl: string;
  tags: string[];
  isPublished: boolean;
  // Promo
  isPromo: boolean;
  promoLabel: string;
  originalPrice: number | null;
  promoEndsAt: string;
  isHeroBanner: boolean;
  heroBannerText: string;
  // Detail fields
  included: string[];
  excluded: string[];
  itinerary: { day: number; title: string; activities: string[] }[];
  notes: string;
  customSections?: { title: string; content: string }[];
}

const EMPTY: WebPackage = {
  title: '', subtitle: '', description: '', price: 0, currency: 'USD',
  duration: '', location: '', webCategory: 'EUROPA', imageUrl: '',
  tags: [], isPublished: true,
  isPromo: false, promoLabel: '', originalPrice: null,
  promoEndsAt: '', isHeroBanner: false, heroBannerText: '',
  included: [], excluded: [], itinerary: [], notes: ''
};

export function WebPackageManager() {
  const [packages, setPackages] = useState<WebPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WebPackage>(EMPTY);
  const [isEditing, setIsEditing] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/web-packages');
      setPackages(res.data);
    } catch { toast.error('Error cargando paquetes'); }
    finally { setLoading(false); }
  };

  const openNew = () => {
    setEditing(EMPTY); setTagsInput(''); setIsEditing(false); setShowForm(true);
  };

  const openEdit = (pkg: WebPackage) => {
    setEditing({ ...pkg });
    setTagsInput((pkg.tags || []).join(', '));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!editing.title || !editing.description) {
      toast.error('Título y descripción son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        price: Number(editing.price),
        originalPrice: editing.originalPrice ? Number(editing.originalPrice) : null,
        promoEndsAt: editing.promoEndsAt || null,
      };
      if (isEditing && editing.id) {
        await axios.patch(`/api/web-packages/${editing.id}`, payload);
        toast.success('Paquete actualizado');
      } else {
        await axios.post('/api/web-packages', payload);
        toast.success('Paquete creado');
      }
      setShowForm(false);
      fetchPackages();
    } catch { toast.error('Error guardando paquete'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este paquete?')) return;
    try {
      await axios.delete(`/api/web-packages/${id}`);
      toast.success('Paquete eliminado');
      fetchPackages();
    } catch { toast.error('Error eliminando'); }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await axios.put(`/api/web-packages/${id}/toggle-publish`);
      fetchPackages();
    } catch { toast.error('Error cambiando estado'); }
  };

  const catLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (!editing.id && !isEditing) {
      toast.error('Primero guarda el paquete como borrador para subir una imagen');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await axios.post(`/api/web-packages/${editing.id}/image`, formData);
      setEditing(p => ({ ...p, imageUrl: res.data.imageUrl }));
      toast.success('Imagen subida correctamente');
    } catch {
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Globe className="w-7 h-7 text-slate-900 rotate-3" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vidriera Web</h1>
            <p className="text-sm text-slate-500">Paquetes publicados en concepto-web</p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
          <Plus size={18} /> Nuevo Paquete
        </button>
      </div>

      {/* ─── PACKAGE LIST ────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Cargando paquetes...</div>
      ) : packages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
          <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Ningún paquete cargado aún.</p>
          <button onClick={openNew} className="mt-4 text-orange-500 font-black text-sm uppercase tracking-widest underline">
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {packages.map((pkg: any) => (
            <div key={pkg.id}
              className={`bg-white border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all ${
                pkg.isPublished ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}>
              {/* Image thumbnail */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                {pkg.imageUrl
                  ? <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover" />
                  : <Image className="w-6 h-6 text-slate-300 m-auto mt-7" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{catLabel(pkg.webCategory)}</span>
                  {pkg.isPromo && (
                    <span className="flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      <Zap size={10} /> {pkg.promoLabel || 'PROMO'}
                    </span>
                  )}
                  {pkg.isHeroBanner && (
                    <span className="flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      🔥 BANNER HERO
                    </span>
                  )}
                  {!pkg.isPublished && (
                    <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">BORRADOR</span>
                  )}
                </div>
                <h3 className="font-black text-slate-900 text-base truncate">{pkg.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={12} />{pkg.location}</span>
                  <span className="flex items-center gap-1"><DollarSign size={12} />{pkg.currency} {Number(pkg.price).toLocaleString('es-AR')}
                    {pkg.originalPrice && <s className="text-slate-400 ml-1">{Number(pkg.originalPrice).toLocaleString('es-AR')}</s>}
                  </span>
                  <span className="flex items-center gap-1"><Clock size={12} />{pkg.duration}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button onClick={() => handleTogglePublish(pkg.id)} title={pkg.isPublished ? 'Despublicar' : 'Publicar'}
                  className={`p-2 rounded-xl transition-all ${pkg.isPublished ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}>
                  {pkg.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => openEdit(pkg)} className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="p-2 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── FORM MODAL ─────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto py-8 px-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {isEditing ? 'Editar Paquete' : 'Nuevo Paquete Web'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">Se publicará en la sección Vidriera de concepto-web</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* ── Información Base ── */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Información Base</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-900 mb-1">Título *</label>
                    <input value={editing.title} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))}
                      placeholder="Ej: Magia en Disney 2026" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-900 mb-1">Subtítulo (Opcional)</label>
                    <input value={editing.subtitle} onChange={e => setEditing(p => ({ ...p, subtitle: e.target.value }))}
                      placeholder="Ej: Salida Grupal Acompañada" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-900 mb-1">Descripción *</label>
                    <textarea 
                      value={editing.description} 
                      onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} 
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                        }
                      }}
                      rows={4}
                      placeholder="Descripción atractiva del paquete..." 
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">Categoría</label>
                    <select value={editing.webCategory} onChange={e => setEditing(p => ({ ...p, webCategory: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">Destino / Ubicación</label>
                    <input value={editing.location} onChange={e => setEditing(p => ({ ...p, location: e.target.value }))}
                      placeholder="Ej: Orlando, Florida" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">Duración</label>
                    <input value={editing.duration} onChange={e => setEditing(p => ({ ...p, duration: e.target.value }))}
                      placeholder="Ej: 7 noches / 8 días" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">Imagen del Paquete</label>
                    <div className="flex gap-2">
                      <input value={editing.imageUrl} onChange={e => setEditing(p => ({ ...p, imageUrl: e.target.value }))}
                        placeholder="https://..." className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                      
                      <div className="relative">
                        <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading || (!editing.id && !isEditing)} />
                        <label htmlFor="file-upload" className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-slate-900 hover:bg-slate-50 transition-all ${uploading ? 'animate-pulse' : ''}`}>
                          {uploading ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" /> : <Upload className="w-5 h-5 text-slate-400" />}
                        </label>
                      </div>
                    </div>
                    {!editing.id && !isEditing && <p className="text-[10px] text-orange-500 mt-1 font-bold uppercase">Guarda primero para subir archivo</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">Tags (separados por coma)</label>
                    <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                      placeholder="Ej: DISNEY, FAMILIA, TODO INCLUIDO" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                </div>
              </section>

              {/* ── Precio ── */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Precio</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">Moneda</label>
                    <select value={editing.currency} onChange={e => setEditing(p => ({ ...p, currency: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">Precio Actual *</label>
                    <input type="number" value={editing.price} onChange={e => setEditing(p => ({ ...p, price: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1 flex items-center gap-1">
                      Precio Original <span className="text-orange-500">(tachado)</span>
                    </label>
                    <input type="number" value={editing.originalPrice || ''} onChange={e => setEditing(p => ({ ...p, originalPrice: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="Solo si es PROMO" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900" />
                  </div>
                </div>
              </section>

              {/* ── Promoción ── */}
              <section className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-5">
                  <Zap size={18} className="text-orange-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Configuración de Promo</h3>
                </div>

                {/* Toggle isPromo */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="font-black text-slate-900 text-sm">¿Es una promoción?</p>
                    <p className="text-xs text-slate-500 mt-0.5">Activa la cinta diagonal en la tarjeta y el carrusel "Promos Destacadas"</p>
                  </div>
                  <button onClick={() => setEditing(p => ({ ...p, isPromo: !p.isPromo }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${editing.isPromo ? 'bg-orange-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    {editing.isPromo ? <><ToggleRight size={18} /> Activa</> : <><ToggleLeft size={18} /> Inactiva</>}
                  </button>
                </div>

                {editing.isPromo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">Etiqueta promo</label>
                      <input value={editing.promoLabel} onChange={e => setEditing(p => ({ ...p, promoLabel: e.target.value }))}
                        placeholder='Ej: -20%, BLACK FRIDAY, ÚLTIMOS LUGARES'
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">Vence el (opcional)</label>
                      <input type="datetime-local" value={editing.promoEndsAt} onChange={e => setEditing(p => ({ ...p, promoEndsAt: e.target.value }))}
                        className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
                    </div>

                    {/* Toggle isHeroBanner */}
                    <div className="md:col-span-2 bg-red-50 rounded-xl p-4 border border-red-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-black text-slate-900 text-sm flex items-center gap-2">🔥 Mostrar en Banner Hero</p>
                          <p className="text-xs text-slate-500 mt-0.5">Activa la franja roja con cuenta regresiva en el top de la web. Solo una a la vez.</p>
                        </div>
                        <button onClick={() => setEditing(p => ({ ...p, isHeroBanner: !p.isHeroBanner }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${editing.isHeroBanner ? 'bg-red-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                          {editing.isHeroBanner ? <><ToggleRight size={18} /> Activo</> : <><ToggleLeft size={18} /> Inactivo</>}
                        </button>
                      </div>
                      {editing.isHeroBanner && (
                        <input value={editing.heroBannerText} onChange={e => setEditing(p => ({ ...p, heroBannerText: e.target.value }))}
                          placeholder='🔥 Últimos lugares: 20% OFF en Concepto Caribe'
                          className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white" />
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* ── Detalles e Itinerario ── */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Detalles del Paquete</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">Qué incluye (1 por línea)</label>
                      <textarea 
                        value={editing.included?.join('\n') || ''} 
                        onChange={e => setEditing(p => ({ ...p, included: e.target.value.split('\n') }))} 
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                          }
                        }}
                        rows={4}
                        placeholder="Ej: Vuelos ida y vuelta&#10;Traslados" 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-900 mb-1">No incluye (1 por línea)</label>
                      <textarea 
                        value={editing.excluded?.join('\n') || ''} 
                        onChange={e => setEditing(p => ({ ...p, excluded: e.target.value.split('\n') }))} 
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                          }
                        }}
                        rows={4}
                        placeholder="Ej: Propinas&#10;Excursiones opcionales" 
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-black text-slate-900">Itinerario</label>
                      <button onClick={() => setEditing(p => ({ ...p, itinerary: [...(p.itinerary || []), { day: (p.itinerary?.length || 0) + 1, title: '', activities: [] }] }))}
                        className="text-xs text-orange-500 font-bold uppercase tracking-wider flex items-center gap-1 hover:text-orange-600">
                        <Plus size={14} /> Agregar Día
                      </button>
                    </div>
                    {(editing.itinerary || []).length === 0 && (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-slate-100">Sin itinerario cargado.</p>
                    )}
                    <div className="space-y-3">
                      {(editing.itinerary || []).map((day, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
                          <button onClick={() => setEditing(p => ({ ...p, itinerary: p.itinerary.filter((_, i) => i !== idx) }))}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                          <div className="grid grid-cols-[80px_1fr] gap-3 mb-3 pr-8">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Día</label>
                              <input type="number" value={day.day} onChange={e => {
                                const newIt = [...editing.itinerary];
                                newIt[idx].day = Number(e.target.value);
                                setEditing(p => ({ ...p, itinerary: newIt }));
                              }} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Título del día</label>
                              <input value={day.title} onChange={e => {
                                const newIt = [...editing.itinerary];
                                newIt[idx].title = e.target.value;
                                setEditing(p => ({ ...p, itinerary: newIt }));
                              }} placeholder="Ej: Llegada a París" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Actividades (1 por línea)</label>
                            <textarea value={day.activities.join('\n')} onChange={e => {
                              const newIt = [...editing.itinerary];
                              newIt[idx].activities = e.target.value.split('\n').filter(Boolean);
                              setEditing(p => ({ ...p, itinerary: newIt }));
                            }} rows={2} placeholder="Ej: Check-in en el hotel&#10;Tarde libre" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-black text-slate-900">Secciones Dinámicas Adicionales</label>
                      <button onClick={() => setEditing(p => ({ ...p, customSections: [...(p.customSections || []), { title: '', content: '' }] }))}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-500 flex items-center gap-1">
                        <Plus size={12} /> Agregar Sección
                      </button>
                    </div>
                    {(!editing.customSections || editing.customSections.length === 0) && (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-slate-100">Sin secciones adicionales.</p>
                    )}
                    <div className="space-y-3">
                      {(editing.customSections || []).map((sec: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
                          <button onClick={() => setEditing(p => ({ ...p, customSections: (p.customSections || []).filter((_, i) => i !== idx) }))}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                          <div className="pr-8 space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Título de la sección</label>
                              <input value={sec.title} onChange={e => {
                                const newSec = [...(editing.customSections || [])];
                                newSec[idx].title = e.target.value;
                                setEditing(p => ({ ...p, customSections: newSec }));
                              }} placeholder="Ej: Hoteles Previstos" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Contenido</label>
                              <textarea value={sec.content} onChange={e => {
                                const newSec = [...(editing.customSections || [])];
                                newSec[idx].content = e.target.value;
                                setEditing(p => ({ ...p, customSections: newSec }));
                              }} 
                              onKeyDown={e => { if (e.key === 'Enter') e.stopPropagation(); }}
                              rows={3} placeholder="Contenido de la sección..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 mb-1">Notas / Políticas (Opcional)</label>
                    <textarea value={editing.notes || ''} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} rows={2}
                      placeholder="Información legal, políticas de cancelación..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
                  </div>
                </div>
              </section>

              {/* Publicado */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
                <div>
                  <p className="font-black text-slate-900 text-sm">Publicar en la web</p>
                  <p className="text-xs text-slate-500">Solo los paquetes publicados aparecen en concepto-web</p>
                </div>
                <button onClick={() => setEditing(p => ({ ...p, isPublished: !p.isPublished }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${editing.isPublished ? 'bg-green-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                  {editing.isPublished ? <><CheckCircle2 size={16} /> Publicado</> : <><EyeOff size={16} /> Borrador</>}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-8 border-t border-slate-100">
              <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all">
                <Save size={16} /> {saving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Paquete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
