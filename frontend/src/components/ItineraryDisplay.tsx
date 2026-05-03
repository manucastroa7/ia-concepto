import { useState } from 'react'
import axios from 'axios'
import { Hotel, Plane, MapPin, Calendar, ArrowRight, Star, Car, RefreshCw } from 'lucide-react'

interface ItineraryDisplayProps {
  data: any;
}

export function ItineraryDisplay({ data }: ItineraryDisplayProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [customHotels, setCustomHotels] = useState<Record<number, any[]>>({});
  const [refreshing, setRefreshing] = useState<Record<number, boolean>>({});

  // Separar aiResponse y quote
  const rawContent = typeof data.aiResponse === 'string' ? JSON.parse(data.aiResponse) : (data.aiResponse || data);
  const quoteParams = data.quote || {};
  
  // Backwards compatibility: si tiene options (nuevo formato), usamos esa lista. Si no, lo empaquetamos.
  const options = rawContent.options ? rawContent.options : [rawContent];
  const content = options[activeTab] || options[0];

  const currentHotels = customHotels[activeTab] || content.hotels;

  const handleRefreshHotels = async () => {
    setRefreshing(p => ({ ...p, [activeTab]: true }));
    try {
      const res = await axios.post('/api/quotes/alternatives/hotels', {
        destination: content.optionName || content.destinations?.[0]?.name || "Destino seleccionado",
        existingHotels: currentHotels?.map((h: any) => h.name) || [],
        roomDistribution: quoteParams.roomDistribution,
        hotelCategory: quoteParams.hotelCategory,
        accommodationType: quoteParams.accommodationType,
        mealPlan: quoteParams.mealPlan
      });
      if (res.data && res.data.length > 0) {
        setCustomHotels(p => ({ ...p, [activeTab]: res.data }));
      }
    } catch (e) {
      alert("La IA está algo ocupada. No se pudieron obtener alternativas al instante.");
    }
    setRefreshing(p => ({ ...p, [activeTab]: false }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="premium-card p-8 bg-gradient-to-br from-primary-900/40 to-slate-900/40 border-primary-500/20">
        <h2 className="text-4xl font-bold mb-2 text-slate-800 tracking-tight">Tu Propuesta Maestro</h2>
        <p className="text-primary-300 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Inteligencia Artificial aplicada a tu viaje
        </p>
      </div>
      {/* Tabs */}
      {options.length > 1 && (
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {options.map((opt: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2 ${
                activeTab === idx 
                ? 'border-primary-500 text-primary-400 bg-slate-100' 
                : 'border-transparent text-slate-500 hover:text-slate-200 hover:bg-slate-100'
              }`}
            >
              <MapPin className="inline-block w-4 h-4 mr-2" />
              {opt.optionName || opt.destinations?.[0]?.name || `Opción ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Destination Option Description */}
      {(content.description || content.optionName) && (
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-800">{content.optionName}</h3>
          <p className="text-slate-600 leading-relaxed bg-slate-100 p-4 rounded-xl border border-slate-100 line-clamp-3 hover:line-clamp-none transition-all">
            {content.description}
          </p>
        </div>
      )}

      {/* Legacy Destinations if applicable */}
      {content.destinations && !content.options && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <MapPin className="text-primary-400" /> Opciones de Destino Recomendadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.destinations.map((dest: any, idx: number) => (
              <div key={idx} className="premium-card p-4 hover:shadow-primary-500/5 transition-all">
                <h4 className="font-bold text-slate-800 mb-1">{dest.name}</h4>
                <p className="text-sm text-slate-500 leading-tight">{dest.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotels */}
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Hotel className="text-yellow-400" /> Selección de Hotelería (4.4+ ★)
          </h3>
          <button 
            onClick={handleRefreshHotels}
            disabled={refreshing[activeTab]}
            className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg disabled:opacity-50 transition-all font-medium text-slate-600 hover:text-slate-800 border border-slate-200 shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing[activeTab] ? 'animate-spin' : ''}`} />
            Alternativas Aleatorias
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentHotels?.map((hotel: any, idx: number) => (
            <div key={idx} className="premium-card overflow-hidden group flex flex-col">
              {/* Hotel Photo or placeholder */}
              <div className="bg-slate-800 h-44 relative flex items-center justify-center overflow-hidden">
                {hotel.photoUrl ? (
                  <img
                    src={hotel.photoUrl}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Hotel className="w-12 h-12 text-slate-700" />
                )}
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-yellow-500/95 text-slate-900 font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-current" /> {hotel.rating}
                  {hotel.numReviews && <span className="text-xs font-normal opacity-80">({hotel.numReviews})</span>}
                </div>
                {/* Price Level Badge */}
                {hotel.priceLevel && (
                  <div className="absolute top-3 left-3 bg-white backdrop-blur-sm text-emerald-400 font-bold px-3 py-1 rounded-full text-sm shadow-lg border border-emerald-500/30">
                    {hotel.priceLevel}
                  </div>
                )}
                {hotel.mapsUrl && (
                  <a
                    href={hotel.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-blue-600/90 hover:bg-blue-500 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <MapPin className="w-3 h-3" /> Ver en Maps
                  </a>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h4 className="text-lg font-bold text-slate-800 mb-1">{hotel.name}</h4>
                {hotel.address && <p className="text-xs text-slate-500 mb-3 leading-tight">{hotel.address}</p>}
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-primary-400 mb-3">
                  <span>{hotel.category}</span>
                  <span className="text-slate-500">{hotel.location}</span>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  {hotel.roomType && (
                    <div className="flex items-center gap-2 text-xs font-medium bg-slate-800/80 px-3 py-2 rounded-lg text-primary-300 border border-primary-500/20">
                      🛏️ {hotel.roomType}
                    </div>
                  )}
                  {hotel.mealPlan && (
                    <div className="flex items-center gap-2 text-xs font-medium bg-slate-800/80 px-3 py-2 rounded-lg text-emerald-300 border border-emerald-500/20">
                      🍽️ {hotel.mealPlan}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logistics: Flights & Transfers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6 bg-blue-500/5 border-blue-500/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <Plane className="text-blue-400" /> Conexiones Aéreas
          </h3>
          <ul className="space-y-3">
            {content.flights?.map((flight: any, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">{flight.airline}</p>
                  <p className="text-sm text-slate-500">Días: {flight.days}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="premium-card p-6 bg-emerald-500/5 border-emerald-500/20">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <Car className="text-emerald-400" /> Traslados y Movilidad
          </h3>
          <p className="text-slate-600 text-sm italic border-l-2 border-emerald-500 pl-4">
            {content.transfers?.recommendation}
          </p>
        </div>
      </div>

      {/* Itinerary */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Calendar className="text-primary-400" /> Itinerario Propuesto
        </h3>
        <div className="space-y-0 relative border-l border-slate-200 ml-4 pl-8 pb-12">
          {content.itinerary?.map((day: any, idx: number) => (
            <div key={idx} className="relative mb-12 last:mb-0 group">
              <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-[#0f172a] group-hover:scale-125 transition-transform" />
              <div className="bg-slate-100 border border-slate-100 p-6 rounded-2xl group-hover:border-primary-500/30 transition-all">
                <span className="text-primary-400 font-bold text-xs uppercase mb-1 flex items-center gap-2">
                  Día {day.day} {day.date && <span className="bg-primary-900/40 px-2 py-0.5 rounded border border-primary-500/20 text-primary-300">{day.date}</span>}
                </span>
                <h4 className="text-xl font-bold text-slate-800 mb-3">{day.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{day.description}</p>
                {day.activities && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {day.activities.map((act: string, i: number) => (
                      <span key={i} className="bg-slate-800 text-slate-600 text-[10px] px-2 py-1 rounded-md uppercase tracking-wider">
                        {act}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end p-8">
        <button className="flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-4 rounded-full hover:bg-primary-100 transition-all active:scale-95 shadow-xl">
          Enviar por Email <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3-3-8z" />
    </svg>
  )
}
