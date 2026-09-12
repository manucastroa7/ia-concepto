import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
    Users, Plus, Search, Mail, Phone, FileText, 
    Edit, Trash2, X, Save, MessageSquare, ChevronRight, ChevronLeft, 
    ChevronsLeft, ChevronsRight, Upload, Sparkles, CreditCard, Calendar, 
    Globe, RefreshCw, Check, LayoutGrid, List
} from 'lucide-react';

import { PassengerProfileModal } from './PassengerProfileModal';

interface Passenger {
    id: string;
    name: string;
    surname: string;
    email?: string;
    whatsapp?: string;
    passportNumber?: string;
    birthDate?: string;
    passportExpiration?: string;
    nationality?: string;
    notes?: string;
}

// Global Date Normalizer: Converts "06.05.1949", "18 MAR/MAR 55", "21 JUN 60", "25 Aug 1963", "29/05/1955" -> "DD/MM/YYYY"
export function normalizeDateString(rawStr?: string | null): string {
    if (!rawStr) return '';
    let str = rawStr.trim();
    if (!str) return '';

    // Month mapping table
    const monthsMap: Record<string, string> = {
        jan: '01', ene: '01', january: '01', enero: '01',
        feb: '02', february: '02', febrero: '02',
        mar: '03', march: '03', marzo: '03',
        apr: '04', abr: '04', april: '04', abril: '04',
        may: '05', mayo: '05',
        jun: '06', june: '06', junio: '06',
        jul: '07', july: '07', julio: '07',
        aug: '08', ago: '08', august: '08', agosto: '08',
        sep: '09', sept: '09', september: '09', septiembre: '09',
        oct: '10', october: '10', octubre: '10',
        nov: '11', november: '11', noviembre: '11',
        dec: '12', dic: '12', december: '12', diciembre: '12',
    };

    // Clean dual text like "18 MAR/MAR 55" or "12 ABR/APR 28"
    str = str.replace(/([a-zA-Z]+)\/([a-zA-Z]+)/gi, '$1');

    // Handle YYYY-MM-DD (ISO)
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
    }

    // Handle numeric DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    const numericMatch = str.match(/^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{2,4})$/);
    if (numericMatch) {
        const day = numericMatch[1].padStart(2, '0');
        const month = numericMatch[2].padStart(2, '0');
        let year = numericMatch[3];
        if (year.length === 2) {
            const numY = parseInt(year, 10);
            year = numY > 45 ? `19${year}` : `20${year}`;
        }
        return `${day}/${month}/${year}`;
    }

    // Handle textual months: "18 MAR 55", "25 Aug 1963", "21 JUN 60"
    const tokens = str.split(/[\s\.\/-]+/).filter(Boolean);
    let day = '';
    let month = '';
    let year = '';

    for (const token of tokens) {
        const lowerToken = token.toLowerCase();
        if (monthsMap[lowerToken]) {
            month = monthsMap[lowerToken];
        } else if (/^\d+$/.test(token)) {
            if (!day && parseInt(token, 10) <= 31) {
                day = token.padStart(2, '0');
            } else if (!year) {
                year = token;
                if (year.length === 2) {
                    const numY = parseInt(year, 10);
                    year = numY > 45 ? `19${year}` : `20${year}`;
                }
            }
        }
    }

    if (day && month && year) {
        return `${day}/${month}/${year}`;
    }

    return rawStr;
}

