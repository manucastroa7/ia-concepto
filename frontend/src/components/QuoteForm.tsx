import { useState } from 'react'
import axios from 'axios'
import { Send, MapPin, Users, Hotel, Plane, Settings, DollarSign } from 'lucide-react'

interface QuoteFormProps {
  onResults: (res: any) => void;
  setLoading: (l: boolean) => void;
  loading: boolean;
}

export function QuoteForm({ onResults, setLoading, loading }: QuoteFormProps) {
  const [formData, setFormData] = useState({
    originCity: '',
    destination: '',
    travelersCount: 2,
    hotelCategory: '4 estrellas',
    directFlights: true,
    tripStyle: 'custom',
    isCentric: true,
    budget: '5000',
    extraInfo: '',
    activitiesQuote: false,
    roomDistribution: '',
    accommodationType: '',
    mealPlan: '',
    durationDays: 7,
    travelDates: 'Flexibles',
    zone: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('/api/quotes', formData)
      onResults({ aiResponse: response.data.aiResponse, quote: response.data.quote })
    } catch (error) {
      console.error('Error:', error)
      alert('Error al generar la cotización. Verifica la consola o el backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="premium-card p-6 space-y-6 shadow-2xl">
      <div className="space-y-4">
        {/* Origen y Destino */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Plane className="w-4 h-4" /> Ciudad de Origen
            </label>
            <input
              name="originCity"
              value={formData.originCity}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Ejem: Buenos Aires"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Destino
            </label>
            <input
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Ejem: Italia, Riviera Maya..."
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4" /> Pasajeros
              </label>
              <input
                type="number"
                name="travelersCount"
                value={formData.travelersCount}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Distribución</label>
              <input
                type="text"
                name="roomDistribution"
                value={formData.roomDistribution}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="Ejem: 1 Quíntuple, 2 Dobles..."
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Hotel className="w-4 h-4" /> Alojamiento
              </label>
              <input
                type="text"
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="Ejem: Hotel, Posada, All-Inclusive..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Categoría</label>
              <select
                name="hotelCategory"
                value={formData.hotelCategory}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="3 estrellas">3 Estrellas</option>
                <option value="4 estrellas">4 Estrellas</option>
                <option value="5 estrellas">5 Estrellas</option>
                <option value="Gran Lujo">Gran Lujo</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Régimen Alimenticio</label>
              <input
                type="text"
                name="mealPlan"
                value={formData.mealPlan}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="Ejem: All Inclusive, Media Pensión..."
                required
              />
            </div>
          </div>
        </div>

        {/* Fechas y Duración */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Plane className="w-4 h-4" /> Fechas de Viaje
            </label>
            <input
              type="text"
              name="travelDates"
              value={formData.travelDates}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Ejem: Flexibles, Octubre 2024..."
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500">Duración (Días)</label>
            <input
              type="number"
              name="durationDays"
              value={formData.durationDays}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none"
              min="1"
              required
            />
          </div>
        </div>

        {/* Zona/Barrio preferido */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Zona / Barrio preferido (para hotelería)
          </label>
          <input
            type="text"
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            placeholder="Ejem: Passarela do Álcool, Praia do Mutá, Centro..."
          />
        </div>

        {/* Estilo de Viaje */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Estilo de Viaje
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['custom', 'luxury', 'circuits', 'group'].map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setFormData(p => ({ ...p, tripStyle: style }))}
                className={`p-3 rounded-lg border text-sm capitalize transition-all ${
                  formData.tripStyle === style 
                  ? 'bg-primary-600/20 border-primary-500 text-slate-800 shadow-lg shadow-primary-500/10' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {style === 'custom' ? 'A Medida' : style === 'luxury' ? 'De Lujo' : style === 'circuits' ? 'Circuitos' : 'Grupales'}
              </button>
            ))}
          </div>
        </div>

        {/* Opciones booleanas */}
        <div className="flex flex-wrap gap-6 py-2 border-y border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="directFlights"
              checked={formData.directFlights}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-200 bg-white checked:bg-primary-500 transition-all cursor-pointer"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Vuelos Directos</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="isCentric"
              checked={formData.isCentric}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-200 bg-white checked:bg-primary-500 transition-all cursor-pointer"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Ubicación Céntrica</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="activitiesQuote"
              checked={formData.activitiesQuote}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-200 bg-white checked:bg-primary-500 transition-all cursor-pointer"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Cotizar Actividades (No solo sugerir)</span>
          </label>
        </div>

        {/* Presupuesto */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Presupuesto Estimado (USD)
          </label>
          <input
            type="range"
            name="budget"
            min="1000"
            max="30000"
            step="500"
            value={formData.budget}
            onChange={handleChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-slate-500 font-mono mt-1">
            <span>$1,000</span>
            <span className="text-primary-400 font-bold text-lg">${parseInt(formData.budget).toLocaleString()}</span>
            <span>$30,000+</span>
          </div>
        </div>

        {/* Info extra */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500">Requerimientos Especiales</label>
          <textarea
            name="extraInfo"
            value={formData.extraInfo}
            onChange={handleChange}
            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-slate-800 h-24 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder="Alergias, destinos específicos, actividades preferidas..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary-900/20 active:scale-[0.98] transition-all"
      >
        <Send className="w-5 h-5" />
        {loading ? 'ANALIZANDO DESTINOS...' : 'GENERAR PROPUESTA MAESTRA'}
      </button>
    </form>
  )
}
