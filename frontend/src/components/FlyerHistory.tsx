import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Calendar, Download, RefreshCw, Trash2, X, Search as SearchIcon, CheckSquare, Square, Trash, History } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import toast from 'react-hot-toast';

export function FlyerHistory() {
  const [flyers, setFlyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Selection
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [selectedFlyer, setSelectedFlyer] = useState<any | null>(null);

  const fetchFlyers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/flyers');
      setFlyers(res.data || []);
      setSelectedIds([]); // clear selection on refetch
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlyers();
  }, []);

  const filteredFlyers = useMemo(() => {
    if (!searchTerm.trim()) return flyers;
    const lower = searchTerm.toLowerCase();
    return flyers.filter(f => 
      (f.extractedData?.title || "").toLowerCase().includes(lower) ||
      (f.extractedData?.destination || "").toLowerCase().includes(lower) ||
      (f.extractedData?.category || "").toLowerCase().includes(lower)
    );
  }, [flyers, searchTerm]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredFlyers.length && filteredFlyers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFlyers.map(f => f.id));
    }
  };

  const downloadJpg = (flyerHtml: string, name: string) => {
    const iframe = document.createElement('iframe');
    iframe.srcdoc = flyerHtml;
    iframe.style.width = '800px';
    iframe.style.height = '1200px'; 
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        const bodyContent = iframe.contentDocument?.body;
        if (bodyContent) {
          htmlToImage.toJpeg(bodyContent, { quality: 0.95, width: 800 })
            .then((dataUrl) => {
              const a = document.createElement('a');
              a.href = dataUrl;
              a.download = `flyer-${name}.jpg`;
              a.click();
              document.body.removeChild(iframe);
            })
            .catch((err) => {
              document.body.removeChild(iframe);
              toast.error("Error al exportar JPG");
            });
        }
      }, 500);
    };
  };

  const confirmDeleteSingle = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`/api/flyers/${itemToDelete}`);
      toast.success('Flyer eliminado');
      setItemToDelete(null);
      fetchFlyers();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await axios.post('/api/flyers/delete-multiple', { ids: selectedIds });
      toast.success(`${selectedIds.length} flyers eliminados`);
      setShowBulkDeleteModal(false);
      fetchFlyers();
    } catch (e) {
      toast.error('Error en borrado masivo');
    }
  };

  const confirmDeleteAll = async () => {
    try {
      await axios.delete('/api/flyers/all');
      toast.success('Todos los flyers han sido eliminados');
      setShowDeleteAllModal(false);
      fetchFlyers();
    } catch (e) {
      toast.error('Error al vaciar historial');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400"><RefreshCw className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3 transition-transform">
            <History className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="page-title">Historial de Flyers</h1>
            <p className="page-subtitle">Gestión de piezas procesadas</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200">
            <span className="text-xl font-black text-slate-900 leading-none">{flyers.length}</span>
            <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Archivos</span>
          </div>
          <button 
            onClick={() => setShowDeleteAllModal(true)}
            className="btn-secondary !border-red-100 !text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Limpiar Todo
          </button>
        </div>
      </div>

      {/* TOOLBAR CONTROLES: FILTROS Y BORRADO MÚLTIPLE */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto px-2">
          <button 
            onClick={toggleAll}
            className="flex items-center gap-2 text-[10px] font-black text-slate-900 hover:text-orange-600 transition-colors uppercase tracking-widest"
          >
            {selectedIds.length === filteredFlyers.length && filteredFlyers.length > 0 ? <CheckSquare className="w-4 h-4 text-orange-600" /> : <Square className="w-4 h-4" />}
            <span>Seleccionar Todo</span>
          </button>
          
          <div className="w-px h-6 bg-slate-100 hidden md:block"></div>
          
          <div className="relative flex-1 md:w-64 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por destino, título..."
              className="standard-input !py-2.5 !pl-10 !text-[11px] !bg-slate-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-2 text-[10px] font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors uppercase tracking-widest"
            >
              <Trash className="w-3.5 h-3.5" /> Borrar Seleccionados ({selectedIds.length})
            </button>
          )}

          {flyers.length > 0 && selectedIds.length === 0 && (
            <button 
              onClick={() => setShowDeleteAllModal(true)}
              className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              <Trash2 className="w-3.5 h-3.5" /> Vaciar Historial
            </button>
          )}
        </div>

        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Buscar por destino o título..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pl-10 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* GRID DE RESULTADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFlyers.map(f => {
          const isSelected = selectedIds.includes(f.id);
          return (
            <div key={f.id} className={`premium-card group relative transition-all ${isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'hover:shadow-md'}`}>
               <div className="absolute top-3 left-3 z-30">
                 <button onClick={() => toggleSelection(f.id)} className="bg-white rounded p-0.5 shadow-sm border border-slate-200">
                    {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                 </button>
               </div>

              <div 
                onClick={() => setSelectedFlyer(f)}
                className="aspect-[4/5] bg-slate-100 rounded-xl mb-4 overflow-hidden border border-slate-200 relative shadow-inner cursor-pointer"
              >
                 <div className="absolute inset-0 overflow-hidden bg-white pointer-events-none">
                    {f.flyerHtml ? (
                      <div 
                        style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '800px', height: '1200px' }}
                        dangerouslySetInnerHTML={{ __html: f.flyerHtml }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-black text-2xl select-none uppercase tracking-tighter -rotate-12 opacity-30">
                        PREVIEW
                      </div>
                    )}
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-10 hover:from-slate-900/60 transition-colors" />
                 <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                      <span className="bg-white/90 backdrop-blur-md text-[9px] font-black text-blue-600 px-2 py-1 rounded-md shadow-sm uppercase tracking-widest">{f.extractedData?.category || 'General'}</span>
                 </div>
                 <button 
                    onClick={() => setItemToDelete(f.id)}
                    className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-lg bg-white/90 shadow-sm hover:bg-red-50 hover:text-red-600 text-slate-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>

              <div className="space-y-3 px-1">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500 mb-0.5">{f.extractedData?.destination || 'Destino'}</p>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none truncate">{f.extractedData?.title || 'Flyer'}</h3>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(f.createdAt).toLocaleDateString()}</span>
                  <button 
                    onClick={() => downloadJpg(f.flyerHtml, f.extractedData?.destination || 'concepto')} 
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-orange-500 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredFlyers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <Calendar className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No se encontraron flyers</p>
          </div>
        )}
      </div>

      {/* SINGLE DELETE MODAL */}
      {itemToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setItemToDelete(null)} />
              <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Eliminar Flyer</h3>
                  <p className="text-slate-500 mt-2 text-[11px] uppercase tracking-wider">Se borrará permanentemente.</p>
                  <div className="grid grid-cols-2 gap-3 mt-8">
                      <button onClick={() => setItemToDelete(null)} className="secondary-button !py-3">Cancelar</button>
                      <button onClick={confirmDeleteSingle} className="primary-button !bg-red-500 hover:!bg-red-600 !shadow-red-500/20 !py-3">Borrar</button>
                  </div>
              </div>
          </div>
      )}

      {/* BULK DELETE MODAL */}
      {showBulkDeleteModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowBulkDeleteModal(false)} />
              <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Trash className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Borrar Múltiples</h3>
                  <p className="text-slate-500 mt-2 text-[11px] uppercase tracking-wider">¿Eliminar {selectedIds.length} flyers seleccionados?</p>
                  <div className="grid grid-cols-2 gap-3 mt-8">
                      <button onClick={() => setShowBulkDeleteModal(false)} className="secondary-button !py-3">Cancelar</button>
                      <button onClick={confirmBulkDelete} className="primary-button !bg-red-500 hover:!bg-red-600 !shadow-red-500/20 !py-3">Confirmar</button>
                  </div>
              </div>
          </div>
      )}

      {/* DELETE ALL MODAL */}
      {showDeleteAllModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteAllModal(false)} />
              <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 text-center border-t-8 !border-t-red-500">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Vaciar Historial</h3>
                  <p className="text-slate-500 mt-2 text-[11px] uppercase tracking-wider">Se borrarán TODOS los flyers de la base de datos.</p>
                  <div className="grid grid-cols-1 gap-3 mt-8">
                      <button onClick={confirmDeleteAll} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors uppercase text-xs tracking-widest shadow-md">Sí, Borrar Todo</button>
                      <button onClick={() => setShowDeleteAllModal(false)} className="w-full py-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-700">Cancelar</button>
                  </div>
              </div>
          </div>
      )}
      {/* PREVIEW MODAL */}
      {selectedFlyer && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8">
          <div className="w-full h-full max-w-7xl flex flex-col bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Header */}
            <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
              <div>
                <h3 className="text-white font-black text-xl uppercase tracking-tighter">{selectedFlyer.extractedData?.title || 'Flyer Generado'}</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedFlyer.extractedData?.destination || 'Sin Destino'}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => downloadJpg(selectedFlyer.flyerHtml, selectedFlyer.extractedData?.destination || 'flyer')} className="bg-[#f97316] text-slate-900 px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/20">
                  <Download className="w-4 h-4" /> Descargar JPG
                </button>
                <button onClick={() => setSelectedFlyer(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Column - Flyer Preview */}
              <div className="flex-1 overflow-auto bg-slate-900/50 p-4 md:p-10 flex justify-center custom-scrollbar items-start">
                <div className="bg-white shadow-2xl rounded-sm overflow-hidden origin-top scale-[0.35] md:scale-[0.55] lg:scale-[0.7] h-fit shrink-0 transition-transform" style={{ width: '800px', minHeight: '1200px' }}>
                  <div
                    className="flyer-preview-direct"
                    style={{ width: '100%', minHeight: '100%', backgroundColor: 'white' }}
                    dangerouslySetInnerHTML={{ __html: selectedFlyer.flyerHtml }}
                  />
                </div>
              </div>

              {/* Right Column - Extracted Data */}
              <div className="w-full md:w-[400px] lg:w-[500px] bg-slate-900 overflow-y-auto custom-scrollbar p-6 border-l border-slate-800">
                <div className="space-y-8">
                  {/* WhatsApp Text */}
                  {selectedFlyer.whatsappMessage && (
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-400">Texto para WhatsApp</h4>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedFlyer.whatsappMessage);
                            toast.success('Copiado al portapapeles');
                          }}
                          className="text-[10px] font-bold bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg transition-all border border-green-500/10"
                        >
                          Copiar
                        </button>
                      </div>
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words font-sans leading-relaxed bg-black/40 p-4 rounded-xl border border-slate-800">
                        {selectedFlyer.whatsappMessage}
                      </pre>
                    </section>
                  )}

                  {/* Paquetes / Hoteles */}
                  {selectedFlyer.extractedData?.packages?.length > 0 && (
                    <section>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Paquetes Extraídos</h4>
                      <div className="space-y-3">
                        {selectedFlyer.extractedData.packages.map((pkg: any, idx: number) => (
                          <div key={idx} className="bg-black/20 border border-slate-800 rounded-xl p-4">
                            <h5 className="text-sm font-black text-white">{pkg.hotelName}</h5>
                            <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">{pkg.boardBasis}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs text-slate-500">{pkg.nights || selectedFlyer.extractedData.nights} noches</span>
                              <span className="text-sm font-black text-orange-500">{pkg.currency} {pkg.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
