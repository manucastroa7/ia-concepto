import dotenv from "dotenv";
import { OpenAIService } from "./OpenAIService";

dotenv.config();

export interface QuotationRequest {
  originCity: string;
  destination: string;
  travelersCount: number;
  hotelCategory: string;
  directFlights: boolean;
  tripStyle: "luxury" | "custom" | "circuits" | "group";
  isCentric: boolean;
  budget: string;
  extraInfo?: string;
  activitiesQuote: boolean;
  roomDistribution: string;
  accommodationType: string;
  mealPlan: string;
  durationDays: number;
  travelDates: string;
}

export class AIService {
  private openai = new OpenAIService();

  async generateItinerary(request: QuotationRequest) {
    const prompt = `
Actua como un experto en viajes de lujo y UX/UI.
Genera una cotizacion e itinerario detallado para el siguiente pedido:
Origen: ${request.originCity}
Destino: ${request.destination}
Viajeros: ${request.travelersCount} (${request.roomDistribution})
Tipo de Alojamiento: ${request.accommodationType} - Categoria: ${request.hotelCategory}
Regimen Alimenticio: ${request.mealPlan}
Duracion: ${request.durationDays} dias
Fechas: ${request.travelDates}
Vuelos Directos: ${request.directFlights ? `Si (Debe existir vuelo directo desde ${request.originCity} hasta ${request.destination})` : "No"}
Estilo de Viaje: ${request.tripStyle}
Ubicacion Centrica: ${request.isCentric ? "Si" : "No"}
Presupuesto: ${request.budget}
Cotizar Actividades: ${request.activitiesQuote ? "Si (Incluir precios estimados)" : "No (Solo sugerencias y opciones libres)"}
Informacion Adicional: ${request.extraInfo || "Ninguna"}

IMPORTANTE: Los hoteles ya seran provistos por Google Places en tiempo real. NO incluyas "hotels" en tu respuesta. Solo genera el itinerario, vuelos y traslados.

REQUISITOS INQUEBRANTABLES:
1. DESTINOS MULTIPLES: Si se piden multiples destinos (ej. "D1 o D2"), DEBES crear un objeto SEPARADO en "options" para CADA destino. No los mezcles.
2. ITINERARIO: Mapea cada dia con su "date" calculada a partir de las fechas informadas. El Dia 1 es la fecha de llegada.
3. Formato: Devuelve ESTRICTAMENTE un JSON con esta estructura (SIN TEXTO ADICIONAL, SIN SALUDOS, SOLO JSON PURO):
{
  "options": [
    {
      "optionName": "Destino 1 (ej. Porto Seguro)",
      "description": "Descripcion de esta opcion",
      "flights": [{"airline": "...", "days": "..."}],
      "transfers": {"recommendation": "..."},
      "itinerary": [{"day": 1, "date": "28 de Junio", "title": "Llegada y check-in", "description": "...", "activities": ["..."]}]
    }
  ]
}
`;

    const aiText = await this.openai.generateText(prompt);

    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("No JSON structure found in response:", aiText);
        throw new Error("La IA no devolvio un formato JSON valido.");
      }

      return JSON.parse(jsonMatch[0].trim());
    } catch (parseError: any) {
      console.error("Error in AIService OpenAI call:", parseError.message);
      throw new Error("Failed to generate itinerary with AI");
    }
  }

  async getAlternativeHotels(params: any): Promise<any> {
    const prompt = `
Actua como un experto en hoteleria de lujo y viajes a medida.
Necesito 3 opciones de hoteles NUEVAS y completamente DIFERENTES a estas: ${params.existingHotels.join(", ")}.
Destino EXACTO: ${params.destination}
Categoria Obligatoria: ${params.hotelCategory || "4 Estrellas"}
Tipo de Alojamiento Solicitado: ${params.accommodationType || "Hotel"}
Regimen Alimenticio Solicitado: ${params.mealPlan || "Desayuno"}
Distribucion de Habitacion: ${params.roomDistribution || "Doble"}

REGLAS INQUEBRANTABLES:
1. CAPACIDAD REAL DE CAMAS: La distribucion de habitacion pedida es ${params.roomDistribution || "Doble"}. Si piden una habitacion muy grande, verifica que el hotel efectivamente la tenga. Si no, informa una sugerencia dividida real.
2. UBICACION: Los hoteles DEBEN estar geograficamente situados en ${params.destination}.
3. PUNTUACION Y CATEGORIA: Sigue ESTRICTAMENTE el tipo de alojamiento y categoria solicitados. Sugiere opciones con puntuacion de huespedes mayor a 4.4 cuando sea posible.
4. Mantiene la misma distribucion de cuartos y regimen alimenticio solicitado cuando tenga sentido.
5. No incluyas saludos ni texto de introduccion.

Formato: Devuelve ESTRICTAMENTE un JSON con esta estructura (SOLO JSON PURO):
[
  {"name": "...", "rating": 4.6, "roomType": "Ej: Premium Ocean View", "mealPlan": "Ej: All Inclusive", "reason": "...", "category": "...", "location": "..."}
]
`;

    const aiText = await this.openai.generateText(prompt);

    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON structure found");
      return JSON.parse(jsonMatch[0].trim());
    } catch (e: any) {
      throw new Error("Error parsing alternative hotels JSON: " + e.message);
    }
  }
}
