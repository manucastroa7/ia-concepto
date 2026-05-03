import { useRef, useState } from 'react'
import axios from 'axios'
import { Upload, Download, Check, RefreshCw, Image as ImageIcon, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as htmlToImage from 'html-to-image'
import { Share2 } from 'lucide-react'

export function FlyerExtractor() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [itemImages, setItemImages] = useState<Record<string, string>>({})
  const [assetLibrary, setAssetLibrary] = useState<any[]>([])
  const [attractions, setAttractions] = useState<any[]>([])
  const [exportFormat, setExportFormat] = useState<'post' | 'story'>('post')
  const [assignDrafts, setAssignDrafts] = useState<Record<number, string>>({})
  const [igStories, setIgStories] = useState<any>(null)
  const [igLoading, setIgLoading] = useState(false)
  const [igStoriesOpen, setIgStoriesOpen] = useState(false)
  const [videoLoadingId, setVideoLoadingId] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const flyerContainerRef = useRef<HTMLDivElement>(null)
  const flyerDimensions = exportFormat === 'story'
    ? { width: 1080, minHeight: 1920 }
    : { width: 800, minHeight: 1200 }

  const normalizeHotelName = (value?: string | null) =>
    (value || '').toLowerCase().trim().replace(/\s+/g, ' ')

  const getCurrentItemImages = () => {
    const fromAssets = assetLibrary.reduce((acc: Record<string, string>, asset: any) => {
      if (asset.hotelName && asset.imageUrl) {
        acc[asset.hotelName] = asset.imageUrl
      }
      return acc
    }, {})

    return { ...fromAssets, ...itemImages }
  }

  const buildItemImageMapFromLibrary = (library: any[], manualImages: Record<string, string>) => {
    const fromAssets = library.reduce((acc: Record<string, string>, asset: any) => {
      if (asset.hotelName && asset.imageUrl) {
        acc[asset.hotelName] = asset.imageUrl
      }
      return acc
    }, {})

    return { ...fromAssets, ...manualImages }
  }

  const getHotelImage = (hotelName?: string, fallback?: string) => {
    if (!hotelName) return fallback
    const currentItemImages = getCurrentItemImages()
    if (currentItemImages[hotelName]) return currentItemImages[hotelName]

    const normalized = normalizeHotelName(hotelName)
    const entry = Object.entries(currentItemImages).find(([key]) => {
      const normalizedKey = normalizeHotelName(key)
      return normalizedKey === normalized || normalizedKey.includes(normalized) || normalized.includes(normalizedKey)
    })

    return entry?.[1] || fallback
  }

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setHeroImages([])
    setItemImages({})
    setAssetLibrary([])
    setAttractions([])
    setAssignDrafts({})
    setIgStories(null)
    setIgStoriesOpen(false)
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const fetchLibrary = async (dest: string) => {
    try {
      const res = await axios.get(`/api/flyers/assets?destination=${encodeURIComponent(dest)}`)
      setAssetLibrary(res.data)
    } catch (e) {}
  }

  const fetchAttractions = async (dest: string) => {
    try {
      const res = await axios.get(`/api/flyers/attractions?destination=${encodeURIComponent(dest)}`)
      const nextAttractions = res.data || []
      setAttractions(nextAttractions)
      if (result?.extracted) {
        try {
          const renderRes = await axios.post('/api/flyers/render', {
            data: result.extracted,
            options: { heroImages, itemImages, attractions: nextAttractions, format: exportFormat }
          })
          setResult((prev: any) => ({ ...prev, flyerHtml: renderRes.data.flyerHtml }))
        } catch (e) {}
      }
    } catch (e) {
      setAttractions([])
    }
  }

  const handleExtract = async () => {
    if (!file) return
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`/api/flyers/extract?format=${exportFormat}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      setHeroImages(res.data.suggestedImages || [])
      setItemImages(res.data.suggestedItemImages || {})
      setAttractions(res.data.attractions || [])
      if (res.data.extracted?.destination) {
        fetchLibrary(res.data.extracted.destination)
        if (!res.data.attractions?.length) {
          fetchAttractions(res.data.extracted.destination)
        }
      }
      toast.success('¡Paquete guardado automáticamente en el historial!', { duration: 4000 })
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message
      toast.error('Error al procesar el flyer: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndClose = () => {
    toast.success('Cambios guardados en tu Tarifario / Historial');
    setFile(null);
    setResult(null);
    setPreview(null);
  }

  const refreshFlyerPreview = async (
    currentHeroes: string[],
    currentItems: Record<string, string>,
    nextFormat: 'post' | 'story' = exportFormat
  ) => {
    if (!result?.extracted) return
    try {
      const res = await axios.post('/api/flyers/render', {
        data: result.extracted,
        options: { heroImages: currentHeroes, itemImages: currentItems, attractions, format: nextFormat }
      })
      setResult((prev: any) => ({ ...prev, flyerHtml: res.data.flyerHtml }))
    } catch (e) {}
  }

  const handleUploadAsset = async (nextFile: File, destination: string, type: 'hero' | 'hotel', hotelName?: string) => {
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', nextFile)
      form.append('destination', destination)
      if (hotelName) form.append('hotelName', hotelName)
      const res = await axios.post('/api/flyers/assets', form)
      const imageUrl = res.data.imageUrl

      if (type === 'hero') {
        const newHeroes = [...heroImages, imageUrl].slice(0, 3)
        setHeroImages(newHeroes)
        refreshFlyerPreview(newHeroes, itemImages)
      } else if (hotelName) {
        const newItems = { ...itemImages, [hotelName]: imageUrl }
        setItemImages(newItems)
        refreshFlyerPreview(heroImages, newItems)
      }

      fetchLibrary(destination)
    } catch (e) {
      alert('Error al subir imagen')
    } finally {
      setLoading(false)
    }
  }

  const toggleHeroImage = (url: string) => {
    const newHeroes = heroImages.includes(url)
      ? heroImages.filter(i => i !== url)
      : [...heroImages, url].slice(0, 3)
    setHeroImages(newHeroes)
    refreshFlyerPreview(newHeroes, itemImages)
  }

  const handleFormatChange = async (nextFormat: 'post' | 'story') => {
    setExportFormat(nextFormat)
    if (result?.extracted) {
      await refreshFlyerPreview(heroImages, itemImages, nextFormat)
    }
  }

  const deleteAsset = async (assetId: number) => {
    if (!window.confirm("¿Estás seguro de que deseás eliminar esta imagen?")) return;
    try {
      await axios.delete(`/api/flyers/assets/${assetId}`)
      const removed = assetLibrary.find((asset) => asset.id === assetId)
      const nextLibrary = assetLibrary.filter((asset) => asset.id !== assetId)
      setAssetLibrary(nextLibrary)

      if (removed?.imageUrl) {
        const nextHeroes = heroImages.filter((img) => img !== removed.imageUrl)
        const nextItems = Object.fromEntries(
          Object.entries(itemImages).filter(([, value]) => value !== removed.imageUrl)
        )
        setHeroImages(nextHeroes)
        setItemImages(nextItems)
        refreshFlyerPreview(nextHeroes, nextItems)
      }
      toast.success("Imagen eliminada exitosamente")
    } catch (e: any) {
      toast.error("No se pudo eliminar la imagen")
    }
  }

  const assignAssetToHotel = async (asset: any, hotelName: string) => {
    try {
      await axios.patch(`/api/flyers/assets/${asset.id}`, { hotelName: hotelName || null })
      const nextLibrary = assetLibrary.map((entry) =>
        entry.id === asset.id ? { ...entry, hotelName: hotelName || null } : entry
      )
      setAssetLibrary(nextLibrary)

      if (hotelName) {
        const nextItems = { ...itemImages, [hotelName]: asset.imageUrl }
        setItemImages(nextItems)
        refreshFlyerPreview(heroImages, nextItems)
      } else {
        refreshFlyerPreview(heroImages, buildItemImageMapFromLibrary(nextLibrary, itemImages))
      }
    } catch (e) {
      alert('No se pudo asignar la imagen al hotel')
    }
  }

  const copyWhatsapp = () => {
    if (!result?.whatsapp) return
    navigator.clipboard.writeText(result.whatsapp)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyText = (value: string) => {
    navigator.clipboard.writeText(value || '')
  }

  const generateInstagramStories = async () => {
    if (!result?.extracted) return
    setIgLoading(true)
    try {
      const res = await axios.post('/api/flyers/instagram-stories', {
        data: result.extracted
      })
      setIgStories(res.data)
      setIgStoriesOpen(true)
    } catch (e: any) {
      alert('No se pudieron generar las historias de Instagram')
    } finally {
      setIgLoading(false)
    }
  }

  const resetInstagramStories = () => {
    setIgStories(null)
    setIgStoriesOpen(false)
  }

  const createStoryVideo = async (video: any) => {
    if (!igStories) return
    setVideoLoadingId(video.id)
    try {
      const res = await axios.post('/api/flyers/story-video', {
        videoUrl: video.videoUrl,
        hookText: igStories.story1?.hook || '',
        overlayText: igStories.story3?.overlayText || '',
        ctaText: igStories.story3?.cta || '',
        destination: result?.extracted?.destination || 'story'
      }, {
        responseType: 'blob'
      })

      const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'video/mp4' }))
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `story-${(result?.extracted?.destination || 'destino').toLowerCase().replace(/[^a-z0-9-_]+/g, '-')}.mp4`
      a.click()
      window.URL.revokeObjectURL(blobUrl)
    } catch (e) {
      alert('No se pudo crear el video story')
    } finally {
      setVideoLoadingId(null)
    }
  }

  const waitForImages = async (element: HTMLElement) => {
    const images = element.getElementsByTagName('img')
    const promises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise(resolve => {
        img.onload = resolve
        img.onerror = resolve
      })
    })
    await Promise.all(promises)
    await new Promise(r => setTimeout(r, 500))
  }

  const captureFlyer = async () => {
    if (!flyerContainerRef.current) throw new Error('No container')
    setLoading(true)
    try {
      await waitForImages(flyerContainerRef.current)
      return await htmlToImage.toJpeg(flyerContainerRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadJpg = async () => {
    try {
      const dataUrl = await captureFlyer()
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `flyer-${exportFormat}-${result.extracted?.destination || 'promo'}.jpg`
      a.click()
    } catch (err) {
      alert('Error al descargar JPG. Por favor intenta de nuevo.')
    }
  }

  const shareFlyer = async (target: 'whatsapp' | 'instagram') => {
    try {
      if (target === 'whatsapp') {
        const text = encodeURIComponent(result?.whatsapp || '')
        window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
        return
      }

      const dataUrl = await captureFlyer()
      const arr = dataUrl.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) u8arr[n] = bstr.charCodeAt(n)

      const shareFile = new File([u8arr], `flyer-${exportFormat}-${result.extracted?.destination || 'oferta'}.jpg`, { type: mime })
      const shareData = {
        files: [shareFile],
        title: `${exportFormat === 'story' ? 'Story' : 'Post'} ${result.extracted?.destination || 'Destino'}`,
        text: undefined,
      }

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        alert(`Tu navegador no soporta compartir directamente a Instagram. Se descargará la imagen.`)
        downloadJpg()
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert('Error al compartir. Intenta descargar el JPG manualmente.')
      }
    }
  }

  return (
    <div className="w-full space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3">
             <ImageIcon className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="page-title">Extractor de <span className="text-orange-500">Flyers</span></h1>
            <p className="page-subtitle">Conversión de material comercial inteligente</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200">
            <span className="text-xl font-black text-slate-900 leading-none">{heroImages.length}</span>
            <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Portadas</span>
          </div>
          <div className="bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200">
            <span className="text-xl font-black text-slate-900 leading-none">{result?.extracted?.packages?.length || 0}</span>
            <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Paquetes</span>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="space-y-8">
          <section
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="group premium-card border-dashed border-2 bg-slate-50/50 cursor-pointer transition-all hover:bg-white hover:border-orange-500/50 py-16"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-100 shadow-xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <Upload className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2">Subí el flyer original</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Formatos: PNG, JPG o PDF</p>
                {file && (
                  <div className="mt-8 flex flex-col items-center gap-6">
                    <div className="badge badge-slate flex py-3 px-6 gap-3 items-center">
                      <ImageIcon className="w-4 h-4" />
                      {file.name}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleExtract()
                      }}
                      disabled={loading}
                      className="btn-primary min-w-[200px]"
                    >
                      {loading ? 'Procesando...' : 'Procesar flyer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {preview && (
            <div className="rounded-[28px] overflow-hidden border border-slate-200 bg-black/20">
              <img src={preview} alt="preview" className="w-full object-contain max-h-[440px]" />
            </div>
          )}

          {!file && (
            <div className="min-h-[220px] flex flex-col items-center justify-center text-center rounded-[28px] border border-dashed border-slate-100 bg-white/[0.01]">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                <ImageIcon className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-lg font-bold text-slate-500">Carga un flyer para empezar</p>
              <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto">Cuando lo proceses, aqui van a aparecer los hoteles, las imagenes y los botones de exportacion.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="premium-card !p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="badge badge-orange font-black">Procesado</div>
                <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{file?.name || 'Archivo actual'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => handleFormatChange('post')}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${exportFormat === 'post' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Post
                  </button>
                  <button
                    onClick={() => handleFormatChange('story')}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${exportFormat === 'story' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Story
                  </button>
                </div>
                <button onClick={() => inputRef.current?.click()} className="btn-secondary !px-4 !py-2">
                  Cambiar
                </button>
                <button onClick={handleExtract} disabled={loading || !file} className="btn-outline !px-4 !py-2">
                  {loading ? '...' : 'Reprocesar'}
                </button>
                <button onClick={() => setShowModal(true)} className="btn-primary !bg-slate-800 hover:!bg-slate-900 !px-4 !py-2 shadow-none">
                  Ver Vista Previa
                </button>
                <button onClick={handleSaveAndClose} className="btn-primary !px-4 !py-2 shadow-none flex items-center gap-2">
                  <Check className="w-4 h-4" /> Guardar y Salir
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 md:p-8">
            <h3 className="text-xl font-black text-slate-800 mb-6">Personalizacion del flyer</h3>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Imagenes de portada</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {heroImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => toggleHeroImage(img)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900 shadow-xl text-white text-[10px] flex items-center justify-center hover:bg-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {heroImages.length < 3 && (
                    <label className="aspect-square border border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
                      <ImageIcon className="w-5 h-5 text-slate-600" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadAsset(f, result.extracted?.destination || 'Varios', 'hero') }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Hoteles detectados</p>
                <div className="space-y-2">
                  {(result.extracted?.packages || []).map((pkg: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/[0.01] p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{pkg.hotelName}</p>
                        {pkg.rating && <p className="text-[11px] text-yellow-500 font-bold mt-1">* {pkg.rating}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {getHotelImage(pkg.hotelName, pkg.googlePhoto) && (
                          <img src={getHotelImage(pkg.hotelName, pkg.googlePhoto)} className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <label className="p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadAsset(f, result.extracted?.destination || 'Hotel', 'hotel', pkg.hotelName) }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {assetLibrary.length > 0 && (
            <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Historial de destino</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {assetLibrary.map((asset, idx) => (
                  <div
                    key={idx}
                    className={`aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative ${heroImages.includes(asset.imageUrl) ? 'border-[#f97316]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={asset.imageUrl} className="w-full h-full object-cover" alt="History" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteAsset(asset.id)
                      }}
                      className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-slate-900 shadow-xl text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {heroImages.includes(asset.imageUrl) && (
                      <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center backdrop-blur-[1px]">
                        <Check className="text-orange-500 w-8 h-8 drop-shadow-lg" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent p-4 space-y-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleHeroImage(asset.imageUrl)
                        }}
                        className={`w-full rounded-xl text-xs font-black py-2.5 uppercase tracking-widest transition-all ${heroImages.includes(asset.imageUrl) ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-slate-900 shadow-xl hover:bg-orange-500 hover:text-white'}`}
                      >
                        {heroImages.includes(asset.imageUrl) ? 'Quitar' : 'Usar'}
                      </button>

                      {result.extracted?.packages?.length > 0 && (
                        <div className="space-y-2">
                          <select
                            value={assignDrafts[asset.id] ?? asset.hotelName ?? ''}
                            onChange={(e) => setAssignDrafts((prev) => ({ ...prev, [asset.id]: e.target.value }))}
                            className="w-full rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 outline-none appearance-none"
                          >
                            <option value="" className="text-slate-900">Sin hotel</option>
                            {result.extracted.packages.map((pkg: any, pkgIdx: number) => (
                              <option key={pkgIdx} value={pkg.hotelName} className="text-slate-900">{pkg.hotelName}</option>
                            ))}
                          </select>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              assignAssetToHotel(asset, assignDrafts[asset.id] ?? asset.hotelName ?? '')
                            }}
                            className="w-full rounded-lg bg-[#f97316] py-2 text-xs font-bold text-slate-800"
                          >
                            Guardar asignacion
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {attractions.length > 0 && (
            <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Puntos turisticos del destino</h3>
                  <p className="text-sm text-slate-500 mt-1">Lugares reales encontrados con Google Places para usar en la venta.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {attractions.map((place, idx) => (
                  <a
                    key={place.placeId || idx}
                    href={place.mapsUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl overflow-hidden border border-slate-200 bg-white/[0.03] hover:bg-slate-100 transition-all"
                  >
                    {place.photoUrl && (
                      <div className="aspect-[4/3] overflow-hidden bg-black/20">
                        <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-base font-black text-slate-800 leading-tight">{place.name}</p>
                      {place.primaryType && (
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mt-2">{place.primaryType}</p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        {place.rating && (
                          <span className="font-bold text-yellow-400">★ {place.rating}</span>
                        )}
                        {place.numReviews ? (
                          <span className="text-slate-500">{place.numReviews} reseñas</span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-slate-500">{place.address}</p>
                      <div className="mt-4 inline-flex rounded-lg border border-[#f97316]/20 bg-[#f97316]/10 px-3 py-2 text-xs font-bold text-[#f97316]">
                        Ver en Maps
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {igStories && (
            <section className="rounded-[28px] border border-pink-500/20 bg-pink-500/[0.04] p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Estrategia de 3 Stories para Instagram</h3>
                  <p className="text-sm text-slate-500 mt-1">Salida estructurada para producir historias más comerciales.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIgStoriesOpen((prev) => !prev)}
                    className="rounded-xl border border-slate-200 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-800"
                  >
                    {igStoriesOpen ? 'Ocultar' : 'Desplegar'}
                  </button>
                  <button
                    onClick={resetInstagramStories}
                    className="rounded-xl border border-slate-200 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-600"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {igStoriesOpen && (
              <>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-400">Historia 1 · Gancho</p>
                    <button onClick={() => copyText(`${igStories.story1?.hook || ''}\n\nBusqueda: ${igStories.story1?.searchTerms || ''}`)} className="text-xs font-bold text-pink-300">
                      Copiar
                    </button>
                  </div>
                  <p className="text-lg font-black text-slate-800 leading-tight">{igStories.story1?.hook}</p>
                  <div className="mt-4 rounded-xl bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">Busqueda sugerida</p>
                    <p className="text-sm text-slate-600">{igStories.story1?.searchTerms}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-400">Historia 2 · Valor</p>
                    <button onClick={() => copyText(`${(igStories.story2?.benefits || []).join('\n')}\n\nVisual: ${igStories.story2?.visualSuggestion || ''}`)} className="text-xs font-bold text-pink-300">
                      Copiar
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(igStories.story2?.benefits || []).map((benefit: string, idx: number) => (
                      <div key={idx} className="rounded-xl bg-black/20 p-3 text-sm font-bold text-slate-800">
                        {benefit}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">Visual sugerido</p>
                    <p className="text-sm text-slate-600">{igStories.story2?.visualSuggestion}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pink-400">Historia 3 · Cierre</p>
                    <button onClick={() => copyText(`${igStories.story3?.videoPrompt || ''}\n\nOverlay: ${igStories.story3?.overlayText || ''}\nCTA: ${igStories.story3?.cta || ''}`)} className="text-xs font-bold text-pink-300">
                      Copiar
                    </button>
                  </div>
                  <div className="rounded-xl bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">Prompt técnico en inglés</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{igStories.story3?.videoPrompt}</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">Overlay</p>
                    <p className="text-sm font-bold text-slate-800">{igStories.story3?.overlayText}</p>
                  </div>
                  <div className="mt-4 rounded-xl bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">CTA</p>
                    <p className="text-sm font-bold text-slate-800">{igStories.story3?.cta}</p>
                  </div>
                </div>
              </div>

              {igStories.videos?.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-800">Videos sugeridos de Pexels</h4>
                      <p className="text-sm text-slate-500 mt-1">Pensados para la Historia 1. Formato vertical priorizado.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(igStories.videos || []).map((video: any) => (
                      <a
                        key={video.id}
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl overflow-hidden border border-slate-200 bg-white/[0.03] hover:bg-slate-100 transition-all"
                      >
                        <div className="aspect-[9/16] overflow-hidden bg-black/20">
                          <img src={video.image} alt={video.user?.name || 'Pexels video'} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-slate-800">Video vertical sugerido</p>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{video.duration}s</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">Autor: {video.user?.name}</p>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                copyText(video.videoUrl)
                              }}
                              className="rounded-lg border border-slate-200 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-800"
                            >
                              Copiar video URL
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                createStoryVideo(video)
                              }}
                              disabled={videoLoadingId === video.id}
                              className="rounded-lg bg-[#f97316] px-3 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                            >
                              {videoLoadingId === video.id ? 'Creando...' : 'Crear video'}
                            </button>
                          </div>
                          <div className="mt-3 text-xs font-bold text-pink-300">Abrí la card para ver el clip en Pexels</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              </>
              )}
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Acciones</p>
              <div className="space-y-4">
                <button onClick={downloadJpg} disabled={loading} className="w-full flex items-center justify-center gap-4 bg-white text-slate-900 font-black px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200">
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  <div className="text-left">
                    <p className="text-sm font-black">Descargar {exportFormat === 'story' ? 'story' : 'post'}</p>
                    <p className="text-[10px] font-medium opacity-60 uppercase tracking-[0.2em]">JPG {exportFormat === 'story' ? '9:16' : 'feed'}</p>
                  </div>
                </button>
                <button onClick={() => shareFlyer('whatsapp')} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/5 font-bold py-4 rounded-2xl transition-all">
                  <Share2 className="w-5 h-5" /> Compartir en WhatsApp
                </button>
                <button onClick={() => shareFlyer('instagram')} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-pink-500/30 text-pink-400 hover:bg-pink-500/5 font-bold py-4 rounded-2xl transition-all">
                  <Share2 className="w-5 h-5" /> Compartir en Instagram
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-500">Texto para WhatsApp</h3>
                <button onClick={copyWhatsapp} className="text-[10px] font-bold bg-green-500/10 hover:bg-green-500/20 text-green-500 px-3 py-1.5 rounded-lg transition-all border border-green-500/10">
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <pre className="text-xs text-slate-500 whitespace-pre-wrap break-words font-sans min-h-[240px] leading-relaxed bg-black/20 p-4 rounded-xl overflow-hidden">
                {result.whatsapp}
              </pre>
            </section>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

      <div className="offscreen-capture" aria-hidden>
        {result?.flyerHtml && (
          <div
            ref={flyerContainerRef}
            style={{ width: `${flyerDimensions.width}px`, minHeight: `${flyerDimensions.minHeight}px`, backgroundColor: '#ffffff', position: 'relative' }}
            dangerouslySetInnerHTML={{ __html: result.flyerHtml }}
          />
        )}
      </div>

      {showModal && result?.flyerHtml && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="w-full h-full flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-800 transition-colors">
                <X className="w-8 h-8" />
              </button>
              <button onClick={downloadJpg} className="bg-[#f97316] text-slate-800 px-8 py-3 rounded-xl font-bold">
                Descargar JPG
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 flex justify-center custom-scrollbar">
              <div className="bg-white shadow-2xl rounded-sm overflow-hidden scale-[0.35] md:scale-[0.55] lg:scale-[0.7] xl:scale-[0.85] origin-top h-fit" style={{ width: `${flyerDimensions.width}px` }}>
                <div
                  className="flyer-preview-direct"
                  style={{ width: `${flyerDimensions.width}px`, minHeight: `${flyerDimensions.minHeight}px`, backgroundColor: 'white' }}
                  dangerouslySetInnerHTML={{ __html: result.flyerHtml }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
