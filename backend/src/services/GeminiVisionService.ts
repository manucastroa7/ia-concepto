import dotenv from "dotenv";
import { OpenAIService } from "./OpenAIService";

dotenv.config();

export interface ExtractedFlyerData {
  operator?: string;
  destination: string;
  title: string;
  dates?: string;
  duration?: string;
  price?: string;
  currency?: string;
  inclusions: string[];
  exclusions: string[];
  hotelNames: string[];
  departureCity?: string;
  highlights?: string[];
  itinerary?: string[];
  deadline?: string;
  rawText?: string;
  category?: "Brasil" | "Caribe" | "Europa" | "Sports" | "USA" | "Salidas Grupales" | "Otro";
  packages?: {
    hotelName: string;
    subDestination?: string;
    boardBasis?: string;
    prices: {
      type: string;
      amount: string;
      currency: string;
      currencyIcon?: string;
    }[];
  }[];
}

export interface InstagramStoriesPlan {
  story1: {
    hook: string;
    searchTerms: string;
  };
  story2: {
    benefits: string[];
    visualSuggestion: string;
  };
  story3: {
    videoPrompt: string;
    overlayText: string;
    cta: string;
  };
}

export class GeminiVisionService {
  private openai = new OpenAIService();

  private async callAI(prompt: string, imageBase64?: string, mimeType?: string): Promise<string> {
    if (imageBase64 && mimeType) {
      return this.openai.generateFromImage(prompt, imageBase64, mimeType);
    }

    return this.openai.generateText(prompt);
  }

