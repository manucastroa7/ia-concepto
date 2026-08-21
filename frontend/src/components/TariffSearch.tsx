import { useState, useRef, useEffect } from 'react'
import { 
  Upload, Search, Trash2, RefreshCw, FileText, ChevronDown, Sparkles, Bot, Megaphone, 
  Copy, Check, Download, X, Hotel, ExternalLink, Globe, Image as ImageIcon, Star,
  Filter, Layers, MapPin, Zap, CheckCircle2, SlidersHorizontal, Eye, Calendar, Sparkle
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { toPng } from 'html-to-image'

export function TariffSearch() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [operatorInput, setOperatorInput] = useState('')
  const [uploadCategory, setUploadCategory] = useState('AUTO')
  const [circuits, setCircuits] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  
  // Normal search
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 20
  
  const [filterOperator, setFilterOperator] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [onlyPublished, setOnlyPublished] = useState(false)
  
  // AI Search
  const [searchMode, setSearchMode] = useState<'classic' | 'ai'>('classic')
  const [aiQuote, setAiQuote] = useState('')
  const [aiSearching, setAiSearching] = useState(false)
  const [aiMatches, setAiMatches] = useState<any[]>([])

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeCardTab, setActiveCardTab] = useState<Record<string, 'route' | 'hotels' | 'inclusions' | 'web'>>({})
  
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

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

  const handleSearch = async (catOverride?: string, publishedOverride?: boolean) => {
    setSearching(true)
    setPage(1)
    try {
      const params: any = {}
      if (searchQuery) params.destination = searchQuery
      if (filterOperator) params.operator = filterOperator
      if (filterMaxPrice) params.maxPrice = filterMaxPrice
      
      const cat = typeof catOverride === 'string' ? catOverride : filterCategory;
      if (cat) params.categoria = cat

      const pub = typeof publishedOverride === 'boolean' ? publishedOverride : onlyPublished;
      if (pub) params.isPublished = 'true'
 
      const res = await axios.get('/api/tariffs/search', { params })
      let data = Array.isArray(res.data) ? res.data : []
      if (pub) {
        data = data.filter((c: any) => c.isPublished)
      }
      setCircuits(data)
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

  // Calculate statistics for top KPI banner
  const totalOffers = circuits.length
  const webPublishedCount = circuits.filter(c => c.isPublished).length
  const groupDepartureCount = circuits.filter(c => c.categoria === 'SALIDA GRUPAL').length
  const packageCount = circuits.filter(c => c.categoria === 'PAQUETE').length

  const renderCircuit = (c: any, aiData?: any) => {
    const isExpanded = expandedId === c.id
    const cardTab = activeCardTab[c.id] || 'route'

    return (
      <div 
        key={c.id || aiData?.circuitId} 
        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden group/card shadow-sm hover:shadow-xl hover:border-orange-200/80 ${
          aiData ? 'ring-2 ring-orange-500/40 bg-gradient-to-b from-orange-50/30 to-white' : 'border-slate-200/80'
        }`}
      >
        {aiData && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-spin text-amber-200" /> 
              <span>Match Inteligente: {aiData.score}%</span>
            </div>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
              Recomendación IA
            </span>
          </div>
        )}

        {aiData?.justificacion && (
          <div className="bg-orange-50/80 px-6 py-2.5 border-b border-orange-100/60 text-slate-700 text-xs font-medium leading-relaxed flex items-start gap-2">
            <Sparkle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <span>{aiData.justificacion}</span>
          </div>
        )}

        {/* Card Header & Main Specs */}
        <div 
          className="p-5 md:p-6 cursor-pointer hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5"
          onClick={() => setExpandedId(isExpanded ? null : c.id)}
        >
          <div className="flex-1 min-w-0 space-y-3">
            {/* Badges line */}
            <div className="flex flex-wrap items-center gap-2">
              {c.categoria && (
                <span className={`text-[9.5px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border flex items-center gap-1 shadow-2xs ${
                  c.categoria === 'PAQUETE' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                  c.categoria === 'SALIDA GRUPAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <Layers className="w-3 h-3" />
                  {c.categoria}
                </span>
              )}

              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" />
                {c.operator || 'Operador Local'}
              </span>

              {c.isPublished && (
                <span className="text-[9.5px] font-black px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Publicado en Web
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase group-hover/card:text-orange-600 transition-colors leading-snug">
              {c.title || c.nombre || 'Circuito Turístico'}
            </h4>

            {/* Key details pill grid */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-600">
              {c.duration && (
                <span className="text-xs font-semibold flex items-center gap-1.5 bg-slate-100/80 text-slate-700 px-2.5 py-1 rounded-md">
                  <RefreshCw className="w-3.5 h-3.5 text-orange-500" /> {c.duration}
                </span>
              )}
              {c.dates && (
                <span className="text-xs font-semibold flex items-center gap-1.5 bg-slate-100/80 text-slate-700 px-2.5 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> {c.dates}
                </span>
              )}
              {c.price && (
                <div className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-lg font-black text-sm shadow-sm shadow-orange-500/20">
                  <span className="text-xs text-orange-100 uppercase">{c.currency || 'USD'}</span>
                  <span>{c.price.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); handleGenerateDiffusion(c.id, c); }}
              disabled={generatingId === c.id}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center gap-2 group/btn active:scale-95"
            >
              {generatingId === c.id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Megaphone className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
              )}
              <span>Difusión IA & Flyer</span>
            </button>

            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isExpanded ? 'bg-slate-900 text-white' : 'text-slate-400 bg-slate-100 border border-slate-200 group-hover/card:border-slate-300'
            }`}>
              <ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {!aiData && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all flex items-center justify-center"
                title="Eliminar oferta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Tabbed Body */}
        {isExpanded && (
          <div className="border-t border-slate-200/80 bg-slate-50/60 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
            {/* Sub-tabs header */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveCardTab({ ...activeCardTab, [c.id]: 'route' })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  cardTab === 'route' ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Ruta e Itinerario ({c.itinerario_resumido?.length || 0})
              </button>
              <button
                onClick={() => setActiveCardTab({ ...activeCardTab, [c.id]: 'hotels' })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  cardTab === 'hotels' ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Hotel className="w-3.5 h-3.5 text-blue-500" />
                Alojamientos ({c.hoteles_previstos?.length || 0})
              </button>
              <button
                onClick={() => setActiveCardTab({ ...activeCardTab, [c.id]: 'inclusions' })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  cardTab === 'inclusions' ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Inclusiones ({c.inclusions?.length || 0})
              </button>
              <button
                onClick={() => setActiveCardTab({ ...activeCardTab, [c.id]: 'web' })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  cardTab === 'web' ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-purple-500" />
                Publicación CRM Web
              </button>
            </div>

            {/* Tab content view */}
            <div>
              {cardTab === 'route' && (
                <div>
                  {c.itinerario_resumido && c.itinerario_resumido.length > 0 ? (
                    <div className="space-y-3">
                      {c.itinerario_resumido.map((it: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                          <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                            {it.dia}
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {it.descripcion}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay itinerario detallado cargado para este circuito.</p>
                  )}
                </div>
              )}

              {cardTab === 'hotels' && (
                <div>
                  {c.hoteles_previstos && c.hoteles_previstos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {c.hoteles_previstos.map((hot: string, i: number) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Hotel className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate">{hot}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay hoteles especificados.</p>
                  )}
                </div>
              )}

              {cardTab === 'inclusions' && (
                <div>
                  {c.inclusions && c.inclusions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {c.inclusions.map((inc: string, i: number) => (
                        <div key={i} className="text-xs text-slate-700 flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-medium">{inc}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No se indicaron inclusiones específicas.</p>
                  )}
                </div>
              )}

              {cardTab === 'web' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h6 className="text-xs font-black uppercase text-slate-900 tracking-wider">Visibilidad en la Web CRM</h6>
                      <p className="text-[11px] text-slate-500">Publicá este viaje directamente en el catálogo online de tu agencia</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleWebPublish(c, c.webCategory || 'CARIBE'); }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                          c.isPublished ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          c.isPublished ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <span className={`text-xs font-bold uppercase tracking-wider ${c.isPublished ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {c.isPublished ? 'ACTIVO (EN VIVO)' : 'INACTIVO'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoría Web Destino</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                        value={c.webCategory || 'CARIBE'}
                        onChange={(e) => { 
                          e.stopPropagation();
                          if (c.isPublished) toggleWebPublish(c, e.target.value); 
                        }}
                        disabled={!c.isPublished}
                      >
                        <option value="CARIBE">Caribe</option>
                        <option value="BRASIL">Brasil</option>
                        <option value="EUROPA">Europa</option>
                        <option value="USA">USA</option>
                        <option value="SPORTS">Eventos & Sports</option>
                        <option value="SALIDAS_GRUPALES">Salidas Grupales</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const modalPackages = diffusionModal
    ? ((diffusionModal.flyerData || diffusionModal.extracted || {}).packages || [])
    : []
  const modalData = diffusionModal
    ? (diffusionModal.flyerData || diffusionModal.extracted || {})
    : {}
  const flyerPreviewWidth = modalFormat === 'story' ? 420 : 540
  const flyerPreviewHeight = modalFormat === 'story' ? 1920 : 1350

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* TOP HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
              <Megaphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-orange-500/20 text-orange-300 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border border-orange-500/30">
                  Marketing & Difusión
                </span>
                <span className="text-slate-400 text-xs">• Motor Inteligente</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                Buscador de Ofertas & Flyers
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Catálogo unificado de circuitos, ingesta asistida por IA y generador automático de flyers y copies para WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleResetDatabase}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900/50 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Resetear Catálogo</span>
            </button>
          </div>
        </div>

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/60">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Total Ofertas</span>
              <Layers className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-black text-white">{totalOffers}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Publicados Web</span>
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400">{webPublishedCount}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Salidas Grupales</span>
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-indigo-300">{groupDepartureCount}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest">Paquetes Cerrados</span>
              <Zap className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-sky-300">{packageCount}</p>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: UPLOAD PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Ingesta de Documentación</h3>
                <p className="text-[11px] text-slate-500">Cargar tarifario PDF, Excel/CSV o Flyer visual</p>
              </div>
              <Upload className="w-5 h-5 text-orange-500" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Tipo de Ingesta</label>
                <select 
                  value={uploadCategory} 
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  <option value="AUTO">Automático (Detección IA)</option>
                  <option value="FLYER">Flyer / Promoción Visual (Imagen)</option>
                  <option value="CIRCUITO">Circuitos Turísticos</option>
                  <option value="PAQUETE">Paquetes Vacacionales</option>
                  <option value="SALIDA GRUPAL">Salidas Grupales</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Operadora (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej: Catai, Europamundo, Travelplan..." 
                  value={operatorInput}
                  onChange={(e) => setOperatorInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Drag & Drop Zone */}
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-orange-500 bg-orange-50/80 scale-[1.02]' 
                    : 'border-slate-300 hover:border-orange-400 bg-slate-50/60 hover:bg-orange-50/40'
                }`}
              >
                <div className="w-12 h-12 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-orange-500 transition-colors">
                  <Upload className={`w-6 h-6 ${isDragging ? 'text-orange-500 animate-bounce' : 'text-slate-400'}`} />
                </div>
                <p className="text-slate-900 font-bold text-xs uppercase tracking-wider">
                  {isDragging ? 'Soltá el archivo aquí' : 'Arrastra o elegí un archivo'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Soporta PDF, CSV, Excel e imágenes PNG/JPG</p>
              </div>

              <input 
                ref={inputRef} 
                type="file" 
                accept="image/*,.pdf,.xlsx,.csv" 
                className="hidden" 
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }} 
              />

              {file && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3 animate-in zoom-in-95">
                  <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-900 font-bold truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    {uploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      uploadCategory === 'FLYER' ? 'Procesar' : 'Subir'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SEARCH + INVENTORY RESULTS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6">
            
            {/* Header & Search Mode Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Catálogo de Ofertas</h3>
                <p className="text-[11px] text-slate-500">Filtrá por operador, categoría o consultá con IA</p>
              </div>

              {/* Segmented control for search mode */}
              <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/60">
                <button 
                  onClick={() => setSearchMode('classic')}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    searchMode === 'classic' 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-orange-500" />
                  Búsqueda Directa
                </button>
                <button 
                  onClick={() => setSearchMode('ai')}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    searchMode === 'ai' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  IA Match Assistant
                </button>
              </div>
            </div>

            {/* Mode-specific input area */}
            {searchMode === 'classic' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Buscá por destino (ej: Madrid, Cancún, Turquía)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-28 py-3.5 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => { setSearchQuery(''); handleSearch() }}
                      className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleSearch()} 
                    disabled={searching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20"
                  >
                    {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'BUSCAR'}
                  </button>
                </div>

                {/* Filter chips bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1">Filtros:</span>
                  <button 
                    onClick={() => { setFilterCategory(''); setOnlyPublished(false); handleSearch('', false); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      !filterCategory && !onlyPublished ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => { setFilterCategory('PAQUETE'); handleSearch('PAQUETE'); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterCategory === 'PAQUETE' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                    }`}
                  >
                    Paquetes
                  </button>
                  <button 
                    onClick={() => { setFilterCategory('SALIDA GRUPAL'); handleSearch('SALIDA GRUPAL'); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterCategory === 'SALIDA GRUPAL' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    Salidas Grupales
                  </button>
                  <button 
                    onClick={() => { setFilterCategory('CIRCUITO'); handleSearch('CIRCUITO'); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterCategory === 'CIRCUITO' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Circuitos
                  </button>
                  <button 
                    onClick={() => { 
                      const nextPub = !onlyPublished;
                      setOnlyPublished(nextPub);
                      handleSearch(undefined, nextPub); 
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      onlyPublished ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    🌐 En Web CRM
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Operador (ej: Catai)..."
                    value={filterOperator}
                    onChange={(e) => setFilterOperator(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-orange-400"
                  />
                  <input
                    type="number"
                    placeholder="Precio máximo (USD)..."
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <div className="absolute top-4 left-4">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                  </div>
                  <textarea
                    value={aiQuote}
                    onChange={(e) => setAiQuote(e.target.value)}
                    placeholder="Pegá aquí la solicitud de tu cliente (ej: 'Busco 10 días en Europa en Mayo con hoteles 4 estrellas y presupuesto de 2500 USD')..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[110px] resize-none shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleAiSearch} 
                  disabled={aiSearching || !aiQuote.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  {aiSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      <span>Analizar e Matchear Catálogo</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* RESULTS LIST */}
          <div className="space-y-4">
            {searchMode === 'classic' && circuits.length === 0 && !searching && (
              <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sin ofertas encontradas</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Prueba cambiando el término de búsqueda o subiendo un nuevo tarifario PDF desde la columna izquierda.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              {searchMode === 'classic' && circuits.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((c) => renderCircuit(c))}
              {searchMode === 'ai' && aiMatches.map((m) => renderCircuit(m.circuit, m))}
            </div>

            {searchMode === 'classic' && circuits.length > 0 && (
              <div className="flex justify-center items-center gap-4 py-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Anterior
                </button>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Página {page} de {Math.ceil(circuits.length / ITEMS_PER_PAGE)}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(Math.ceil(circuits.length / ITEMS_PER_PAGE), p + 1))} 
                  disabled={page === Math.ceil(circuits.length / ITEMS_PER_PAGE)} 
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIFFUSION MODAL (MATERIAL PROMO + FLYER PREVIEW) */}
      {diffusionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Kit de Difusión: {diffusionModal.circuit?.title || 'Promoción'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Mensaje directo para WhatsApp y Flyer dinámico</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleGenerateDiffusion(diffusionModal.circuit.id, diffusionModal.circuit, true)} 
                  disabled={generatingId === diffusionModal.circuit.id}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  {generatingId === diffusionModal.circuit.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>Regenerar con IA</span>
                </button>

                <button 
                  onClick={() => setDiffusionModal(null)} 
                  className="p-2 bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Grid */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
              
              {/* Left Column: WhatsApp Copy */}
              <div className="flex flex-col border-r border-slate-200 bg-slate-50 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    📱 Copia WhatsApp Promocional
                  </span>
                  <button 
                    onClick={copyToClipboard} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <pre className="text-slate-800 text-xs whitespace-pre-wrap font-sans leading-relaxed">
                      {diffusionModal.whatsapp}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Flyer Preview */}
              <div className="flex flex-col bg-slate-100 overflow-hidden relative">
                
                {/* Format & Export Bar */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    🖼️ Flyer Diseñado por IA
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => handleModalFormatChange('post')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          modalFormat === 'post' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Post (1:1)
                      </button>
                      <button
                        onClick={() => handleModalFormatChange('story')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          modalFormat === 'story' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Story (9:16)
                      </button>
                    </div>

                    <button 
                      onClick={openFullPreview} 
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition-all" 
                      title="Abrir en pestaña nueva"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={handleDownload} 
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar PNG</span>
                    </button>
                  </div>
                </div>

                {/* Hero / Hotel Controls Carousel */}
                {(modalHeroImages.length > 0 || modalPackages.length > 0) && (
                  <div className="border-b border-slate-200 bg-white p-4 space-y-3 max-h-[35vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Imágenes sugeridas por IA</p>
                      <label className="p-1.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Subir Hero</span>
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
                            className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                              idx === 0 ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={img} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {modalPackages.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Hoteles en Flyer</p>
                        {modalPackages.map((pkg: any, idx: number) => {
                          const visible = selectedHotels[pkg.hotelName] !== false
                          return (
                            <div key={`${pkg.hotelName}-${idx}`} className={`rounded-xl border p-2.5 transition-all flex items-center justify-between gap-3 ${
                              visible ? 'bg-orange-50/70 border-orange-200' : 'bg-slate-50 border-slate-200 opacity-60'
                            }`}>
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  onClick={() => toggleHotelInFlyer(pkg.hotelName)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                                    visible ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-300 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold text-slate-800 truncate">{pkg.hotelName}</span>
                              </div>

                              <label className="p-1.5 border border-slate-200 bg-white rounded-lg cursor-pointer hover:bg-slate-50 text-slate-500 shrink-0">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleModalAssetUpload(f, 'hotel', pkg.hotelName) }}
                                />
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Viewport Frame */}
                <div className="p-6 flex-1 flex justify-center items-start overflow-auto custom-scrollbar">
                  <div
                    className="relative w-full shadow-2xl rounded-2xl overflow-hidden border border-slate-300 bg-white"
                    style={{ maxWidth: `${flyerPreviewWidth}px`, aspectRatio: modalFormat === 'story' ? '1080 / 1920' : '1080 / 1350' }}
                  >
                    {renderingFlyer && (
                      <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                        <RefreshCw className="w-7 h-7 animate-spin text-orange-500" />
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

export default TariffSearch
