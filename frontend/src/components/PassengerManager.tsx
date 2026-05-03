import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
    Users, Plus, Search, Mail, Phone, FileText, 
    Edit, Trash2, X, Save, MessageSquare, ChevronRight
} from 'lucide-react';

interface Passenger {
    id: string;
    name: string;
    surname: string;
    email: string;
    whatsapp: string;
    notes: string;
}

export const PassengerManager: React.FC = () => {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPassenger, setCurrentPassenger] = useState<Partial<Passenger>>({});

    useEffect(() => {
        fetchPassengers();
    }, []);

    const fetchPassengers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/passengers');
            setPassengers(res.data);
        } catch (e) {
            toast.error('Error al cargar pasajeros');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentPassenger.id) {
                await axios.patch(`/api/passengers/${currentPassenger.id}`, currentPassenger);
                toast.success('Pasajero actualizado');
            } else {
                await axios.post('/api/passengers', currentPassenger);
                toast.success('Pasajero creado');
            }
            setIsModalOpen(false);
            fetchPassengers();
        } catch (e) {
            toast.error('Error al guardar');
        }
    };

    const filteredPassengers = passengers.filter(p => 
        `${p.name} ${p.surname} ${p.whatsapp}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white shadow-xl border border-slate-100 rounded-[1.4rem] flex items-center justify-center rotate-3 transition-transform">
                        <Users className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="page-title">Base de Clientes</h1>
                        <p className="page-subtitle">{passengers.length} Pasajeros Registrados en CRM</p>
                    </div>
                </div>
                <button 
                  onClick={() => { setCurrentPassenger({}); setIsModalOpen(true); }}
                  className="btn-primary !px-10 shadow-none"
                >
                  <Plus className="w-5 h-5" /> Registrar Pasajero
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Buscá por nombre, apellido, DNI o WhatsApp (ej. 'Juan Perez')..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="standard-input pl-16 py-6 text-lg"
                />
            </div>

            {/* Passenger Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPassengers.map(p => (
                    <div key={p.id} className="premium-card group hover:shadow-orange-500/5">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-all shadow-inner">
                                <Users className="w-8 h-8" />
                            </div>
                            <button 
                                onClick={() => { setCurrentPassenger(p); setIsModalOpen(true); }}
                                className="secondary-button !w-12 !h-12 !p-0 flex items-center justify-center"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                        </div>

                        <h4 className="text-xl font-black text-slate-800 truncate mb-1 uppercase tracking-tight">{p.name} {p.surname}</h4>
                        <p className="section-label !text-[11px] !mb-8">ID CLIENTE: {p.id.split('-')[0]}</p>

                        <div className="space-y-4">
                            {p.whatsapp && (
                                <div className="flex items-center gap-4 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{p.whatsapp}</span>
                                </div>
                            )}
                            {p.email && (
                                <div className="flex items-center gap-4 text-slate-500">
                                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-sky-500" />
                                    </div>
                                    <span className="text-xs font-black lowercase tracking-tight truncate">{p.email}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center group/btn cursor-pointer">
                            <p className="text-[10px] font-black text-slate-600 group-hover/btn:text-slate-800 uppercase tracking-widest transition-colors">Expediente Completo</p>
                            <ChevronRight className="w-4 h-4 text-slate-800 group-hover/btn:text-orange-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!loading && filteredPassengers.length === 0 && (
                <div className="text-center py-24 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-8 h-8 text-slate-700" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No se encontraron pasajeros</p>
                </div>
            )}

            {/* CREATE/EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-50 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <form onSubmit={handleSave}>
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">{currentPassenger.id ? 'Editar Pasajero' : 'Nuevo Pasajero'}</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Completa los datos maestros del cliente</p>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="section-label !mb-0 pl-1">Nombre</label>
                                        <input 
                                            required
                                            value={currentPassenger.name || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, name: e.target.value})}
                                            className="standard-input"
                                            placeholder="Ej: Juan"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="section-label !mb-0 pl-1">Apellido</label>
                                        <input 
                                            required
                                            value={currentPassenger.surname || ''} 
                                            onChange={e => setCurrentPassenger({...currentPassenger, surname: e.target.value})}
                                            className="standard-input"
                                            placeholder="Ej: Perez"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="section-label !mb-0 !text-emerald-500 pl-1 flex items-center gap-2">
                                        <Phone className="w-3 h-3" /> WhatsApp de Contacto
                                    </label>
                                    <input 
                                        value={currentPassenger.whatsapp || ''} 
                                        onChange={e => setCurrentPassenger({...currentPassenger, whatsapp: e.target.value})}
                                        className="standard-input placeholder:text-emerald-500/20"
                                        placeholder="Ej: +54 9 11 ..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="section-label !mb-0 !text-sky-500 pl-1 flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Correo Electrónico
                                    </label>
                                    <input 
                                        type="email"
                                        value={currentPassenger.email || ''} 
                                        onChange={e => setCurrentPassenger({...currentPassenger, email: e.target.value})}
                                        className="standard-input placeholder:text-sky-500/20"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="section-label !mb-0 pl-1">Observaciones Críticas</label>
                                    <textarea 
                                        rows={4}
                                        value={currentPassenger.notes || ''} 
                                        onChange={e => setCurrentPassenger({...currentPassenger, notes: e.target.value})}
                                        className="standard-input !py-4 min-h-[120px] resize-none"
                                        placeholder="Preferencias de viaje, cumple, restricciones, etc..."
                                    />
                                </div>
                            </div>

                            <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-800 transition-all">Descartar</button>
                                <button type="submit" className="standard-button px-10">
                                    <Save className="w-5 h-5 mr-3" /> Confirmar Datos
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