  async extractFlyerData(fileBuffer: Buffer, mimeType: string): Promise<ExtractedFlyerData> {
    const base64 = fileBuffer.toString("base64");

    const prompt = `Analiza esta imagen de flyer de viaje. Extrae todos los datos en formato JSON puro, sin texto adicional y sin markdown:
{
  "operator": "nombre de la operadora/mayorista",
  "destination": "destino principal o pais",
  "title": "titulo comercial del paquete",
  "dates": "fechas del viaje (ej: 15 Oct, Salidas Nov/Dic)",
  "duration": "duracion (ej: 8 Dias / 7 Noches)",
  "price": "monto numerico del precio mas bajo",
  "currency": "moneda (USD/ARS/EUR)",
  "inclusions": ["lista de servicios incluidos: hotel, vuelos, etc"],
  "exclusions": ["que NO incluye"],
  "hotelNames": ["nombres de hoteles"],
  "itinerary": ["lista de ciudades o paradas en orden cronologico"],
  "highlights": ["puntos altos: excursiones clave, beneficios unicos"],
  "category": "Brasil | Caribe | Europa | Sports | USA | Salidas Grupales | Otro",
  "packages": [
    {
      "hotelName": "nombre del hotel (ej: Grand Oca)",
      "subDestination": "ciudad o zona específica (ej: Maragogi, Porto de Galinhas). SI EL NOMBRE DEL HOTEL INCLUYE LA CIUDAD, EXTRÁELA AQUÍ POR SEPARADO.",
      "boardBasis": "regimen (ej: All Inclusive, Media Pensión)",
      "prices": [{"type": "base doble", "amount": "1234", "currency": "USD", "currencyIcon": "USD"}]
    }
  ]
}
Si algún campo no está en el flyer, ponelo como null. Responde SOLO con el JSON.`;

    const raw = await this.callAI(prompt, base64, mimeType);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not extract JSON from OpenAI response");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      inclusions: parsed.inclusions || [],
      exclusions: parsed.exclusions || [],
      hotelNames: parsed.hotelNames || [],
      itinerary: parsed.itinerary || [],
      highlights: parsed.highlights || [],
      packages: parsed.packages || [],
      category: parsed.category || "Otro",
    };
  }

  async generateWhatsAppMessage(data: ExtractedFlyerData, agencyName: string, agencyPhone: string): Promise<string> {
    const prompt = `Sos un agente de viajes argentino. Genera un mensaje de difusion para WhatsApp basado en este paquete de viaje.
Datos del paquete: ${JSON.stringify(data, null, 2)}
Agencia: ${agencyName} - Tel: ${agencyPhone}

El mensaje debe:
- Empezar con un emoji llamativo
- Ser entusiasta pero profesional
- Incluir destino, fechas, duracion, precio y que incluye (maximo 5 items)
- Terminar con el CTA y datos de contacto de la agencia
- Usar emojis moderadamente (maximo 1 por linea)
- Tener maximo 30 lineas
- Estar en espanol argentino informal pero profesional

Responde SOLO con el mensaje de WhatsApp, sin explicaciones.`;

    return this.callAI(prompt);
  }

  async generateGroupDepartureContent(data: any, agencyName: string, agencyPhone: string): Promise<{ whatsapp: string }> {
    const prompt = `Sos un agente de viajes argentino. Genera un mensaje de difusion para WhatsApp para esta SALIDA GRUPAL.
Datos: ${JSON.stringify(data, null, 2)}
Agencia: ${agencyName} - Tel: ${agencyPhone}

El mensaje debe:
- Empezar con "SALIDA GRUPAL" o similar
- Mencionar que es un viaje en grupo organizado
- Incluir destino, fecha de salida, precio y que incluye
- Generar urgencia (plazas limitadas)
- Terminar con datos de contacto
- Estar en espanol argentino

Responde SOLO con el mensaje de WhatsApp.`;

    const whatsapp = await this.callAI(prompt);
    return { whatsapp };
  }

  async generateInstagramStoriesPlan(data: ExtractedFlyerData, agencyName: string, agencyPhone: string): Promise<InstagramStoriesPlan> {
    const prompt = `Analiza este flyer de viajes ya estructurado y generame una estrategia de 3 historias para Instagram en JSON puro, sin markdown ni texto extra.

Datos del flyer:
${JSON.stringify(data, null, 2)}

Agencia:
- Nombre: ${agencyName}
- Telefono: ${agencyPhone}

Formato de salida exacto:
{
  "story1": {
    "hook": "texto de maximo 15 palabras, inspirador y centrado en el deseo de viajar",
    "searchTerms": "busqueda sugerida para video de fondo en Pexels/Pixabay"
  },
  "story2": {
    "benefits": ["beneficio 1", "beneficio 2", "beneficio 3"],
    "visualSuggestion": "tipo de foto o video recomendado para esta historia"
  },
  "story3": {
    "videoPrompt": "prompt tecnico en ingles para generar un video corto comercial basado en este flyer, pensado para Instagram Story vertical 9:16",
    "overlayText": "texto corto de cierre para poner sobre el video",
    "cta": "llamado a la accion final en espanol argentino"
  }
}

Reglas:
- story1.hook: maximo 15 palabras
- story2.benefits: exactamente 3 puntos, cortos, comerciales y enfocados en comodidad / experiencia familiar
- story3.videoPrompt: en ingles, tecnico, comercial, claro, mencionando destino, precio si existe, estilo premium travel, motion suave y formato vertical 9:16
- Adaptar todo a la informacion real del flyer
- Responder SOLO con JSON valido`;

    const raw = await this.callAI(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not extract JSON for Instagram stories plan");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      story1: {
        hook: parsed?.story1?.hook || "",
        searchTerms: parsed?.story1?.searchTerms || "",
      },
      story2: {
        benefits: Array.isArray(parsed?.story2?.benefits) ? parsed.story2.benefits.slice(0, 3) : [],
        visualSuggestion: parsed?.story2?.visualSuggestion || "",
      },
      story3: {
        videoPrompt: parsed?.story3?.videoPrompt || "",
        overlayText: parsed?.story3?.overlayText || "",
        cta: parsed?.story3?.cta || "",
      },
    };
  }
}
