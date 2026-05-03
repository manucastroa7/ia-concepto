import fs from 'fs';

const filePath = 'd:/proyectos/ia-concepto/frontend/src/components/ManualQuoteBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Update Flight section (around line 740)
const flightSearchIdx = lines.findIndex(l => l.includes('value={item.details.airline}'));
if (flightSearchIdx !== -1) {
    // Find the input block (start from line 740 approx)
    const blockStart = flightSearchIdx - 2; 
    const blockEnd = flightSearchIdx + 14; 
    
    const newFlightBlock = `                                    <div className="flex gap-3">
                                      <div className="flex-1 space-y-1">
                                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Aerolínea / Compañía</label>
                                          <input 
                                            placeholder="Ej: AR o Aerolíneas Argentinas" 
                                            value={item.details.airline} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                updateItemDetails(item.id, 'airline', val);
                                                if (val.length === 2) {
                                                    const found = lookupAirline(val);
                                                    if (found) {
                                                        updateItemDetails(item.id, 'airline', found);
                                                        toast.success(\`Detectado: \${found}\`, { id: 'airline-lookup' });
                                                    }
                                                }
                                            }} 
                                            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold outline-none focus:border-orange-500/50" 
                                          />
                                      </div>
                                      <div className="w-1/3 space-y-1">
                                          <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Cód. Reserva (PNR)</label>
                                          <input 
                                            placeholder="Ej: ABC123" 
                                            value={item.details.bookingCode || ''} 
                                            onChange={e => updateItemDetails(item.id, 'bookingCode', e.target.value.toUpperCase())}
                                            className="w-full bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-emerald-200 text-xs font-black outline-none focus:border-emerald-500" 
                                          />
                                      </div>
                                    </div>`;
    
    lines.splice(blockStart, blockEnd - blockStart + 1, newFlightBlock);
}

// Update Hotel section
const hotelSearchIdx = lines.findIndex(l => l.includes('value={item.details.hotelName}'));
if (hotelSearchIdx !== -1) {
    const blockStart = hotelSearchIdx - 1;
    const blockEnd = hotelSearchIdx + 1;
    const newHotelBlock = `                                     <div className="flex-1 space-y-1">
                                         <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nombre del Hotel</label>
                                         <input placeholder="Ej: Hotel Hilton" value={item.details.hotelName} onChange={e => updateItemDetails(item.id, 'hotelName', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold focus:border-orange-500/50 outline-none" />
                                     </div>
                                     <div className="w-1/3 space-y-1">
                                         <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Nº Confirmación</label>
                                         <input placeholder="Ej: 982312" value={item.details.confirmationNumber || ''} onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)} className="w-full bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-emerald-200 text-xs font-black outline-none focus:border-emerald-500" />
                                     </div>`;
    lines.splice(blockStart, blockEnd - blockStart + 1, newHotelBlock);
}

// Update Transfer and Generic
const genericSearchIdx = lines.findIndex(l => l.includes('placeholder="Descripción del Servicio"'));
if (genericSearchIdx !== -1) {
    const blockStart = genericSearchIdx - 1; // The : ( line
    const blockEnd = genericSearchIdx + 1; // The )} line
    
    const newTransferBlock = `                           ) : item.type === 'transfer' ? (
                               <div className="space-y-6">
                                   <div className="flex items-center justify-between">
                                       <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tipo de Trayecto</label>
                                       <div className="flex bg-white/5 p-1 rounded-xl">
                                           <button 
                                              onClick={() => updateItemDetails(item.id, 'isRoundTrip', false)}
                                              className={\`px-4 py-2 rounded-lg text-[10px] font-black transition-all \${!item.details.isRoundTrip ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-300'}\`}
                                           >
                                               SÓLO IDA
                                           </button>
                                           <button 
                                              onClick={() => updateItemDetails(item.id, 'isRoundTrip', true)}
                                              className={\`px-4 py-2 rounded-lg text-[10px] font-black transition-all \${item.details.isRoundTrip ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-300'}\`}
                                           >
                                               IDA Y VUELTA
                                           </button>
                                       </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1">
                                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Desde (Origen)</span>
                                           <input placeholder="Ej: Aeropuerto EZE" value={item.details.origin} onChange={e => updateItemDetails(item.id, 'origin', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold" />
                                       </div>
                                       <div className="space-y-1">
                                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Hasta (Destino)</span>
                                           <input placeholder="Ej: Hotel Hilton" value={item.details.destination} onChange={e => updateItemDetails(item.id, 'destination', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold" />
                                       </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-1">
                                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Fecha y Hora</span>
                                           <div className="flex gap-2">
                                               <input placeholder="20/10" value={item.details.date} onChange={e => updateItemDetails(item.id, 'date', e.target.value)} className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold" />
                                               <input placeholder="14:00" value={item.details.time} onChange={e => updateItemDetails(item.id, 'time', e.target.value)} className="w-20 bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold" />
                                           </div>
                                       </div>
                                       <div className="space-y-1">
                                           <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Nº Confirmación</span>
                                           <input placeholder="Ej: TR-12345" value={item.details.confirmationNumber || ''} onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)} className="w-full bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-emerald-200 text-xs font-black outline-none focus:border-emerald-500" />
                                       </div>
                                   </div>
                               </div>
                           ) : (
                                 <div className="space-y-4">
                                    <input placeholder="Descripción del Servicio" value={item.details.description} onChange={e => updateItemDetails(item.id, 'description', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs" />
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Nº Confirmación</span>
                                        <input placeholder="Ej: PENDIENTE" value={item.details.confirmationNumber || ''} onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)} className="w-full bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-emerald-200 text-xs font-black outline-none focus:border-emerald-500" />
                                    </div>
                                 </div>`;
    lines.splice(blockStart, blockEnd - blockStart + 1, newTransferBlock);
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully updated ManualQuoteBuilder.tsx');
