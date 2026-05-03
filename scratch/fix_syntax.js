import fs from 'fs';

const filePath = 'd:/proyectos/ia-concepto/frontend/src/components/ManualQuoteBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix Malformed Hotel start
content = content.replace(/item.type === 'hotel' \? \(\n\s+<div clas\s+<div className="flex gap-3">/g, "item.type === 'hotel' ? (\n                               <div className=\"space-y-4\">\n                                  <div className=\"flex gap-3\">");

// Remove duplicated Aerolinea label (if safe)
// Based on previous view_file, it was around line 741 and 756.
// I'll just look for a specific pattern.

// Fix nested div closures
// I'll replace the whole hotel block to be safe.

const hotelStart = content.indexOf("item.type === 'hotel' ? (");
const hotelEnd = content.indexOf(") : item.type === 'transfer' ? (", hotelStart);

if (hotelStart !== -1 && hotelEnd !== -1) {
    const newHotelBlock = `item.type === 'hotel' ? (
                               <div className="space-y-4">
                                  <div className="flex gap-3">
                                     <div className="flex-1 space-y-1">
                                         <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nombre del Hotel</label>
                                         <input placeholder="Ej: Hotel Hilton" value={item.details.hotelName} onChange={e => updateItemDetails(item.id, 'hotelName', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold focus:border-orange-500/50 outline-none" />
                                     </div>
                                     <div className="w-1/3 space-y-1">
                                         <label className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Nº Confirmación</label>
                                         <input placeholder="Ej: 982312" value={item.details.confirmationNumber || ''} onChange={e => updateItemDetails(item.id, 'confirmationNumber', e.target.value)} className="w-full bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl text-emerald-200 text-xs font-black outline-none focus:border-emerald-500" />
                                     </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                     <div className="space-y-1">
                                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Entrada (Check-in)</span>
                                         <input placeholder="12/10" value={item.details.checkIn} onChange={e => updateItemDetails(item.id, 'checkIn', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold" />
                                     </div>
                                     <div className="space-y-1">
                                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Salida (Check-out)</span>
                                         <input placeholder="19/10" value={item.details.checkOut} onChange={e => updateItemDetails(item.id, 'checkOut', e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white text-xs font-bold" />
                                     </div>
                                  </div>

                                  <div className="space-y-1">
                                     <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Fecha Límite Cancelación</span>
                                     <input placeholder="Ej: 05/10 sin cargo" value={item.details.cancellationDate} onChange={e => updateItemDetails(item.id, 'cancellationDate', e.target.value)} className="w-full bg-red-500/5 border border-red-500/20 p-3 rounded-xl text-red-200 text-xs font-bold outline-none" />
                                  </div>

                                  <div className="space-y-3 pt-4 border-t border-white/5">
                                      <div className="flex justify-between items-center">
                                          <label className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Distribución de Habitaciones</label>
                                          <button onClick={() => addHotelRoom(item.id)} className="text-[9px] font-black bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full hover:bg-orange-500/20 transition-all">+ AGREGAR</button>
                                      </div>
                                      
                                      <div className="space-y-3">
                                          {item.details.rooms?.map((room: any, idx: number) => (
                                              <div key={room.id} className="relative group p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                      <div className="space-y-1">
                                                          <span className="text-[8px] font-bold text-slate-600 uppercase">Tipo de Habitacion</span>
                                                          <input placeholder="Ej: Doble Standard" value={room.type} onChange={e => updateHotelRoom(item.id, room.id, 'type', e.target.value)} className="w-full bg-transparent border-b border-white/5 text-xs text-white font-bold focus:border-orange-500/50 outline-none" />
                                                      </div>
                                                      <div className="space-y-1">
                                                          <span className="text-[8px] font-bold text-slate-600 uppercase">Regimen / Comidas</span>
                                                          <input placeholder="Ej: Media Pension" value={room.board} onChange={e => updateHotelRoom(item.id, room.id, 'board', e.target.value)} className="w-full bg-transparent border-b border-white/5 text-xs text-white font-bold focus:border-orange-500/50 outline-none" />
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                      <span className="text-[8px] font-bold text-slate-600 uppercase">Cant. Pasajeros:</span>
                                                      <input type="number" value={room.paxCount} onChange={e => updateHotelRoom(item.id, room.id, 'paxCount', parseInt(e.target.value))} className="bg-transparent border-b border-white/5 text-xs text-white font-bold w-12 text-center outline-none" />
                                                  </div>
                                                  {idx > 0 && (
                                                      <button onClick={() => removeHotelRoom(item.id, room.id)} className="absolute -top-2 -right-2 bg-red-500/20 text-red-500 p-1.5 rounded-full hover:bg-red-500 transition-all">
                                                          <X className="w-3 h-3" />
                                                      </button>
                                                  )}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                               </div>
                           `;
    content = content.substring(0, hotelStart) + newHotelBlock + content.substring(hotelEnd);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed ManualQuoteBuilder.tsx syntax');