export const PassengerManager: React.FC = () => {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPassengerForProfile, setSelectedPassengerForProfile] = useState<string | null>(null);
    const [currentPassenger, setCurrentPassenger] = useState<Partial<Passenger>>({});
    
    // Passport AI Extraction State
    const [passportFile, setPassportFile] = useState<File | null>(null);
    const [extractingPassport, setExtractingPassport] = useState(false);
    const passportInputRef = useRef<HTMLInputElement>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchPassengers();
    }, []);

    // Reset pagination when searching or changing page size
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const fetchPassengers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/passengers');
            setPassengers(res.data || []);
        } catch (e) {
            toast.error('Error al cargar pasajeros');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...currentPassenger,
                birthDate: normalizeDateString(currentPassenger.birthDate),
                passportExpiration: normalizeDateString(currentPassenger.passportExpiration)
            };

            if (currentPassenger.id) {
                await axios.patch(`/api/passengers/${currentPassenger.id}`, payload);
                toast.success('Pasajero actualizado exitosamente');
            } else {
                await axios.post('/api/passengers', payload);
                toast.success('Pasajero registrado en el sistema');
            }
            setIsModalOpen(false);
            setPassportFile(null);
            fetchPassengers();
        } catch (e) {
            toast.error('Error al guardar datos del pasajero');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar a "${name}" de la base de pasajeros?`)) return;
        try {
            await axios.delete(`/api/passengers/${id}`);
            toast.success('Pasajero eliminado');
            fetchPassengers();
        } catch (e) {
            toast.error('Error al eliminar pasajero');
        }
    };

    // Passport AI Extraction Trigger
    const handlePassportUpload = async (file: File) => {
        setPassportFile(file);
        setExtractingPassport(true);
        const toastId = toast.loading('Procesando pasaporte con IA...');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post('/api/passengers/extract-passport', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const extracted = res.data;
            setCurrentPassenger(prev => ({
                ...prev,
                name: extracted.name || prev.name || '',
                surname: extracted.surname || prev.surname || '',
                passportNumber: extracted.passportNumber || prev.passportNumber || '',
                birthDate: normalizeDateString(extracted.birthDate) || prev.birthDate || '',
                passportExpiration: normalizeDateString(extracted.passportExpiration) || prev.passportExpiration || '',
                nationality: extracted.nationality || prev.nationality || ''
            }));

            toast.success('¡Datos del pasaporte extraídos y normalizados!', { id: toastId });
        } catch (e: any) {
            console.error(e);
            toast.error('No se pudo extraer los datos automáticamente. Ingresálos manualmente.', { id: toastId });
        } finally {
            setExtractingPassport(false);
        }
    };

    const filteredPassengers = useMemo(() => {
        if (!searchTerm.trim()) return passengers;
        const term = searchTerm.toLowerCase().trim();
        return passengers.filter(p => 
            `${p.name} ${p.surname} ${p.whatsapp} ${p.email} ${p.passportNumber} ${p.nationality}`.toLowerCase().includes(term)
        );
    }, [passengers, searchTerm]);

    const stats = useMemo(() => {
        const total = passengers.length;
        const withPassport = passengers.filter(p => p.passportNumber).length;
        const withContact = passengers.filter(p => p.whatsapp || p.email).length;
        return { total, withPassport, withContact };
    }, [passengers]);

    // Pagination Calculations
    const totalPages = Math.max(1, Math.ceil(filteredPassengers.length / itemsPerPage));
    const paginatedPassengers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPassengers.slice(start, start + itemsPerPage);
    }, [filteredPassengers, currentPage, itemsPerPage]);

    const startItemIndex = filteredPassengers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItemIndex = Math.min(currentPage * itemsPerPage, filteredPassengers.length);

    const formatPhoneForWhatsapp = (phone: string) => phone.replace(/[^0-9]/g, '');

    return (
        <div className="space-y-6 pb-32">
            {/* Header Banner */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 text-white shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100">
                                Base de Datos
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-0.5">Pasajeros</h1>
                        <p className="text-slate-500 font-medium text-xs">Fichas de viajeros, documentos y lectura de pasaportes con IA.</p>
                    </div>
                </div>
                
                <button 
                  onClick={() => { setCurrentPassenger({}); setPassportFile(null); setIsModalOpen(true); }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Registrar Pasajero
                </button>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pasajeros</p>
                        <p className="text-xl font-black text-slate-900">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Con Pasaporte Cargado</p>
                        <p className="text-xl font-black text-slate-900">{stats.withPassport}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Con Contacto Directo</p>
                        <p className="text-xl font-black text-slate-900">{stats.withContact}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar & View Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96 flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input 
                        type="text" 
                        placeholder="Filtrar por nombre, DNI, pasaporte, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/80 focus:border-orange-500 focus:bg-white rounded-xl pl-10 pr-10 py-2 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 text-slate-400 hover:text-slate-600 p-1">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Mostrando <strong className="text-slate-800 font-black">{filteredPassengers.length}</strong> de {stats.total}
                    </span>

                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                        <button
                          onClick={() => setViewMode('table')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === 'table' 
                              ? 'bg-white text-slate-900 shadow-xs' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                          title="Vista enlistada (Tabla)"
                        >
                          <List className="w-3.5 h-3.5" /> Lista
                        </button>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === 'grid' 
                              ? 'bg-white text-slate-900 shadow-xs' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                          title="Vista tarjetas (Grid)"
                        >
                          <LayoutGrid className="w-3.5 h-3.5" /> Tarjetas
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando pasajeros...</p>
                </div>
            ) : filteredPassengers.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">No se encontraron pasajeros</h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                        {searchTerm ? `No hay coincidencias para "${searchTerm}"` : 'Agregá tu primer pasajero.'}
                    </p>
                </div>
            ) : viewMode === 'table' ? (
                /* VISTA ENLISTADA (TABLA DE NIVEL EJECUTIVO) */
                <div className="app-table-container">
                    <div className="overflow-x-auto">
                        <table className="app-table">
                            <thead>
                                <tr className="app-table-header h-11">
                                    <th className="px-4 py-2 font-bold whitespace-nowrap">Pasajero / Titular</th>
                                    <th className="px-4 py-2 font-bold whitespace-nowrap">Pasaporte / DNI</th>
                                    <th className="px-4 py-2 font-bold whitespace-nowrap">Fechas Normalizadas</th>
                                    <th className="px-4 py-2 font-bold whitespace-nowrap">Contacto (WA / Email)</th>
                                    <th className="px-4 py-2 font-bold whitespace-nowrap">Observaciones</th>
                                    <th className="px-4 py-2 font-bold text-right whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                                {paginatedPassengers.map((p) => {
                                    const birthFormatted = normalizeDateString(p.birthDate);
                                    const expFormatted = normalizeDateString(p.passportExpiration);

                                    return (
                                        <tr key={p.id} className="hover:bg-orange-50/30 transition-colors group">
                                            {/* Name */}
                                            <td className="py-3.5 px-5 font-black text-slate-900 uppercase tracking-tight text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-orange-500 shrink-0 opacity-80" />
                                                    <span>{p.name} {p.surname}</span>
                                                </div>
                                                {p.nationality && (
                                                    <span className="text-[10px] font-bold text-slate-400 lowercase block mt-0.5">
                                                        Nacionalidad: {p.nationality}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Passport / DNI */}
                                            <td className="py-3.5 px-4">
                                                {p.passportNumber ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                                                        <CreditCard className="w-3 h-3" /> {p.passportNumber}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 italic font-normal text-[11px]">Sin pasaporte</span>
                                                )}
                                            </td>

                                            {/* Birth / Expiration dates (UNIFIED DD/MM/YYYY) */}
                                            <td className="py-3.5 px-4 space-y-1">
                                                {birthFormatted && (
                                                    <div className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-slate-400" /> Nac: <span className="font-bold text-slate-900">{birthFormatted}</span>
                                                    </div>
                                                )}
                                                {expFormatted && (
                                                    <div className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-amber-500" /> Venc: <span className="font-bold text-amber-700">{expFormatted}</span>
                                                    </div>
                                                )}
                                                {!birthFormatted && !expFormatted && (
                                                    <span className="text-slate-300 italic font-normal text-[11px]">-</span>
                                                )}
                                            </td>

                                            {/* Contact */}
                                            <td className="py-3.5 px-4 space-y-1">
                                                {p.whatsapp && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                        <span className="font-semibold text-slate-800">{p.whatsapp}</span>
                                                        <a 
                                                            href={`https://wa.me/${formatPhoneForWhatsapp(p.whatsapp)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded-md transition-colors"
                                                        >
                                                            <MessageSquare className="w-3 h-3" /> Chat
                                                        </a>
                                                    </div>
                                                )}
                                                {p.email && (
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                                        <a href={`mailto:${p.email}`} className="truncate font-medium hover:text-orange-600 lowercase">
                                                            {p.email}
                                                        </a>
                                                    </div>
                                                )}
                                                {!p.whatsapp && !p.email && (
                                                    <span className="text-slate-300 italic font-normal text-[11px]">Sin contacto</span>
                                                )}
                                            </td>

                                            {/* Notes */}
                                            <td className="py-3.5 px-4 max-w-xs">
                                                {p.notes ? (
                                                    <p className="truncate text-slate-500 text-[11px] font-normal" title={p.notes}>
                                                        {p.notes}
                                                    </p>
                                                ) : (
                                                    <span className="text-slate-300 italic font-normal text-[11px]">-</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => setSelectedPassengerForProfile(p.id)}
                                                        className="px-2.5 py-1 text-[10.5px] font-black uppercase text-orange-600 bg-orange-50 hover:bg-orange-500 hover:text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                                        title="Ver Ficha Completa, Servicios y Pagos"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" /> Ficha & Pagos
                                                    </button>
                                                    <button 
                                                        onClick={() => { setCurrentPassenger(p); setPassportFile(null); setIsModalOpen(true); }}
                                                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(p.id, `${p.name} ${p.surname}`)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* VISTA DE TARJETAS (GRID) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedPassengers.map(p => {
                        const birthFormatted = normalizeDateString(p.birthDate);
                        const expFormatted = normalizeDateString(p.passportExpiration);

                        return (
                            <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 hover:border-orange-500/40 p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                                                {p.name} {p.surname}
                                            </h4>
                                            {p.passportNumber ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 mt-1">
                                                    <CreditCard className="w-2.5 h-2.5" /> PAS: {p.passportNumber}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                                                    ID: {p.id.split('-')[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button 
                                                onClick={() => { setCurrentPassenger(p); setPassportFile(null); setIsModalOpen(true); }}
                                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                title="Editar datos"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id, `${p.name} ${p.surname}`)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 py-3 border-t border-slate-100">
                                        {birthFormatted && (
                                            <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between">
                                                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Fecha Nac:</span>
                                                <span className="font-bold text-slate-900">{birthFormatted}</span>
                                            </div>
                                        )}
                                        {expFormatted && (
                                            <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 flex items-center justify-between">
                                                <span className="text-[10.5px] font-bold text-amber-500 uppercase tracking-wider">Vencimiento Pasaporte:</span>
                                                <span className="font-bold text-amber-700">{expFormatted}</span>
                                            </div>
                                        )}
                                        {p.whatsapp && (
                                            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                    <span className="font-semibold text-slate-800 truncate">{p.whatsapp}</span>
                                                </div>
                                                <a 
                                                    href={`https://wa.me/${formatPhoneForWhatsapp(p.whatsapp)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[9.5px] font-black uppercase text-emerald-600 bg-emerald-100/60 hover:bg-emerald-600 hover:text-white px-2 py-0.5 rounded-md transition-colors"
                                                >
                                                    Chat
                                                </a>
                                            </div>
                                        )}
                                        {p.email && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                                <a href={`mailto:${p.email}`} className="truncate font-medium text-slate-700 hover:text-orange-600 lowercase">
                                                    {p.email}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {p.notes && (
                                        <div className="mt-2 pt-2 border-t border-slate-100">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Observaciones</p>
                                            <p className="text-xs text-slate-600 line-clamp-2 bg-amber-50/50 p-2 rounded-xl border border-amber-100/60 font-normal">
                                                {p.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* PAGINATION CONTROLS BAR */}
            {filteredPassengers.length > 0 && (
                <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                        <span>
                            Mostrando <strong className="text-slate-900 font-bold">{startItemIndex} - {endItemIndex}</strong> de <strong className="text-slate-900 font-bold">{filteredPassengers.length}</strong>
                        </span>

                        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Filas:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-orange-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            title="Primera página"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Anterior
                        </button>

                        <div className="px-3 py-1.5 text-xs font-black text-slate-800 bg-slate-100 rounded-lg">
                            {currentPage} / {totalPages}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        >
                            Siguiente <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            title="Última página"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT MODAL WITH PASSPORT AI EXTRACTION */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleSave}>
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                                            {currentPassenger.id ? 'Editar Pasajero' : 'Nuevo Pasajero'}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-medium">Ficha maestra y pasaporte del viajero.</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                {/* PASSPORT AI OCR DROPZONE BANNER */}
                                <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border-2 border-dashed border-orange-500/40 rounded-2xl p-4 text-center transition-all hover:bg-orange-500/15">
                                    <input 
                                        type="file"
                                        ref={passportInputRef}
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handlePassportUpload(file);
                                        }}
                                    />

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
                                            {extractingPassport ? (
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                                                {extractingPassport ? 'Leyendo Pasaporte con IA...' : 'Escanear Pasaporte o DNI con IA'}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                Subí una foto o PDF del pasaporte para autocompletar nombre, número, nacimiento y vencimiento.
                                            </p>
                                        </div>

                                        <button 
                                            type="button"
                                            disabled={extractingPassport}
                                            onClick={() => passportInputRef.current?.click()}
                                            className="mt-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Upload className="w-3.5 h-3.5" /> Subir Pasaporte / DNI
                                        </button>
                                    </div>
                                </div>

                                {/* Form Fields Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="app-label">
                                            Nombre <span className="text-orange-500">*</span>
                                        </label>
                                        <input 
                                            required
                                            value={currentPassenger.name || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, name: e.target.value})}
                                            className="app-input"
                                            placeholder="Ej: Juan Carlos"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="app-label">
                                            Apellido <span className="text-orange-500">*</span>
                                        </label>
                                        <input 
                                            required
                                            value={currentPassenger.surname || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, surname: e.target.value})}
                                            className="app-input"
                                            placeholder="Ej: Perez Garcia"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="app-label flex items-center gap-1">
                                            <CreditCard className="w-3 h-3 text-orange-500" /> Pasaporte / DNI
                                        </label>
                                        <input 
                                            value={currentPassenger.passportNumber || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, passportNumber: e.target.value})}
                                            className="app-input uppercase"
                                            placeholder="Ej: AAB123456"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="app-label flex items-center gap-1">
                                            <Globe className="w-3 h-3 text-slate-400" /> Nacionalidad
                                        </label>
                                        <input 
                                            value={currentPassenger.nationality || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, nationality: e.target.value})}
                                            className="app-input"
                                            placeholder="Ej: Argentina"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="app-label flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-slate-400" /> Fecha Nacimiento
                                        </label>
                                        <input 
                                            value={currentPassenger.birthDate || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, birthDate: e.target.value})}
                                            onBlur={e => setCurrentPassenger({...currentPassenger, birthDate: normalizeDateString(e.target.value)})}
                                            className="app-input"
                                            placeholder="DD/MM/YYYY"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="app-label flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-amber-500" /> Expiración Pasaporte
                                        </label>
                                        <input 
                                            value={currentPassenger.passportExpiration || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, passportExpiration: e.target.value})}
                                            onBlur={e => setCurrentPassenger({...currentPassenger, passportExpiration: normalizeDateString(e.target.value)})}
                                            className="app-input"
                                            placeholder="DD/MM/YYYY"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="app-label flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-emerald-500" /> WhatsApp
                                        </label>
                                        <input 
                                            value={currentPassenger.whatsapp || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, whatsapp: e.target.value})}
                                            className="app-input"
                                            placeholder="+54 9 11 ..."
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="app-label flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-sky-500" /> Email
                                        </label>
                                        <input 
                                            type="email"
                                            value={currentPassenger.email || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, email: e.target.value})}
                                            className="app-input lowercase"
                                            placeholder="pasajero@ejemplo.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="app-label">Observaciones / Preferencias</label>
                                    <textarea 
                                        rows={3}
                                        value={currentPassenger.notes || ''} 
                                        onChange={e => setCurrentPassenger({...currentPassenger, notes: e.target.value})}
                                        className="app-textarea min-h-[80px] resize-none"
                                        placeholder="Preferencias de asiento, restricción de alimentos, fechas clave..."
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="app-btn-secondary flex-1">Cancelar</button>
                                <button type="submit" className="app-btn-primary flex-1">
                                    <Save className="w-4 h-4" /> Confirmar Pasajero
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PASSENGER PROFILE & SERVICES MODAL */}
            {selectedPassengerForProfile && (
                <PassengerProfileModal
                    passengerId={selectedPassengerForProfile}
                    onClose={() => setSelectedPassengerForProfile(null)}
                />
            )}
        </div>
    );
};
