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

  async extractInstagramStoriesPlan(data: ExtractedFlyerData, agencyName: string, agencyPhone: string): Promise<InstagramStoriesPlan> {
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

  async extractPassportData(fileBuffer: Buffer, mimeType: string) {
    const base64 = fileBuffer.toString("base64");
    const prompt = `Analiza esta imagen o documento de Pasaporte o DNI/Cédula de identidad. Extrae todos los datos del titular en formato JSON puro, sin texto adicional y sin bloques de código markdown:
{
  "name": "Nombres completos del titular (ej: Juan Carlos)",
  "surname": "Apellidos del titular (ej: Perez Garcia)",
  "passportNumber": "Numero completo de pasaporte o DNI",
  "birthDate": "Fecha de nacimiento estrictamente en formato DD/MM/YYYY (ej: 18/03/1955)",
  "passportExpiration": "Fecha de vencimiento del documento estrictamente en formato DD/MM/YYYY (ej: 12/04/2028)",
  "nationality": "Nacionalidad o pais emisor (ej: Argentina)"
}
Si no se detecta algun campo, ponelo como null. Responde SOLO con el JSON valido.`;

    const raw = await this.callAI(prompt, base64, mimeType);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo procesar la imagen del pasaporte");
    const parsed = JSON.parse(jsonMatch[0]);

    const normalizeDateStr = (rawDate?: string | null) => {
      if (!rawDate) return '';
      let str = rawDate.trim();
      if (!str) return '';
      str = str.replace(/([a-zA-Z]+)\/([a-zA-Z]+)/gi, '$1');
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
      }
      const numMatch = str.match(/^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{2,4})$/);
      if (numMatch) {
        const d = numMatch[1].padStart(2, '0');
        const m = numMatch[2].padStart(2, '0');
        let y = numMatch[3];
        if (y.length === 2) y = parseInt(y, 10) > 45 ? `19${y}` : `20${y}`;
        return `${d}/${m}/${y}`;
      }
      const monthsMap: Record<string, string> = {
        jan: '01', ene: '01', february: '02', feb: '02', marzo: '03', mar: '03',
        abr: '04', apr: '04', may: '05', jun: '06', jul: '07', ago: '08', aug: '08',
        sep: '09', oct: '10', nov: '11', dic: '12', dec: '12'
      };
      const tokens = str.split(/[\s\.\/-]+/).filter(Boolean);
      let day = '', month = '', year = '';
      for (const t of tokens) {
        const l = t.toLowerCase();
        if (monthsMap[l]) month = monthsMap[l];
        else if (/^\d+$/.test(t)) {
          if (!day && parseInt(t, 10) <= 31) day = t.padStart(2, '0');
          else if (!year) {
            year = t;
            if (year.length === 2) year = parseInt(year, 10) > 45 ? `19${year}` : `20${year}`;
          }
        }
      }
      if (day && month && year) return `${day}/${month}/${year}`;
      return rawDate;
    };

    return {
      ...parsed,
      birthDate: normalizeDateStr(parsed.birthDate),
      passportExpiration: normalizeDateStr(parsed.passportExpiration)
    };
  }

  async extractFlightTicketData(fileBuffer: Buffer, mimeType: string) {
    const base64 = fileBuffer.toString("base64");
    const prompt = `Analiza esta imagen o captura de reserva de vuelo / e-ticket. Extrae la información aérea en formato JSON puro, sin bloques markdown:
{
  "airline": "Nombre de la aerolinea (ej: Iberia, Copa Airlines, LATAM)",
  "bookingCode": "Codigo PNR o localizador de reserva de 6 caracteres",
  "type": "ROUND_TRIP" o "ONE_WAY" o "MULTI",
  "segments": [
    {
      "id": "1",
      "from": "Codigo IATA o ciudad de origen (ej: EZE, Buenos Aires)",
      "to": "Codigo IATA o ciudad de destino (ej: MAD, Madrid)",
      "flightNumber": "Numero de vuelo si figura (ej: IB6844)",
      "departureDate": "Fecha de salida DD/MM/YYYY",
      "departureTime": "Hora de salida HH:MM",
      "arrivalDate": "Fecha de llegada DD/MM/YYYY",
      "arrivalTime": "Hora de llegada HH:MM",
      "stops": "Directo" o "1 Escala"
    }
  ],
  "baggage": {
    "hasHand": true/false,
    "handDesc": "Mochila o bolso de mano",
    "hasCarryOn": true/false,
    "carryOnDesc": "Equipaje de mano 10kg",
    "hasChecked": true/false,
    "checkedDesc": "Equipaje en bodega 23kg"
  }
}
Si algun dato no esta presente, utiliza valores por defecto razonables. Responde SOLO con el JSON valido.`;

    const raw = await this.callAI(prompt, base64, mimeType);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo extraer la reserva aérea");
    return JSON.parse(jsonMatch[0]);
  }
}
