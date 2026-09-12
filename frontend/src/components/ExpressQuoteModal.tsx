import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Clipboard, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Check, 
  Send, 
  FileText, 
  DollarSign, 
  Users, 
  X, 
  Loader2, 
  Plane, 
  Hotel, 
  ArrowRight,
  Plus
} from 'lucide-react';

interface ImageFile {
  id: string;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

interface ExpressQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuote: (quoteData: any) => void;
  apiUrl?: string;
  pastedImageFile?: File | null;
}

export const ExpressQuoteModal: React.FC<ExpressQuoteModalProps> = ({
  isOpen,
  onClose,
  onImportQuote,
  apiUrl = "http://localhost:3001",
  pastedImageFile
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results & Client/Title Assignment
  const [result, setResult] = useState<{ whatsappText: string; quoteData: any } | null>(null);
  const [editableWhatsApp, setEditableWhatsApp] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Form Fields prior to Import
  const [passengersList, setPassengersList] = useState<any[]>([]);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');
  const [customClientName, setCustomClientName] = useState<string>('');
  const [quoteTitleInput, setQuoteTitleInput] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastProcessedTimeRef = useRef<number>(0);

  // Fetch Passengers List for Selector
  useEffect(() => {
    if (!isOpen) return;
    fetch(`${apiUrl}/api/passengers`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setPassengersList(Array.isArray(data) ? data : []))
      .catch(() => setPassengersList([]));
  }, [isOpen, apiUrl]);

  // Helper to convert File to base64 with deduplication
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const now = Date.now();
    if (now - lastProcessedTimeRef.current < 300) {
      return; // Ignore duplicated triggers within 300ms
    }
    lastProcessedTimeRef.current = now;

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultStr = e.target?.result as string;
      if (!resultStr) return;
      
      const base64Data = resultStr.split(',')[1];
      const mimeType = file.type || 'image/png';
      
      setImages(prev => {
        // Prevent duplicate images with identical base64
        if (prev.some(img => img.base64 === base64Data)) {
          return prev;
        }
        const newImg: ImageFile = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          previewUrl: URL.createObjectURL(file),
          base64: base64Data,
          mimeType
        };
        return [...prev, newImg];
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle external passed pasted file
  useEffect(() => {
    if (pastedImageFile && isOpen) {
      processFile(pastedImageFile);
    }
  }, [pastedImageFile, isOpen]);

  // Handle Clipboard Paste (Ctrl + V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(file => processFile(file));
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const addPresetPrompt = (preset: string) => {
    setPrompt(prev => prev ? `${prev} ${preset}` : preset);
  };

  const handleProcess = async () => {
    if (images.length === 0) {
      setError("Por favor pega o arrastra al menos una captura de pantalla (ej: pasaje, hotel o tarifario).");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const payload = {
        images: images.map(img => ({ base64: img.base64, mimeType: img.mimeType })),
        prompt: prompt.trim()
      };

      const res = await fetch(`${apiUrl}/api/manual-quotes/ai-express`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al procesar las imágenes con la IA.");
      }

      const data = await res.json();
      setResult(data);
      setEditableWhatsApp(data.whatsappText || '');
      setQuoteTitleInput(data.quoteData?.title || 'Cotización Exprés');
    } catch (err: any) {
      console.error("Error processing express quote:", err);
      setError(err.message || "No se pudo procesar la cotización exprés.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(editableWhatsApp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsAppWeb = () => {
    const encoded = encodeURIComponent(editableWhatsApp);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleConfirmImport = (overrideData?: any) => {
    const baseData = overrideData || result?.quoteData;
    if (!baseData) return;

    const matchedPax = passengersList.find(p => p.id === selectedPassengerId);
    const clientNameStr = customClientName || (matchedPax ? `${matchedPax.surname}, ${matchedPax.name}` : baseData.clientName || '');

    const finalPayload = {
      ...baseData,
      title: quoteTitleInput || baseData.title || 'Cotización Exprés',
      passengerId: selectedPassengerId || undefined,
      clientName: clientNameStr
    };

    onImportQuote(finalPayload);
    onClose();
  };

  const resetAll = () => {
    setImages([]);
    setPrompt('');
    setResult(null);
    setEditableWhatsApp('');
    setError(null);
    setSelectedPassengerId('');
    setCustomClientName('');
    setQuoteTitleInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Cotizador Exprés IA
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-500/30">
                  Multimodal
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pegá tus capturas de aéreos/hoteles con <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-[10px]">Ctrl + V</kbd> y la IA armará el mensaje y la cotización.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200"><X size={16} /></button>
            </div>
          )}

          {!result ? (
            /* Input / Paste Form State */
            <div className="space-y-6">
              
              {/* Drop / Paste Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 ${
                  images.length > 0
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-slate-700/80 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-950/70'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach(file => processFile(file));
                    }
                  }}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                {images.length === 0 ? (
                  <div className="py-6 flex flex-col items-center gap-3">
                    <div className="p-4 bg-slate-800/80 rounded-2xl text-amber-400 border border-slate-700 shadow-lg">
                      <Clipboard size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Hacé clic o presioná <span className="text-amber-400 underline decoration-amber-500/40 underline-offset-4">Ctrl + V</span> para pegar la captura aquí
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Soporta capturas de pasajes, pantallas de GDS, itinerarios o tarifarios de hoteles.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={14} /> Capturas adjuntas ({images.length})
                      </span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
                      >
                        <Plus size={14} /> Agregar otra captura
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {images.map((img) => (
                        <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md aspect-video">
                          <img src={img.previewUrl} alt="Captura" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(img.id)}
                            className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-xl opacity-90 group-hover:opacity-100 hover:bg-rose-700 transition-all shadow"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Prompt Input and Quick Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Indicaciones de precio y margen (Opcional):
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej: A esto sumale USD 150 de ganancia por pasajero. Son 2 adultos en base doble con maleta."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition-all"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-slate-500 font-medium mr-1">Atajos rápidos:</span>
                  <button
                    type="button"
                    onClick={() => addPresetPrompt("Sumar 10% de ganancia.")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    +10% Markup
                  </button>
                  <button
                    type="button"
                    onClick={() => addPresetPrompt("Sumar 15% de ganancia.")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    +15% Markup
                  </button>
                  <button
                    type="button"
                    onClick={() => addPresetPrompt("Sumar 1.5% de gastos administrativos.")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    +1.5% Gastos Adm
                  </button>
                  <button
                    type="button"
                    onClick={() => addPresetPrompt("Sumar 1.5% de gastos administrativos y 15.000 ARS de ganancia de agencia por pasajero.")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    +1.5% Gastos + $15.000 Fee
                  </button>
                  <button
                    type="button"
                    onClick={() => addPresetPrompt("Cotizar para 2 adultos especificando el precio final por pasajero y el total del grupo.")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    2 Pax (Precio por Pax & Total)
                  </button>
                  <button
                    type="button"
                    onClick={() => addPresetPrompt("Especificar siempre el precio por pasajero y el precio total final.")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    Por Pax & Total
                  </button>
                  <button
                    type="button"
                    onClick={() => addPresetPrompt("Incluir equipaje en bodega de 23kg.")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                  >
                    Con Equipaje
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing || images.length === 0}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-slate-950" />
                      Analizando con IA Gemini Vision...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generar Mensaje WhatsApp & Cotización
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            /* Results Dual View (WhatsApp + Structured Quote) */
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left: WhatsApp Output */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col h-full shadow-inner">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Send size={15} /> Mensaje para WhatsApp
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-semibold px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ✏️ Podés editar este texto antes de copiar
                    </span>
                  </div>

                  <textarea
                    value={editableWhatsApp}
                    onChange={(e) => setEditableWhatsApp(e.target.value)}
                    rows={12}
                    placeholder="Aquí aparecerá el texto de WhatsApp..."
                    className="w-full flex-1 p-4 bg-slate-900/90 border border-emerald-500/30 focus:border-emerald-400 rounded-2xl text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 leading-relaxed resize-y transition-all"
                  />

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCopyWhatsApp}
                      className={`flex-1 py-3 px-4 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? '¡Copiado al Portapapeles!' : 'Copiar Texto para WhatsApp'}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenWhatsAppWeb}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
                    >
                      <Send size={14} /> Abrir Web
                    </button>
                  </div>
                </div>

                {/* Right: Operational Structure */}
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-inner">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={15} /> Cotización Estructurada
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 font-semibold px-2 py-0.5 rounded-md border border-amber-500/20">
                        Convertible a DB
                      </span>
                    </div>

                    {/* Summary Badges */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-white">{result.quoteData?.title || 'Cotización Exprés'}</h4>
                          <p className="text-xs text-slate-400">Destino: <span className="text-slate-200">{result.quoteData?.destination || 'Varios'}</span></p>
                        </div>

                        {/* Moneda Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Moneda:</span>
                          <select
                            value={result.quoteData?.currency || 'USD'}
                            onChange={(e) => {
                              const newCurr = e.target.value;
                              setResult(prev => prev ? {
                                ...prev,
                                quoteData: { ...prev.quoteData, currency: newCurr }
                              } : null);
                            }}
                            className="bg-transparent text-xs font-black text-amber-400 focus:outline-none cursor-pointer"
                          >
                            <option value="ARS" className="bg-slate-900 text-white">ARS ($)</option>
                            <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
                            <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
                          </select>
                        </div>
                      </div>

                      {/* ASIGNACIÓN DE PASAJERO Y TÍTULO DE COTIZACIÓN */}
                      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                            📌 Título de la Cotización:
                          </label>
                          <input
                            type="text"
                            value={quoteTitleInput}
                            onChange={(e) => setQuoteTitleInput(e.target.value)}
                            placeholder="Ej: Salta 5 Noches - Opción A"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            👤 Asignar Pasajero en CRM (Opcional):
                          </label>
                          <select
                            value={selectedPassengerId}
                            onChange={(e) => {
                              setSelectedPassengerId(e.target.value);
                              if (e.target.value) setCustomClientName('');
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none focus:border-amber-400"
                          >
                            <option value="">-- Seleccionar Pasajero del CRM --</option>
                            {passengersList.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.surname}, {p.name} {p.passportNumber ? `(PAS: ${p.passportNumber})` : ''}
                              </option>
                            ))}
                          </select>

                          {!selectedPassengerId && (
                            <input
                              type="text"
                              value={customClientName}
                              onChange={(e) => setCustomClientName(e.target.value)}
                              placeholder="O escribir nombre del cliente: Ej. María Castro"
                              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-300 outline-none focus:border-amber-400"
                            />
                          )}
                        </div>
                      </div>

                      {/* Economics Box */}
                      <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Costo Neto Estimado</p>
                          <p className="text-base font-bold text-slate-300">
                            {result.quoteData?.currency || 'USD'} ${Number(result.quoteData?.totalNetCostSnapshot || 0).toLocaleString('es-AR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-amber-400 uppercase font-semibold">Precio Total Cotizado</p>
                          <p className="text-base font-extrabold text-amber-400">
                            {result.quoteData?.currency || 'USD'} ${Number(result.quoteData?.soldPriceCollected || 0).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>

                      {/* Detected Items */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ítems detectados ({result.quoteData?.items?.length || 0}):</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {result.quoteData?.items?.map((item: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {item.type === 'flight' ? <Plane size={15} className="text-sky-400" /> : <Hotel size={15} className="text-emerald-400" />}
                                <span className="font-semibold text-white">{item.details?.airline || item.details?.hotelName || 'Servicio'}</span>
                              </div>
                              <span className="font-bold text-slate-300">
                                {result.quoteData?.currency || 'USD'} ${Number(item.price || 0).toLocaleString('es-AR')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                    {result.quoteData?.items?.length > 1 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase w-full">Importar Opción Específica como Cotización Independiente:</span>
                        {result.quoteData.items.map((item: any, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const singleOptionQuote = {
                                ...result.quoteData,
                                title: `${result.quoteData.title} - Opción ${idx + 1} (${item.details?.airline || item.details?.hotelName || 'Servicio'})`,
                                soldPriceCollected: item.price || result.quoteData.soldPriceCollected,
                                totalNetCostSnapshot: item.economics?.baseNetCost || result.quoteData.totalNetCostSnapshot,
                                items: [item]
                              };
                              onImportQuote(singleOptionQuote);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            Importar Solo Opción {idx + 1} ({item.details?.airline || 'Servicio'})
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={resetAll}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
                      >
                        Volver a Pegar
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ArrowRight size={16} />
                        Importar Todas al Cotizador Oficial
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
