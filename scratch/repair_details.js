import fs from 'fs';

const filePath = 'd:/proyectos/ia-concepto/frontend/src/components/ManualQuoteBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// I will replace the entire item detail section to ensure all tags are balanced.
// The section starts at Line 725 (approx) and ends at the start of the economy column (Line 1000 approx).

const informationHeader = '                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">';
const startHeader = '                    {/* COLUMNA DETALLES */}';
const economyHeader = '                    {/* COLUMNA ECONOMÍA */}';

const startIndex = content.indexOf(startHeader);
const economyIndex = content.indexOf(economyHeader);

if (startIndex !== -1 && economyIndex !== -1) {
    const newDetailsSection = `${startHeader}
                    <div className="space-y-6">
                       <div className="bg-white/2 rounded-2xl p-6 border border-white/5 space-y-4">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Información del Servicio</h4>
                          <div className="grid grid-cols-1 gap-4">
                              <SearchableOperatorSelect 
                                value={item.providerId} 
                                operators={operators}
                                onChange={(opId) => handleOperatorChange(item.id, opId)}
                              />
                          </div>

                          {item.type === 'flight' ? (
                             <div className="space-y-6 pt-2">
                                <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Configuración de Itinerario</label>
                                      <div className="flex gap-1">
                                          {['ONE_WAY', 'ROUND_TRIP', 'MULTI'].map(t => (
                                              <button 
                                                  key={t}
                                                  onClick={() => updateItemDetails(item.id, 'itineraryType', t)}
                                                  className={\`px-3 py-1 rounded-full text-[8px] font-bold transition-all \${item.details.itineraryType === t ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-500 hover:text-slate-300'}\`}
                                              >
                                                  {t === 'ONE_WAY' ? 'SÓLO IDA' : t === 'ROUND_TRIP' ? 'IDA Y VUELTA' : 'MULTIDESTINO'}
                                              </button>
                                          ))}
                                      </div>
                                   </div>
                                   
                                   <div className="flex gap-3">
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
                                   </div>

                                   <div className="space-y-4">
                                       <div className="flex justify-between items-center">
                                           <label className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Itinerario / Tramo</label>
                                           <div className="flex gap-2">
                                               {item.details.itineraryType === 'ROUND_TRIP' && (
                                                   <button 
                                                       onClick={() => {
                                                           const last = item.details.segments[item.details.segments.length - 1];
                                                           const returnSeg = { 
                                                               id: Math.random().toString(36).substr(2, 9), 
                                                               from: last.to, 
                                                               to: last.from, 
                                                               departureDate: '', 
                                                               departureTime: '', 
                                                               arrivalDate: '', 
                                                               arrivalTime: '' 
                                                           };
                                                           updateItemDetails(item.id, 'segments', [...item.details.segments, returnSeg]);
                                                       }}
                                                       className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:text-emerald-400 transition-colors"
                                                   >
                                                       <Plus className="w-2.5 h-2.5" /> Generar Regreso
                                                   </button>
                                               )}
                                               <button onClick={() => addFlightSegment(item.id)} className="text-[9px] font-black text-slate-400 hover:text-white transition-all uppercase">+ Agregar Tramo</button>
                                           </div>
                                       </div>
                                       
                                       <div className="space-y-3">
                                           {item.details.segments.map((seg: any, idx: number) => (
                                               <div key={seg.id} className="relative p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3 group">
                                                   <div className="grid grid-cols-2 gap-3">
                                                       <div className="space-y-1">
                                                           <span className="text-[8px] font-bold text-slate-600 uppercase">Origen</span>
                                                           <input placeholder="EZE" value={seg.from} onChange={e => updateFlightSegment(item.id, seg.id, 'from', e.target.value)} className="w-full bg-transparent border-b border-white/5 text-xs text-white uppercase font-bold focus:border-orange-500/50 outline-none" />
                                                       </div>
                                                       <div className="space-y-1">
                                                           <span className="text-[8px] font-bold text-slate-600 uppercase">Destino</span>
                                                           <input placeholder="MAD" value={seg.to} onChange={e => updateFlightSegment(item.id, seg.id, 'to', e.target.value)} className="w-full bg-transparent border-b border-white/5 text-xs text-white uppercase font-bold focus:border-orange-500/50 outline-none" />
                                                       </div>
                                                   </div>
                                                   <div className="grid grid-cols-2 gap-3">
                                                       <div className="space-y-1">
                                                           <span className="text-[8px] font-bold text-slate-600 uppercase">Salida (Fecha/Hora)</span>
                                                           <div className="flex gap-2">
                                                               <input placeholder="20/05" value={seg.departureDate} onChange={e => updateFlightSegment(item.id, seg.id, 'departureDate', e.target.value)} className="w-[50px] bg-transparent border-b border-white/5 text-xs text-white font-bold focus:border-orange-500/50 outline-none" />
                                                               <input placeholder="20:00" value={seg.departureTime} onChange={e => updateFlightSegment(item.id, seg.id, 'departureTime', e.target.value)} className="flex-1 bg-transparent border-b border-white/5 text-xs text-white font-bold focus:border-orange-500/50 outline-none" />
                                                           </div>
                                                       </div>
                                                       <div className="space-y-1">
                                                           <span className="text-[8px] font-bold text-slate-600 uppercase">Llegada (Fecha/Hora)</span>
                                                           <div className="flex gap-2">
                                                               <input placeholder="21/05" value={seg.arrivalDate} onChange={e => updateFlightSegment(item.id, seg.id, 'arrivalDate', e.target.value)} className="w-[50px] bg-transparent border-b border-white/5 text-xs text-white font-bold focus:border-orange-500/50 outline-none" />
                                                               <input placeholder="12:00" value={seg.arrivalTime} onChange={e => updateFlightSegment(item.id, seg.id, 'arrivalTime', e.target.value)} className="flex-1 bg-transparent border-b border-white/5 text-xs text-white font-bold focus:border-orange-500/50 outline-none" />
                                                           </div>
                                                       </div>
                                                   </div>
                                                   {idx > 0 && (
                                                       <button onClick={() => removeFlightSegment(item.id, seg.id)} className="absolute -top-2 -right-2 bg-red-500/20 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                                           <X className="w-3 h-3" />
                                                       </button>
                                                   )}
                                               </div>
                                           ))}
                                       </div>
                                   </div>

                                   <div className="space-y-4 pt-4 border-t border-white/5">
                                       <label className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">Política de Equipaje</label>
                                       <div className="grid grid-cols-1 gap-3">
                                           <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                               <div className="flex items-center gap-3">
                                                   <Briefcase className="w-4 h-4 text-slate-500" />
                                                   <span className="text-[10px] font-bold text-white">Mochila / Objeto Personal</span>
                                               </div>
                                               <input type="checkbox" checked={item.details.baggage.hasHand} onChange={e => updateBaggage(item.id, 'hasHand', e.target.checked)} className="accent-orange-500" />
                                           </div>
                                           <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                               <div className="flex items-center gap-3">
                                                   <Briefcase className="w-4 h-4 text-slate-500" />
                                                   <span className="text-[10px] font-bold text-white">Carry-on (10kg)</span>
                                               </div>
                                               <input type="checkbox" checked={item.details.baggage.hasCarryOn} onChange={e => updateBaggage(item.id, 'hasCarryOn', e.target.checked)} className="accent-orange-500" />
                                           </div>
                                           <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                               <div className="flex items-center gap-3">
                                                   <Briefcase className="w-4 h-4 text-slate-500" />
                                                   <div className="flex flex-col">
                                                       <span className="text-[10px] font-bold text-white">Equipaje de Bodega (23kg)</span>
                                                       <input placeholder="Ej: 1 x 23kg" value={item.details.baggage.checkedDesc} onChange={e => updateBaggage(item.id, 'checkedDesc', e.target.value)} className="bg-transparent border-none text-[9px] text-slate-500 outline-none h-4" />
                                                   </div>
                                               </div>
                                               <input type="checkbox" checked={item.details.baggage.hasChecked} onChange={e => updateBaggage(item.id, 'hasChecked', e.target.checked)} className="accent-orange-500" />
                                           </div>
                                       </div>
                                   </div>
                                </div>
                             </div>
                          ) : item.type === 'hotel' ? (
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
                          ) : item.type === 'transfer' ? (
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
                                </div>
                          )}
                       </div>
                    </div>
                    `;
    
    content = content.substring(0, startIndex) + newDetailsSection + content.substring(economyIndex);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Repaired ManualQuoteBuilder.tsx details section');
