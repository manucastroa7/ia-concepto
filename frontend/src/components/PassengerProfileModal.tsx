import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    Users, CreditCard, Calendar, Phone, Mail, MessageSquare, 
    Plane, Hotel, ShieldCheck, FileText, Plus, X, DollarSign, 
    Wallet, CheckCircle2, ChevronRight, Edit3, ArrowUpRight, Clock, Train, Compass
} from 'lucide-react';
import { normalizeDateString } from './PassengerManager';

interface PassengerProfileModalProps {
    passengerId: string;
    onClose: () => void;
    onOpenQuote?: (quote: any) => void;
}

export const PassengerProfileModal: React.FC<PassengerProfileModalProps> = ({ passengerId, onClose, onOpenQuote }) => {
    const [loading, setLoading] = useState(true);
    const [passengerData, setPassengerData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'services' | 'payments' | 'passport'>('services');

    // New Payment Form State inside modal
    const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);
    const [newPaymentNote, setNewPaymentNote] = useState('');
    const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState<string>('');

    useEffect(() => {
        if (passengerId) {
            fetchPassengerDetails();
        }
    }, [passengerId]);

    const fetchPassengerDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/passengers/${passengerId}/details`);
            setPassengerData(res.data);
            if (res.data?.quotes && res.data.quotes.length > 0) {
                setSelectedQuoteForPayment(res.data.quotes[0].id);
            }
        } catch (e) {
            toast.error('Error al cargar la ficha del pasajero');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuoteForPayment || newPaymentAmount <= 0) {
            toast.error('Ingresá una cotización válida y un monto mayor a 0');
            return;
        }

        try {
            const targetQuote = passengerData.quotes.find((q: any) => q.id === selectedQuoteForPayment);
            const currentCollected = Number(targetQuote.soldPriceCollected || 0);
            const newTotalCollected = currentCollected + Number(newPaymentAmount);

            await axios.patch(`/api/manual-quotes/${selectedQuoteForPayment}`, {
                soldPriceCollected: newTotalCollected,
                status: 'sold'
            });

            toast.success(`Pago registrado: ${targetQuote.currency || 'USD'} ${newPaymentAmount}`);
            setNewPaymentAmount(0);
            setNewPaymentNote('');
            fetchPassengerDetails();
        } catch (e) {
            toast.error('Error al registrar pago');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
                <div className="relative w-full max-w-xl bg-white p-12 rounded-3xl text-center shadow-2xl">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-bold uppercase tracking-wider text-xs">Cargando Ficha de Pasajero...</p>
                </div>
            </div>
        );
    }

    if (!passengerData) return null;

    const quotes = passengerData.quotes || [];

    // Financial Totals across all quotes
    const financialSummary = quotes.reduce((acc: any, q: any) => {
        let items = q.items || [];
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch { items = []; }
        }
        
        let sale = Number(q.soldPriceCollected || 0);
        let calculatedSale = 0;
        let net = Number(q.totalNetCostSnapshot || 0);

        if (Array.isArray(items)) {
            items.forEach((it: any) => {
                const cost = Number(it.economics?.baseNetCost || it.cost || 0);
                const price = Number(it.price || it.sellingTotal || (cost * 1.15));
                calculatedSale += price;
                if (!net) net += cost;
            });
        }

        const totalSaleValue = sale > 0 ? sale : calculatedSale;
        const paidValue = Number(q.soldPriceCollected || 0);

        return {
            totalBudget: acc.totalBudget + totalSaleValue,
            totalPaid: acc.totalPaid + paidValue,
            totalPending: acc.totalPending + Math.max(0, totalSaleValue - paidValue)
        };
    }, { totalBudget: 0, totalPaid: 0, totalPending: 0 });

    const formatPhone = (phone?: string) => (phone || '').replace(/[^0-9]/g, '');

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* MODAL HEADER */}
                <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white shrink-0">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-100/60 px-2.5 py-0.5 rounded-md border border-orange-200">
                                    Ficha Completa de Pasajero
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-1">
                                {passengerData.name} {passengerData.surname}
                            </h2>
                            <p className="text-xs text-slate-500 font-semibold flex items-center gap-3 mt-0.5">
                                {passengerData.passportNumber && (
                                    <span className="flex items-center gap-1 text-slate-700">
                                        <CreditCard className="w-3.5 h-3.5 text-orange-500" /> PAS: <strong>{passengerData.passportNumber}</strong>
                                    </span>
                                )}
                                {passengerData.nationality && (
                                    <span>Nacionalidad: <strong>{passengerData.nationality}</strong></span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {passengerData.whatsapp && (
                            <a
                                href={`https://wa.me/${formatPhone(passengerData.whatsapp)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-all flex items-center gap-1.5"
                            >
                                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* TABS SELECTOR */}
                <div className="flex border-b border-slate-200/80 bg-white px-6">
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`flex items-center gap-2 py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                            activeTab === 'services'
                                ? 'border-orange-500 text-orange-600 bg-orange-50/40'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <Plane className="w-4 h-4" /> Servicios & Cotizaciones ({quotes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`flex items-center gap-2 py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                            activeTab === 'payments'
                                ? 'border-orange-500 text-orange-600 bg-orange-50/40'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <Wallet className="w-4 h-4" /> Registros de Pagos & Saldos
                    </button>
                    <button
                        onClick={() => setActiveTab('passport')}
                        className={`flex items-center gap-2 py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                            activeTab === 'passport'
                                ? 'border-orange-500 text-orange-600 bg-orange-50/40'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" /> Datos de Documentación
                    </button>
                </div>

                {/* MODAL BODY */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

                    {/* TAB 1: SERVICIOS Y COTIZACIONES */}
                    {activeTab === 'services' && (
                        <div className="space-y-6">
                            {quotes.length === 0 ? (
                                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl p-8">
                                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Sin cotizaciones asociadas</h3>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Este pasajero aún no tiene viajes o cotizaciones registradas en el sistema.</p>
                                </div>
                            ) : (
                                quotes.map((q: any) => {
                                    let itemsList: any[] = q.items || [];
                                    if (typeof itemsList === 'string') {
                                        try { itemsList = JSON.parse(itemsList); } catch { itemsList = []; }
                                    }

                                    const stKey = String(q.status || 'draft').toLowerCase();
                                    const STATUS_MAP: any = {
                                        draft: { label: 'Borrador', cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
                                        sent: { label: 'Enviada', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
                                        follow_up: { label: 'Seguimiento', cls: 'bg-amber-100 text-amber-800 border border-amber-200' },
                                        reserved: { label: 'Reservada', cls: 'bg-purple-100 text-purple-700 border border-purple-200' },
                                        sold: { label: 'Vendida', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
                                        confirmed: { label: 'Confirmada', cls: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
                                        lost: { label: 'Perdida', cls: 'bg-red-100 text-red-700 border border-red-200' },
                                    };
                                    const st = STATUS_MAP[stKey] || { label: String(q.status || 'Borrador').toUpperCase(), cls: 'bg-slate-100 text-slate-600' };

                                    return (
                                        <div key={q.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-orange-300 transition-all space-y-4">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-md ${st.cls}`}>
                                                            {st.label}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-400">Ref: {q.id.split('-')[0]}</span>
                                                    </div>
                                                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mt-1">
                                                        {q.title || 'Cotización de Viaje'}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                                        Destino: <strong className="text-slate-800">{q.destination || 'No especificado'}</strong>
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {onOpenQuote && (
                                                        <button
                                                            onClick={() => { onClose(); onOpenQuote(q); }}
                                                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                                        >
                                                            Abrir en Cotizador <ArrowUpRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ITEMS LIST */}
                                            <div className="space-y-3">
                                                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Servicios Incluidos ({itemsList.length})</h4>
                                                
                                                {itemsList.length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic">No hay ítems cargados en esta cotización.</p>
                                                ) : (
                                                    itemsList.map((it: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 flex items-start gap-3 text-xs">
                                                            <div className="p-2 bg-white rounded-lg border border-slate-200 text-orange-500 shrink-0">
                                                                {it.type === 'flight' ? <Plane className="w-4 h-4" /> :
                                                                 it.type === 'hotel' ? <Hotel className="w-4 h-4 text-emerald-500" /> :
                                                                 it.type === 'train' ? <Train className="w-4 h-4 text-amber-500" /> :
                                                                 it.type === 'transfer' ? <Users className="w-4 h-4 text-sky-500" /> :
                                                                 <ShieldCheck className="w-4 h-4 text-indigo-500" />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-black text-slate-800 uppercase">
                                                                    {it.type === 'flight' ? `Vuelo: ${it.details?.airline || 'Aerolínea'}` :
                                                                     it.type === 'hotel' ? `Hotel: ${it.details?.hotelName || 'Alojamiento'}` :
                                                                     it.type === 'train' ? `Tren: ${it.details?.trainOperator || 'Tren'} (${it.details?.origin || '?'} ➔ ${it.details?.destination || '?'})` :
                                                                     it.type === 'transfer' ? `Traslado: ${it.details?.origin || '?'} ➔ ${it.details?.destination || '?'}` :
                                                                     it.details?.description || 'Servicio Turístico'}
                                                                </p>
                                                                <p className="text-[11px] text-slate-500 font-medium">
                                                                    {it.type === 'flight' ? `Localizador PNR: ${it.details?.bookingCode || 'Sin PNR'}` :
                                                                     it.type === 'hotel' ? `In: ${it.details?.checkIn || '-'} / Out: ${it.details?.checkOut || '-'}` :
                                                                     it.type === 'train' ? `Nº: ${it.details?.trainNumber || '-'} | PNR: ${it.details?.bookingCode || '-'} | Clase: ${it.details?.classType || 'Primera'}` :
                                                                     it.details?.confirmationNumber ? `Voucher: ${it.details.confirmationNumber}` : ''}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-black text-slate-900 text-sm">
                                                                    {q.currency || 'USD'} {Number(it.price || it.sellingTotal || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* TAB 2: ESTADO DE PAGOS Y SALDOS */}
                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            {/* Summary Banner */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Total Contratado</p>
                                    <p className="text-lg font-black text-slate-900">USD {financialSummary.totalBudget.toLocaleString()}</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                                    <p className="text-[10px] font-black uppercase text-emerald-600">Total Cobrado / Señas</p>
                                    <p className="text-lg font-black text-emerald-700">USD {financialSummary.totalPaid.toLocaleString()}</p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                                    <p className="text-[10px] font-black uppercase text-amber-600">Saldo Pendiente</p>
                                    <p className="text-lg font-black text-amber-700">USD {financialSummary.totalPending.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Register Payment Form */}
                            {quotes.length > 0 && (
                                <form onSubmit={handleRegisterPayment} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-orange-500" /> Registrar Nuevo Cobro / Entrega
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Cotización / Viaje</label>
                                            <select
                                                value={selectedQuoteForPayment}
                                                onChange={e => setSelectedQuoteForPayment(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                                            >
                                                {quotes.map((q: any) => (
                                                    <option key={q.id} value={q.id}>
                                                        {q.title || 'Cotización'} ({q.currency || 'USD'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Monto Entregado</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={newPaymentAmount || ''}
                                                onChange={e => setNewPaymentAmount(Number(e.target.value))}
                                                placeholder="Ej: 500"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1">Notas del Pago</label>
                                            <input
                                                type="text"
                                                value={newPaymentNote}
                                                onChange={e => setNewPaymentNote(e.target.value)}
                                                placeholder="Ej: Seña en efectivo / Transferencia"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Registrar Cobro
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Detailed Payment History per Quote */}
                            <div className="space-y-4">
                                {quotes.map((q: any) => (
                                    <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                                        <div>
                                            <p className="font-black text-slate-900 text-sm uppercase">{q.title}</p>
                                            <p className="text-xs text-slate-500 font-semibold">
                                                Cobrado registrado: <strong className="text-emerald-600">{q.currency || 'USD'} {Number(q.soldPriceCollected || 0).toLocaleString()}</strong>
                                            </p>
                                        </div>
                                        {(() => {
                                            const stKey = String(q.status || 'draft').toLowerCase();
                                            const labelMap: Record<string, string> = {
                                                draft: 'Borrador',
                                                sent: 'Enviada',
                                                follow_up: 'Seguimiento',
                                                reserved: 'Reservada',
                                                sold: 'Vendida / Ganada',
                                                confirmed: 'Confirmada',
                                                lost: 'Perdida'
                                            };
                                            const labelText = labelMap[stKey] || String(q.status || 'Borrador').toUpperCase();
                                            return (
                                                <span className="text-xs font-black uppercase text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                                    Estado: {labelText}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: DATOS DE DOCUMENTACIÓN */}
                    {activeTab === 'passport' && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-orange-500" /> Pasaporte y Datos de Identificación
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Nombre Completo</p>
                                    <p className="font-black text-slate-900 text-sm">{passengerData.name} {passengerData.surname}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pasaporte / DNI</p>
                                    <p className="font-black text-orange-600 text-sm">{passengerData.passportNumber || 'No cargado'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha de Nacimiento</p>
                                    <p className="font-bold text-slate-800 text-sm">{normalizeDateString(passengerData.birthDate) || '-'}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <p className="text-[10px] font-bold text-amber-500 uppercase">Vencimiento Pasaporte</p>
                                    <p className="font-bold text-amber-700 text-sm">{normalizeDateString(passengerData.passportExpiration) || '-'}</p>
                                </div>
                            </div>

                            {passengerData.notes && (
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Observaciones</p>
                                    <p className="text-xs text-slate-700 font-medium mt-1">{passengerData.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* MODAL FOOTER */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                        Cerrar Ficha
                    </button>
                </div>
            </div>
        </div>
    );
};
