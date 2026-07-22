import { useState, useRef, useEffect } from 'react'
import { Upload, Search, Trash2, RefreshCw, FileText, ChevronDown, Sparkles, Bot, Megaphone, Copy, Check, Download, X, Hotel, Maximize2, ExternalLink, Globe, Image as ImageIcon, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { toPng } from 'html-to-image'

export function TariffSearch() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [operatorInput, setOperatorInput] = useState('')
  const [uploadCategory, setUploadCategory] = useState('AUTO')
  const [circuits, setCircuits] = useState<any[]>([])
  
  // Normal search
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 20
  
  const [filterOperator, setFilterOperator] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  
  // AI Search
  const [searchMode, setSearchMode] = useState<'classic' | 'ai'>('classic')
  const [aiQuote, setAiQuote] = useState('')
  const [aiSearching, setAiSearching] = useState(false)
  const [aiMatches, setAiMatches] = useState<any[]>([])

  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Diffusion Generator
  const [diffusionModal, setDiffusionModal] = useState<any | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [modalHeroImages, setModalHeroImages] = useState<string[]>([])
  const [modalItemImages, setModalItemImages] = useState<Record<string, string>>({})
  const [selectedHotels, setSelectedHotels] = useState<Record<string, boolean>>({})
  const [modalFormat, setModalFormat] = useState<'post' | 'story'>('post')
  const [renderingFlyer, setRenderingFlyer] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    handleSearch()
  }, [])

  const handleUpload = async () => {
    if (!file) return

    const lowerFileName = file.name.toLowerCase()
    const looksLikeFlyer = file.type.startsWith('image/') || lowerFileName.includes('flyer') || lowerFileName.includes('promo')
    if (uploadCategory === 'FLYER' || (uploadCategory === 'AUTO' && looksLikeFlyer)) {
      await handleFlyerUpload()
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      if (operatorInput.trim()) form.append('operator', operatorInput.trim())
      form.append('categoria', uploadCategory)
      
      const res = await axios.post('/api/tariffs/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`✅ Se cargaron/actualizaron ${res.data.count} circuitos`)
      setFile(null)
      setOperatorInput('')
      handleSearch()
    } catch (e: any) {
      toast.error('Error: ' + (e.response?.data?.message || e.message))
    } finally {
      setUploading(false)
    }
  }

  const buildHotelSelection = (packages: any[] = []) => {
    return packages.reduce((acc: Record<string, boolean>, pkg: any) => {
      if (pkg.hotelName) acc[pkg.hotelName] = pkg.showInFlyer !== false
      return acc
    }, {})
  }

  const getModalFlyerData = (nextSelection = selectedHotels) => {
    const base = diffusionModal?.flyerData || diffusionModal?.extracted || {}
    const packages = (base.packages || []).map((pkg: any) => ({
      ...pkg,
      showInFlyer: nextSelection[pkg.hotelName] !== false,
    }))

    return { ...base, packages }
  }

  const refreshModalFlyer = async (
    nextSelection = selectedHotels,
    nextHeroes = modalHeroImages,
    nextItems = modalItemImages,
    nextFormat = modalFormat
  ) => {
    if (!diffusionModal) return
    setRenderingFlyer(true)
    try {
      const data = getModalFlyerData(nextSelection)
      const res = await axios.post('/api/flyers/render', {
        data,
        options: { heroImages: nextHeroes, itemImages: nextItems, attractions: diffusionModal.attractions || [], format: nextFormat }
      })
      setDiffusionModal((prev: any) => prev ? ({ ...prev, flyerHtml: res.data.flyerHtml, flyerData: data }) : prev)
    } catch (e: any) {
      toast.error("No se pudo actualizar el flyer")
    } finally {
      setRenderingFlyer(false)
    }
  }

  const handleFlyerUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const initialFormat: 'post' | 'story' = 'post'
      setModalFormat(initialFormat)
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`/api/flyers/extract?format=${initialFormat}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const packages = res.data.extracted?.packages || []
      setSelectedHotels(buildHotelSelection(packages))
      setModalHeroImages(res.data.suggestedImages || [])
      setModalItemImages(res.data.suggestedItemImages || {})
      setDiffusionModal({
        ...res.data,
        source: 'uploaded-flyer',
        flyerData: res.data.extracted,
        circuit: {
          title: res.data.extracted?.title || res.data.extracted?.destination || file.name,
          destination: res.data.extracted?.destination,
        }
      })
      toast.success("Flyer procesado dentro de Ofertas")
      setFile(null)
      setOperatorInput('')
    } catch (e: any) {
      toast.error('Error: ' + (e.response?.data?.message || e.message))
    } finally {
      setUploading(false)
    }
  }

  const handleSearch = async (catOverride?: string) => {
    setSearching(true)
    setPage(1)
    try {
      const params: any = {}
      if (searchQuery) params.destination = searchQuery
      if (filterOperator) params.operator = filterOperator
      if (filterMaxPrice) params.maxPrice = filterMaxPrice
      
      const cat = typeof catOverride === 'string' ? catOverride : filterCategory;
      if (cat) params.categoria = cat
 
      const res = await axios.get('/api/tariffs/search', { params })
      setCircuits(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.error(e)
      setCircuits([])
    } finally {
      setSearching(false)
    }
  }

  const handleAiSearch = async () => {
    if (!aiQuote.trim()) return
    setAiSearching(true)
    setAiMatches([])
    try {
      const res = await axios.post('/api/tariffs/ai-search', { quote: aiQuote })
      setAiMatches(res.data)
    } catch (e) {
      console.error(e)
      toast.error("Error en búsqueda inteligente")
    } finally {
      setAiSearching(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseás eliminar este elemento?")) return;
    try {
      await axios.delete(`/api/tariffs/${id}`)
      setCircuits(c => c.filter(x => x.id !== id))
      toast.success("Elemento eliminado exitosamente")
    } catch (e: any) { 
      toast.error("Error al eliminar elemento")
    }
  }

  const uploadCircuitImage = async (id: string, file: File) => {
    if (!file) return;
    const toastId = toast.loading("Subiendo imagen web...");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(`/api/tariffs/${id}/image`, form);
      
      setCircuits(prev => prev.map(c => 
        c.id === id ? { ...c, imageUrl: res.data.imageUrl } : c
      ));
      
      toast.success("Imagen actualizada correctamente", { id: toastId });
    } catch (e) {
      toast.error("Error al subir la imagen", { id: toastId });
    }
  }

  const handleResetDatabase = async () => {
    const confirmation = window.prompt("⚠️ PELIGRO: Vas a ELIMINAR TODOS los circuitos irreversiblemente.\nPara continuar, escribe: BORRAR TODO")
    if (confirmation === "BORRAR TODO") {
      try {
        await axios.post('/api/tariffs/reset-database')
        setCircuits([])
        setAiMatches([])
        setPage(1)
        toast.success("Base de datos reiniciada con éxito.")
      } catch (e) {
        toast.error("Hubo un error al reiniciar la base de datos.")
      }
    } else if (confirmation !== null) {
      toast.error("Cancelado.")
    }
  }

  const toggleWebPublish = async (c: any, webCat: string) => {
    try {
      const isCurrentlyPub = c.isPublished || false;
      const res = await axios.put(`/api/tariffs/${c.id}/publish`, {
        isPublished: !isCurrentlyPub,
        webCategory: webCat || c.webCategory || 'CARIBE'
      });
      toast.success(!isCurrentlyPub ? "¡Publicado en la Web!" : "Removido de la web");
      setCircuits(circuits.map(x => x.id === c.id ? res.data.circuit : x));
    } catch (e: any) {
      toast.error("No se pudo actualizar el estado de publicación.");
    }
  }

  const handleGenerateDiffusion = async (id: string, c: any, force = false) => {
    setGeneratingId(id)
    try {
      setModalFormat('post')
      toast.loading(force ? "Regenerando con IA..." : "Cargando Difusión...", { id: 'diffusion' })
      const res = await axios.post(`/api/tariffs/${id}/generate-diffusion${force ? '?force=true' : ''}`)
      const packages = res.data.flyerData?.packages || []
      setSelectedHotels(buildHotelSelection(packages))
      setModalHeroImages(res.data.suggestedImages || [])
      setModalItemImages(res.data.suggestedItemImages || {})
      setDiffusionModal({ ...res.data, circuit: c })
      toast.success(res.data.generatedNew ? "¡Generado con éxito!" : "¡Cargado desde caché!", { id: 'diffusion' })
    } catch (e: any) {
      toast.error("Error al generar: " + (e.response?.data?.message || e.message), { id: 'diffusion' })
    } finally {
      setGeneratingId(null)
    }
  }

  const copyToClipboard = () => {
    if (diffusionModal?.whatsapp) {
      navigator.clipboard.writeText(diffusionModal.whatsapp)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("¡Copiado al portapapeles!")
    }
  }

  const handleDownload = async () => {
    if (!diffusionModal?.flyerHtml) return
    const id = toast.loading("Preparando descarga...")
    try {
      const temp = document.createElement('div')
      temp.style.position = 'fixed'
      temp.style.left = '-9999px'
      temp.style.top = '0'
      temp.style.width = '1080px'
      temp.style.height = `${flyerPreviewHeight}px`
      temp.innerHTML = diffusionModal.flyerHtml
      document.body.appendChild(temp)

      await new Promise(res => setTimeout(res, 1000))
      
      const canvas = temp.querySelector('.flyer-canvas') as HTMLElement
      if (!canvas) throw new Error("Canvas no encontrado")

      const dataUrl = await toPng(canvas, {
        width: 1080, height: flyerPreviewHeight, pixelRatio: 1, cacheBust: true,
        style: { transform: 'none', margin: '0', padding: '0' }
      })
      
      const link = document.createElement('a')
      link.download = `Flyer-${diffusionModal.circuit?.title?.replace(/\s+/g, '_') || 'Viaje'}.png`
      link.href = dataUrl
      link.click()
      
      document.body.removeChild(temp)
      toast.success("¡Descargado exitosamente!", { id })
    } catch (e: any) {
      toast.error("Error al exportar: " + e.message, { id })
    }
  }

  const openFullPreview = () => {
    if (!diffusionModal?.flyerHtml) return
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(diffusionModal.flyerHtml)
      win.document.close()
    }
  }

  const toggleHotelInFlyer = (hotelName: string) => {
    const isVisible = selectedHotels[hotelName] !== false
    const nextSelection = { ...selectedHotels, [hotelName]: !isVisible }
    setSelectedHotels(nextSelection)
    refreshModalFlyer(nextSelection)
  }

  const handleModalFormatChange = (nextFormat: 'post' | 'story') => {
    setModalFormat(nextFormat)
    refreshModalFlyer(selectedHotels, modalHeroImages, modalItemImages, nextFormat)
  }

  const getHotelImage = (pkg: any) => {
    return modalItemImages[pkg.hotelName] || pkg.googlePhoto || ''
  }

  const handleModalAssetUpload = async (nextFile: File, type: 'hero' | 'hotel', hotelName?: string) => {
    if (!diffusionModal) return
    setRenderingFlyer(true)
    try {
      const data = getModalFlyerData()
      const destination = data.destination || diffusionModal.circuit?.destination || 'Varios'
      const form = new FormData()
      form.append('file', nextFile)
      form.append('destination', destination)
      if (type === 'hotel' && hotelName) form.append('hotelName', hotelName)

      const res = await axios.post('/api/flyers/assets', form)
      if (type === 'hero') {
        const nextHeroes = [res.data.imageUrl, ...modalHeroImages].slice(0, 3)
        setModalHeroImages(nextHeroes)
        await refreshModalFlyer(selectedHotels, nextHeroes, modalItemImages)
      } else if (hotelName) {
        const nextItems = { ...modalItemImages, [hotelName]: res.data.imageUrl }
        setModalItemImages(nextItems)
        await refreshModalFlyer(selectedHotels, modalHeroImages, nextItems)
      }
    } catch (e: any) {
      toast.error("No se pudo subir la imagen")
    } finally {
      setRenderingFlyer(false)
    }
  }

  const renderCircuit = (c: any, aiData?: any) => (
    <div key={c.id || aiData?.circuitId} className={`premium-card !p-0 overflow-hidden transition-all duration-300 hover:shadow-md group/card ${aiData ? 'ring-2 ring-orange-500/30' : ''}`}>
      {aiData && (
        <div className="bg-orange-50 px-6 py-2 border-b border-orange-100">
          <div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Match Dinámico: {aiData.score}%
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed font-medium">{aiData.justificacion}</p>
        </div>
      )}

      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-all border-b border-transparent group-hover:border-slate-100"
        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {c.categoria && (
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border ${
                c.categoria === 'PAQUETE' ? 'bg-sky-50 text-sky-600 border-sky-200' :
                c.categoria === 'SALIDA GRUPAL' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                'bg-orange-50 text-orange-600 border-orange-200'
              }`}>
                {c.categoria}
              </span>
            )}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.operator || 'Operador Local'}</span>
            
            {c.isPublished && (
               <span className="text-[9px] font-black px-2 py-0.5 rounded-md text-emerald-600 bg-emerald-50 border border-emerald-200 uppercase tracking-widest flex items-center gap-1">
                 <Globe className="w-3 h-3" /> Web
               </span>
            )}
          </div>
          <h4 className="text-base font-black text-slate-800 tracking-tight uppercase group-hover/card:text-orange-500 transition-colors">{c.title || c.nombre || 'Circuito'}</h4>
          <div className="flex flex-wrap gap-5 mt-3">
            {c.duration && <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> {c.duration}</span>}
            {c.price && <span className="text-[14px] font-black text-slate-800 tracking-tight"><span className="text-orange-500 font-bold">{c.currency || 'EUR'}</span> {c.price.toLocaleString()}</span>}
            {(c.dates) && <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><FileText className="w-3 h-3" /> {c.dates}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${expandedId === c.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 bg-slate-50 border border-slate-100 hover:border-slate-200'}`}>
            <ChevronDown className={`w-4 h-4 transform transition-transform duration-500 ${expandedId === c.id ? 'rotate-180' : ''}`} />
          </div>
          {!aiData && (
            <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }}
              className="w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {expandedId === c.id && (
        <div className="px-6 pb-6 pt-4 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {c.itinerario_resumido?.length > 0 && (
                <div className="space-y-4">
                <h5 className="section-label">Ruta y Experiencia</h5>
                <div className="space-y-3">
                    {c.itinerario_resumido.map((it: any, i: number) => (
                    <div key={i} className="flex gap-4 group/item items-start">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-orange-600 transition-all">{it.dia}</div>
                        <p className="text-[12px] text-slate-600 leading-relaxed"><span className="text-slate-800 font-bold mr-1">{it.descripcion}</span></p>
                    </div>
                    ))}
                </div>
                </div>
            )}
            
            <div className="space-y-8">
                {c.inclusions?.length > 0 && (
                    <div className="space-y-3">
                    <h5 className="section-label">Servicios Incluidos</h5>
                    <div className="grid grid-cols-1 gap-2">
                        {c.inclusions.map((inc: string, i: number) => (
                        <div key={i} className="text-[11px] text-slate-600 flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />{inc}
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                {c.hoteles_previstos?.length > 0 && (
                    <div className="space-y-3">
                    <h5 className="section-label">Alojamiento Previsto</h5>
                    <div className="flex flex-wrap gap-2">
                        {c.hoteles_previstos.map((hot: string, i: number) => (
                        <div key={i} className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <Hotel className="w-3.5 h-3.5 text-blue-500" />{hot}
                        </div>
                        ))}
                    </div>
                    </div>
                )}
            </div>
          </div>
          
          {/* ACCIONES Y STATUS DE PUBLICACIÓN */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-xl">
                   <div className="flex flex-col px-2">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Web</span>
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWebPublish(c, c.webCategory || 'CARIBE'); }}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${c.isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                             <span aria-hidden="true" className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${c.isPublished ? 'translate-x-2' : '-translate-x-2'}`} />
                          </button>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${c.isPublished ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {c.isPublished ? 'PUBLICADO' : 'OCULTO'}
                          </span>
                       </div>
                   </div>
                   
                   <div className="h-8 w-px bg-slate-200 mx-1"></div>
                   
                   <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Categoría Web</span>
                       <select 
                          className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-1 outline-none cursor-pointer"
                          value={c.webCategory || 'CARIBE'}
                          onChange={(e) => { 
                             e.stopPropagation();
                             if (c.isPublished) toggleWebPublish(c, e.target.value); 
                          }}
                          disabled={!c.isPublished}
                       >
                          <option value="SPORTS">Sports</option>
                          <option value="CARIBE">Caribe</option>
                          <option value="BRASIL">Brasil</option>
                          <option value="EUROPA">Europa</option>
                          <option value="USA">USA</option>
                          <option value="SALIDAS_GRUPALES">Salidas Grupales</option>
                       </select>
                   </div>


                </div>
             </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleGenerateDiffusion(c.id, c); }}
              disabled={generatingId === c.id}
              className="primary-button !px-6 !py-3 w-full md:w-auto"
            >
              {generatingId === c.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
              {generatingId === c.id ? "PROCESANDO..." : "Difusión AI"}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const modalPackages = diffusionModal
    ? ((diffusionModal.flyerData || diffusionModal.extracted || {}).packages || [])
    : []
  const modalData = diffusionModal
    ? (diffusionModal.flyerData || diffusionModal.extracted || {})
    : {}
  const flyerPreviewWidth = modalFormat === 'story' ? 420 : 560
  const flyerPreviewHeight = modalFormat === 'story' ? 1920 : 1350

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3">
                  <FileText className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                  <h1 className="page-title">Gestor de Ofertas</h1>
                  <p className="page-subtitle">Catalogo maestro, flyers y difusion</p>
              </div>
          </div>
          <button 
            onClick={handleResetDatabase}
            className="btn-secondary !border-red-100 !text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Resetear Catálogo
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card">
            <h3 className="section-label">Carga de Documentación</h3>
            
            <div className="space-y-5">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tipo de Contenido</label>
                        <select 
                            value={uploadCategory} 
                            onChange={(e) => setUploadCategory(e.target.value)}
                            className="standard-input font-bold uppercase tracking-widest cursor-pointer"
                        >
                            <option value="AUTO">Automático (IA)</option>
                            <option value="FLYER">Flyer / oferta visual</option>
                            <option value="CIRCUITO">Circuitos</option>
                            <option value="PAQUETE">Paquetes</option>
                            <option value="SALIDA GRUPAL">Grupales</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operadora</label>
                        <input 
                            type="text" 
                            placeholder="Ej: Catai, Travelplan..." 
                            value={operatorInput}
                            onChange={(e) => setOperatorInput(e.target.value)}
                            className="standard-input"
                        />
                    </div>
                </div>

                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50 rounded-2xl p-8 text-center cursor-pointer transition-all group hover:bg-orange-50 border-orange-50"
                >
                    <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <p className="text-slate-800 font-bold text-xs uppercase tracking-widest">Arrastra PDF, CSV o flyer</p>
                </div>
                <input ref={inputRef} type="file" accept="image/*,.pdf,.xlsx,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }} />

                {file && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4 animate-in zoom-in-95">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-800 font-bold truncate">{file.name}</p>
                        </div>
                        <button onClick={handleUpload} disabled={uploading}
                            className="bg-orange-500 text-white hover:bg-orange-600 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all">
                            {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : (uploadCategory === 'FLYER' ? 'PROCESAR' : 'SUBIR')}
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Search + Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="premium-card">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <h3 className="section-label !mb-0">Inventario</h3>
                
                <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
                    <button 
                        onClick={() => setSearchMode('classic')}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${searchMode === 'classic' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Tradicional
                    </button>
                    <button 
                        onClick={() => setSearchMode('ai')}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 ${searchMode === 'ai' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
                    >
                        <Bot className="w-3 h-3" /> IA Match
                    </button>
                </div>
            </div>
          
            {searchMode === 'classic' ? (
                <div className="space-y-4">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Buscá por destino, país o tour..."
                        className="standard-input pl-12 py-4"
                    />
                    <button onClick={() => handleSearch()} disabled={searching}
                        className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary !px-4 !py-2 !rounded-xl">
                        {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'BUSCAR'}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                        value={filterCategory}
                        onChange={(e) => { 
                            setFilterCategory(e.target.value); 
                            handleSearch(e.target.value); 
                        }}
                        className="standard-input bg-slate-50 cursor-pointer"
                    >
                        <option value="">Todas las Categorías</option>
                        <option value="PAQUETE">Paquetes Cerrados</option>
                        <option value="SALIDA GRUPAL">Salidas Grupales</option>
                        <option value="CIRCUITO">Circuitos</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Operador..."
                        value={filterOperator}
                        onChange={(e) => setFilterOperator(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="standard-input bg-slate-50"
                    />
                    <input
                        type="number"
                        placeholder="Precio Max..."
                        value={filterMaxPrice}
                        onChange={(e) => setFilterMaxPrice(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="standard-input bg-slate-50"
                    />
                </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="relative">
                    <div className="absolute top-4 left-4">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                    </div>
                    <textarea
                        value={aiQuote}
                        onChange={(e) => setAiQuote(e.target.value)}
                        placeholder="Pegá aquí el pedido de tu cliente... la IA encontrará el viaje ideal."
                        className="standard-input !pl-12 min-h-[100px] py-4 resize-none text-sm"
                    />
                </div>
                <button onClick={handleAiSearch} disabled={aiSearching || !aiQuote.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-md transition-all">
                    {aiSearching ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Analizar Catálogo'}
                </button>
                </div>
            )}
          </div>

          <div className="space-y-4 mt-8">
            {searchMode === 'classic' && circuits.length === 0 && !searching && (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Sin resultados</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
                {searchMode === 'classic' && circuits.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((c) => renderCircuit(c))}
                {searchMode === 'ai' && aiMatches.map((m) => renderCircuit(m.circuit, m))}
            </div>

            {searchMode === 'classic' && circuits.length > 0 && (
                <div className="flex justify-center items-center gap-4 py-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="secondary-button text-[10px]">Anterior</button>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pg {page} / {Math.ceil(circuits.length / ITEMS_PER_PAGE)}</span>
                    <button onClick={() => setPage(p => Math.min(Math.ceil(circuits.length / ITEMS_PER_PAGE), p + 1))} disabled={page === Math.ceil(circuits.length / ITEMS_PER_PAGE)} className="secondary-button text-[10px]">Siguiente</button>
                </div>
            )}
          </div>
        </div>
      </div>

      {diffusionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-3xl">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-orange-500" /> Material: {diffusionModal.circuit?.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleGenerateDiffusion(diffusionModal.circuit.id, diffusionModal.circuit, true)} 
                  disabled={generatingId === diffusionModal.circuit.id}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  {generatingId === diffusionModal.circuit.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                  Regenerar con IA
                </button>
                <button onClick={() => setDiffusionModal(null)} className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col border-r border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    📱 Mensaje WhatsApp
                  </h4>
                  <button onClick={copyToClipboard} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 border border-emerald-200">
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <pre className="text-slate-700 text-[13px] whitespace-pre-wrap font-sans leading-relaxed">
                      {diffusionModal.whatsapp}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex flex-col bg-slate-100 relative overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
                  <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                    🖼️ Diseño Flyer
                  </h4>
                  <div className="flex gap-2">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => handleModalFormatChange('post')}
                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${modalFormat === 'post' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                      >
                        Post
                      </button>
                      <button
                        onClick={() => handleModalFormatChange('story')}
                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${modalFormat === 'story' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                      >
                        Story
                      </button>
                    </div>
                    <button onClick={openFullPreview} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-lg transition-all" title="Ver completo">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={handleDownload} className="primary-button !px-3 !py-1.5 !text-[10px]">
                      <Download className="w-3.5 h-3.5" /> Descargar
                    </button>
                  </div>
                </div>
                {(modalHeroImages.length > 0 || modalPackages.length > 0) && (
                  <div className="border-b border-slate-200 bg-white p-4 space-y-4 max-h-[38vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fondo sugerido por IA</p>
                        <p className="text-[11px] text-slate-400 mt-1">{modalData.destination || 'Destino detectado'}</p>
                      </div>
                      <label className="p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-slate-500">
                        <ImageIcon className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleModalAssetUpload(f, 'hero') }}
                        />
                      </label>
                    </div>

                    {modalHeroImages.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {modalHeroImages.map((img, idx) => (
                          <button
                            key={`${img}-${idx}`}
                            onClick={() => {
                              const nextHeroes = [img, ...modalHeroImages.filter((entry) => entry !== img)].slice(0, 3)
                              setModalHeroImages(nextHeroes)
                              refreshModalFlyer(selectedHotels, nextHeroes, modalItemImages)
                            }}
                            className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${idx === 0 ? 'border-orange-500' : 'border-slate-200'}`}
                          >
                            <img src={img} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {modalPackages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hoteles detectados</p>
                        {modalPackages.map((pkg: any, idx: number) => {
                          const visible = selectedHotels[pkg.hotelName] !== false
                          const firstReview = pkg.reviewSummary || pkg.reviews?.find((review: any) => review.text)?.text || ''
                          return (
                            <div key={`${pkg.hotelName}-${idx}`} className={`rounded-xl border p-3 transition-all ${visible ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleHotelInFlyer(pkg.hotelName)}
                                  className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${visible ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-300 text-transparent'}`}
                                  title="Mostrar en flyer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                {getHotelImage(pkg) ? (
                                  <img src={getHotelImage(pkg)} className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                                ) : (
                                  <div className="w-14 h-14 rounded-lg bg-slate-200 border border-slate-200 shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-black text-slate-800 truncate">{pkg.hotelName}</p>
                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                        {pkg.rating && (
                                          <span className="font-black text-yellow-500 flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400" /> {pkg.rating}
                                          </span>
                                        )}
                                        {pkg.numReviews ? (
                                          <span className="text-slate-500">{pkg.numReviews} reseñas</span>
                                        ) : null}
                                        {pkg.mapsUrl && (
                                          <a href={pkg.mapsUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold">Maps</a>
                                        )}
                                      </div>
                                    </div>
                                    <label className="p-2 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 text-slate-500 shrink-0">
                                      <ImageIcon className="w-4 h-4" />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleModalAssetUpload(f, 'hotel', pkg.hotelName) }}
                                      />
                                    </label>
                                  </div>
                                  {firstReview && (
                                    <p className="mt-2 text-[11px] text-slate-600 leading-relaxed line-clamp-2">{firstReview}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 flex-1 flex justify-center items-start overflow-auto custom-scrollbar border-inner">
                  <div
                    className="relative w-full shadow-xl group rounded-2xl overflow-hidden border border-slate-300"
                    style={{ maxWidth: `${flyerPreviewWidth}px`, aspectRatio: modalFormat === 'story' ? '1080 / 1920' : '1080 / 1350' }}
                  >
                    {renderingFlyer && (
                      <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                      </div>
                    )}
                    <iframe 
                      id="flyer-preview-frame"
                      srcDoc={diffusionModal.flyerHtml} 
                      className="absolute inset-0 border-0 bg-white origin-top-left"
                      style={{ transform: `scale(${flyerPreviewWidth / 1080})`, width: '1080px', height: `${flyerPreviewHeight}px` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
