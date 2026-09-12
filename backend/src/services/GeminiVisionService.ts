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

  private async callAI(prompt: string, imageBase64?: string, mimeType?: string, images?: Array<{ base64: string; mimeType: string }>): Promise<string> {
    if (images && images.length > 0) {
      return this.openai.generateFromMultipleImages(prompt, images);
    }

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
    return this.extractInstagramStoriesPlan(data, agencyName, agencyPhone);
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
    const prompt = `Analiza esta imagen o captura de reserva de vuelo / e-ticket / pantalla de sistema GDS (Sabre, Amadeus, KIU, Worldspan, etc.). Extrae la información aérea en formato JSON puro, sin bloques markdown:

REGLAS DE LECTURA DE SISTEMAS GDS Y TICKETES:
1. NOMBRES DE PASAJEROS: Las líneas que contienen nombres de personas (ej: "1.MAYORGA/HORACIO MARCELO MR") corresponden al PASAJERO. ¡NUNCA uses el apellido o nombre de un pasajero como ciudad de origen ("from") ni destino ("to")!
2. CÓDIGO PNR / LOCALIZADOR: Es un código alfanumérico de 6 caracteres (ejemplo: "CEWWVK"). Extraelo en "bookingCode".
3. RUTA Y TRAMOS AÉREOS:
   - En sistemas GDS o itinerarios, los tramos de IDA y VUELTA deben ser elementos SEPARADOS en la lista "segments".
   - Ejemplo: Si el vuelo de ida es EZE -> MAD (ej: AR1132) y el de vuelta es MAD -> EZE (ej: AR1135), DEBEN SER 2 OBJETOS DISTINTOS en "segments". ¡NUNCA los fusiones en uno solo!
   - "from" y "to" DEBEN SER SIEMPRE CÓDIGOS IATA DE 3 LETRAS DE AEROPUERTO (ej: EZE, MAD, ZRH, GRU, AEP) O CIUDADES. NUNCA NOMBRES DE PERSONAS.
   - Ejemplo 1: "2 UX 042 P 08OCT 4 EZEMAD HK1 1210 0510 09OCT" -> Vuelo UX042 | Fecha: 08/10/2024 | Origen: EZE | Destino: MAD | Sale: 12:10 | Llega: 05:10 (09/10/2024).
   - Ejemplo 2: "3 LX 092 W 25OCT 7*ZRHGRU HK1 2240 0640 26OCT" -> Vuelo LX092 | Fecha: 25/10/2024 | Origen: ZRH | Destino: GRU | Sale: 22:40 | Llega: 06:40 (26/10/2024).
   - Ejemplo 3: "4 LX9760 W 26OCT 1*GRUAEP HK1 0905 1200 26OCT" -> Vuelo LX9760 | Fecha: 26/10/2024 | Origen: GRU | Destino: AEP | Sale: 09:05 | Llega: 12:00 (26/10/2024).

FORMATO JSON DE SALIDA OBLIGATORIO:
{
  "airline": "Nombre o código de la aerolínea principal (ej: Aerolineas Argentinas, Air Europa, Swiss)",
  "bookingCode": "CEWWVK",
  "type": "ROUND_TRIP" o "ONE_WAY" o "MULTI",
  "segments": [
    {
      "id": "1",
      "from": "EZE",
      "to": "MAD",
      "flightNumber": "AR1132",
      "departureDate": "20/07/2026",
      "departureTime": "23:55",
      "arrivalDate": "21/07/2026",
      "arrivalTime": "17:10",
      "stops": "Directo"
    },
    {
      "id": "2",
      "from": "MAD",
      "to": "EZE",
      "flightNumber": "AR1135",
      "departureDate": "05/08/2026",
      "departureTime": "10:55",
      "arrivalDate": "05/08/2026",
      "arrivalTime": "19:00",
      "stops": "Directo"
    }
  ],
  "baggage": {
    "hasHand": true,
    "handDesc": "Mochila",
    "hasCarryOn": true,
    "carryOnDesc": "Equipaje de mano 10kg",
    "hasChecked": true,
    "checkedDesc": "Equipaje en bodega 23kg"
  }
}

REGLAS ESTRUCTURALES:
- Fechas en formato DD/MM/YYYY. Horas en formato HH:MM.
- "from" y "to" deben tener 3 letras IATA (ej: EZE, MAD, ZRH, GRU, AEP) y NUNCA nombres de pasajeros.
- Cada tramo o vuelo individual (salida/regreso) debe ser un elemento separado en "segments".
- Responde ÚNICAMENTE con el JSON válido.`;

    const raw = await this.callAI(prompt, base64, mimeType);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo extraer la reserva aérea");

    const parsed = JSON.parse(jsonMatch[0]);
    if (Array.isArray(parsed.segments) && parsed.segments.length > 1) {
      parsed.segments = mergeConnectingSegments(parsed.segments);
    }

    if (Array.isArray(parsed.segments)) {
      if (parsed.segments.length === 1) {
        parsed.type = parsed.type || "ONE_WAY";
      } else if (parsed.segments.length === 2) {
        const s1 = parsed.segments[0];
        const s2 = parsed.segments[1];
        if (s1.from && s1.to && s2.from && s2.to && 
            s1.from.toUpperCase().trim() === s2.to.toUpperCase().trim() && 
            s1.to.toUpperCase().trim() === s2.from.toUpperCase().trim()) {
          parsed.type = "ROUND_TRIP";
        } else {
          parsed.type = "MULTI";
        }
      } else {
        parsed.type = "MULTI";
      }
    }

    return parsed;
  }

  async extractServiceVoucherData(fileBuffer: Buffer, mimeType: string) {
    const base64 = fileBuffer.toString("base64");
    const prompt = `Analiza esta imagen o captura de pantalla de voucher, confirmación de reserva, liquidación de mayorista, detalle de compra o pantalla de sistema de viajes (Traslado, Hotel, Tren, Excursión, Asistencia Médica, etc.). Extrae la información en formato JSON puro, sin bloques markdown:

FORMATO JSON DE SALIDA OBLIGATORIO:
{
  "serviceType": "transfer" | "hotel" | "train" | "flight" | "assistance" | "service",
  "origin": "Punto de salida u origen exacto (ej: Malaga-Maria Zambrano, Barajas, Madrid)",
  "destination": "Punto de llegada o destino exacto (ej: Madrid-Puerta De Atocha, Petit Palace Preciados)",
  "date": "Fecha del servicio en formato DD/MM/YYYY (ej: 03/08/2026)",
  "departureDate": "Fecha de salida DD/MM/YYYY (ej: 03/08/2026)",
  "checkIn": "Fecha check-in DD/MM/YYYY",
  "checkOut": "Fecha check-out DD/MM/YYYY",
  "time": "Hora del servicio o pickup en formato HH:MM (ej: 12:50)",
  "departureTime": "Hora de salida en formato HH:MM (ej: 12:50)",
  "arrivalTime": "Hora de llegada en formato HH:MM (ej: 15:49)",
  "confirmationNumber": "Número de localizador o código de confirmación/ticket (ej: 3075761, REN-7749)",
  "bookingCode": "Código de reserva, PNR o localizador (ej: REN-7749)",
  "trainOperator": "Compañía u operador de tren (ej: Renfe, Eurostar, Iryo, Ouigo)",
  "trainNumber": "Número de tren (ej: ave - 2133, AVE 0314)",
  "classType": "Clase o información de asiento (ej: Preferente, Reserva de asiento incluida)",
  "flightNumber": "Número de vuelo o tren de llegada/conexión si figura (ej: AR1132, 1132 - Aerolineas Argentinas)",
  "providerName": "Nombre del proveedor, compañía o vendedor si figura (ej: Eurovips, Renfe, Juliá)",
  "assistanceCompany": "Compañía de asistencia médica (ej: Assist Card, Universal Assistance, Coris, Pax Assistance)",
  "productName": "Nombre del producto o plan de asistencia (ej: AC 100, Master, AC 60)",
  "coverageAmount": "Monto o límite de cobertura médica (ej: USD 100.000, EUR 30.000)",
  "planType": "Modo o tipo de plan: 'Daily' (si la vigencia es por días/viaje) o 'Anual' (si la vigencia es de 365 días/1 año completo)",
  "startDate": "Fecha de inicio de vigencia DD/MM/YYYY (ej: 20/07/2026)",
  "endDate": "Fecha de fin de vigencia DD/MM/YYYY (ej: 05/08/2026)",
  "documentNumber": "Número de documento de viaje, DNI o Pasaporte del asegurado (ej: 53583426)",
  "price": 694.77,
  "baseNetCost": 606.32,
  "commissionValue": 88.46,
  "currency": "EUR" | "USD" | "ARS",
  "description": "Cualquier nota adicional relevante (ej: Tarifas de reserva - Precio al pasajero: USD 694,77)"
}

REGLAS STRICTAS:
- Extrae con la mayor exactitud posible los nombres de lugares, fechas, horas y códigos de confirmación.
- Si la imagen contiene un desglose de liquidación / tarifa de reserva de mayorista:
  * "price": Extrae 'Precio de venta al pasajero' o 'Precio de venta reserva' (ej: 694.77).
  * "baseNetCost": Extrae 'Neto a pagar de agencia' (ej: 606.32).
  * "commissionValue": Extrae 'Comisión' (ej: 88.46).
- Si no está presente algún campo, usa null.
- Responde ÚNICAMENTE con el JSON válido.`;

    const raw = await this.callAI(prompt, base64, mimeType);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo extraer la información del comprobante");

    return JSON.parse(jsonMatch[0]);
  }

  async extractPaymentReceiptData(fileBuffer: Buffer, mimeType: string) {
    const base64 = fileBuffer.toString("base64");
    const prompt = `Analiza esta imagen o captura de comprobante de transferencia bancaria, pago de Mercado Pago, recibo de depósito o voucher financiero (ej: Banco Galicia, Santander, BBVA, Banco Nación, Mercado Pago, etc.). Extrae la información en formato JSON puro, sin bloques markdown:

FORMATO JSON DE SALIDA OBLIGATORIO:
{
  "amount": 715.92,
  "currency": "USD" | "ARS" | "EUR",
  "date": "12/08/2026",
  "reference": "42634317510",
  "method": "transfer" | "cash" | "card" | "mercadopago",
  "recipientName": "Action Travel Sa",
  "senderName": "MARIA MANUELA CASTRO ARELLANO",
  "bankOrEntity": "Banco Galicia / Santander",
  "concept": "Varios"
}

REGLAS STRICTAS DE EXTRACCIÓN:
1. "amount": Extrae el monto numérico exacto pagado o transferido como float (ej: 715.92 para USD 715,92 o 715.00). Si dice "USD 715.92", "amount" es 715.92 y "currency" es "USD". Si es "$" o "ARS", "currency" es "ARS".
2. "date": Extrae la fecha de la operación en formato DD/MM/YYYY (ej: 12/08/2026).
3. "reference": Extrae el número de comprobante, transacción, N° de operación, ID de transferencia o referencia bancaria (ej: 42634317510, OP-8812).
4. "method": Usa 'transfer' si es transferencia bancaria/CBU/CVU, 'mercadopago' si es Mercado Pago, 'card' si es tarjeta, o 'cash' si es efectivo.
5. "recipientName": Nombre de la persona o empresa receptora / Para / Destinatario (ej: Action Travel Sa).
6. "senderName": Nombre de la persona emisor / De / Remitente (ej: MARIA MANUELA CASTRO ARELLANO).
7. "bankOrEntity": Banco o entidad desde/hacia donde se envió (ej: Banco Galicia, Santander).
8. Si algún campo no se detecta, ponelo como null.
9. Responde ÚNICAMENTE con el JSON válido.`;

    const raw = await this.callAI(prompt, base64, mimeType);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo extraer la información del comprobante de pago");

    return JSON.parse(jsonMatch[0]);
  }

  async parseExpressQuote(images: Array<{ base64: string; mimeType: string }>, userPrompt: string, agencyName: string = "Concepto Evt"): Promise<{
    whatsappText: string;
    quoteData: any;
  }> {
    const prompt = `Sos un agente de viajes experto de la agencia "${agencyName}". 
Se te han adjuntado ${images.length} capturas de pantalla con vuelos, itinerarios, opciones de pasajes, liquidaciones o tarifarios de reserva de mayorista/operador.
El usuario ha dado las siguientes INSTRUCCIONES ESPECÍFICAS DE PRECIO Y CONTENIDO:
"${userPrompt || 'Cotizar el viaje/servicio detectado respetando la tarifa capturada o con el margen correspondiente.'}"

REGLAS CRÍTICAS DE MULTI-IMAGEN, TARIFARIOS Y LIQUIDACIONES:
1. DEBES LEER Y ANALIZAR CADA UNA DE LAS ${images.length} IMÁGENES ADJUNTAS.
2. LECTURA DE LIQUIDACIONES Y DESGLOSES DE TARIFAS DE RESERVA (Mayoristas / Operadores como Eurovips, Juliá, Ola, Tucano, Almundo, Logan, etc.):
   - Si la captura muestra un desglose de "Tarifas de reserva", "Detalle de compra" o "Liquidación":
     * "Neto a pagar de agencia" → Corresponde al Costo Neto Base ("baseNetCost").
     * "Precio de venta al pasajero" o "Precio de venta reserva" → Corresponde al Precio Final de Venta al cliente ("price" / "soldPriceCollected").
     * "Comisión" → Corresponde a la Ganancia o Comisión de la Agencia ("commissionValue").
     * "Gastos adm." e "IVA" → Corresponden a gastos/ajustes administrativos ("adjustments").
     * "Moneda" → Detectar si es USD, ARS o EUR.
3. Si la captura es un vuelo u hotel regular:
   - Extraer aerolínea, tramos IATA, fechas, horarios y equipaje.
4. REGLA DE ORO DE PRECIOS POR PASAJERO Y TOTAL:
   - NUNCA muestres desgloses de costos netos, comisiones, márgenes ni fees por separado en "whatsappText". El cliente solo ve el PRECIO FINAL CON TODO INCLUIDO.
   - REGLA ESPECÍFICA PARA PRECIO POR PASAJERO: SIEMPRE QUE SE COTICE PARA 2 O MÁS PASAJEROS O APAREZCA LA TARIFA UNITARIA EN LA CAPTURA, DEBES MOSTRAR CLARAMENTE EL "PRECIO POR PASAJERO" Y EL "PRECIO TOTAL FINAL DEL GRUPO".
   - Ejemplo de formato de precios en WhatsApp:
     * Si son 2 o más pasajeros (ej: 2 adultos):
       💵 *PRECIO POR PASAJERO:* ARS 229.426 (o el valor final unitario)
       💳 *PRECIO TOTAL GRUPO (2 pax):* ARS 458.852
     * Si es 1 solo pasajero:
       💵 *PRECIO POR PASAJERO:* ARS 262.840
   - DUALIDAD GASTOS ADMINISTRATIVOS VS GANANCIA AGENCIA:
     * Si el usuario pide sumar "1.5% de gastos" o "gastos bancarios", esto corresponde a GASTOS ADMINISTRATIVOS ("adjustments" con impact: "cost"). No lo cuentes como ganancia limpia.
     * Si el usuario pide sumar "15.000 de ganancia" o "fee de agencia", esto corresponde a la GANANCIA LIMPIA DE AGENCIA ("commissionValue").
     * En WhatsApp, AMBOS se suman en el precio final cobrado al cliente. En "quoteData" (operativo interno), sepáralos correctamente en "adjustments" y "commissionValue".
5. En "quoteData" (lado operativo de la agencia), guarda los items detectados con su "baseNetCost", "adjustments", "commissionValue", "price", "passengerCount" y datos de aerolínea/segmentos.

FORMATO EJEMPLO DE SALIDA PARA whatsappText CON MÚLTIPLES OPCIONES Y PRECIO POR PAX:
*¡HOLA! AQUÍ TENÉS TU COTIZACIÓN* ✈️

*OPCIÓN 1: Aerolíneas Argentinas*
• *Aerolínea:* Aerolíneas Argentinas
• *Ruta:* Buenos Aires (AEP) ⇄ Salta (SLA)
• *Tramos:*
  - Ida: 12:50 AEP → 15:05 SLA | Directo
  - Vuelta: 18:50 SLA → 20:55 EZE | Directo
• *Equipaje:* Incluye equipaje de mano y bolso personal

💵 *PRECIO POR PASAJERO:* ARS 229.426
💳 *PRECIO TOTAL FINAL (2 pax):* ARS 458.852

----------------------------------

*OPCIÓN 2: JetSMART*
• *Aerolínea:* JetSMART
• *Ruta:* Buenos Aires (AEP) ⇄ Salta (SLA)
• *Tramos:*
  - Ida: 14:00 AEP → 16:14 SLA | Directo
  - Vuelta: 21:25 SLA → 23:30 EZE | Directo
• *Equipaje:* Tarifa Básica (Mochila)

💵 *PRECIO POR PASAJERO:* ARS 132.859
💳 *PRECIO TOTAL FINAL (2 pax):* ARS 265.718

⏳ *Vigencia:* sujeto a disponibilidad y cambio de tarifa al momento de reservar.

¿Te gustaría confirmar alguna de las opciones o tenés alguna duda? 📱

FORMATO JSON DE SALIDA EXIGIDO (JSON puro sin markdown extra):
{
  "whatsappText": "*¡HOLA! AQUÍ TENÉS TU COTIZACIÓN...*",
  "quoteData": {
    "title": "Cotización Exprés - [Destino Principal]",
    "destination": "[Destino / País Principal]",
    "currency": "ARS",
    "notes": "[Notas adicionales]",
    "totalNetCostSnapshot": 220000,
    "soldPriceCollected": 262840,
    "items": [
      {
        "id": "item-1",
        "type": "flight",
        "details": {
          "airline": "Aerolíneas Argentinas",
          "bookingCode": "",
          "type": "ROUND_TRIP",
          "segments": [
            {
              "id": "seg-1",
              "from": "AEP",
              "to": "SLA",
              "departureDate": "15/10/2026",
              "departureTime": "12:50",
              "arrivalDate": "15/10/2026",
              "arrivalTime": "15:05",
              "stops": "Directo"
            }
          ]
        },
        "economics": {
          "baseNetCost": 220000,
          "adjustments": [],
          "pricingModel": "total",
          "passengerCount": 1,
          "commissionType": "fixed",
          "commissionValue": 42840
        },
        "price": 262840
      }
    ]
  }
}

Responde ÚNICAMENTE con el JSON válido.`;

    // Process ALL images together in a single multi-image Vision call
    const raw = await this.callAI(prompt, undefined, undefined, images);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo procesar la cotización exprés con la IA");

    const parsed = JSON.parse(jsonMatch[0]);

    // Ensure IDs on items
    if (parsed.quoteData && Array.isArray(parsed.quoteData.items)) {
      parsed.quoteData.items = parsed.quoteData.items.map((item: any, idx: number) => ({
        ...item,
        id: item.id || `item-express-${Date.now()}-${idx}`
      }));
    }

    return parsed;
  }
}

function parseDateToTimestamp(dateStr?: string, timeStr?: string): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const cleanDate = dateStr.trim();
  if (!cleanDate) return null;

  let year = 0, month = 0, day = 0;

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = cleanDate.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})$/);
  if (dmyMatch) {
    day = parseInt(dmyMatch[1], 10);
    month = parseInt(dmyMatch[2], 10) - 1;
    let yStr = dmyMatch[3];
    if (yStr.length === 2) yStr = `20${yStr}`;
    year = parseInt(yStr, 10);
  } else {
    // YYYY-MM-DD
    const ymdMatch = cleanDate.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
    if (ymdMatch) {
      year = parseInt(ymdMatch[1], 10);
      month = parseInt(ymdMatch[2], 10) - 1;
      day = parseInt(ymdMatch[3], 10);
    }
  }

  if (!year || month < 0 || month > 11 || day < 1 || day > 31) {
    return null;
  }

  let hours = 12, minutes = 0;
  if (timeStr && typeof timeStr === 'string') {
    const timeMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }
  }

  return Date.UTC(year, month, day, hours, minutes);
}

function mergeConnectingSegments(segments: any[]): any[] {
  if (!Array.isArray(segments) || segments.length <= 1) return segments;

  const result: any[] = [];
  let i = 0;

  while (i < segments.length) {
    let current = { ...segments[i] };
    let stopsCount = 0;
    const flightNumbers: string[] = [];
    const layoverNotes: string[] = [];
    const initialFrom = String(current.from || "").toUpperCase().trim();

    if (current.flightNumber) flightNumbers.push(String(current.flightNumber).trim());

    while (i + 1 < segments.length) {
      const next = segments[i + 1];
      const currentDest = String(current.to || "").toUpperCase().trim();
      const nextOrigin = String(next.from || "").toUpperCase().trim();
      const nextDest = String(next.to || "").toUpperCase().trim();

      // Check if candidate for connection
      if (currentDest && nextOrigin && currentDest === nextOrigin) {
        // REGLA 1: Nunca fusionar si el vuelo de regreso vuelve al origen inicial (Ida y vuelta)
        if (nextDest && initialFrom && nextDest === initialFrom) {
          break;
        }

        // REGLA 2: Verificar tiempo entre la llegada (o salida) del vuelo actual y la salida del siguiente
        const currentEndTs = parseDateToTimestamp(current.arrivalDate || current.departureDate, current.arrivalTime || current.departureTime);
        const nextStartTs = parseDateToTimestamp(next.departureDate, next.departureTime);

        if (currentEndTs !== null && nextStartTs !== null) {
          const diffHours = (nextStartTs - currentEndTs) / (1000 * 60 * 60);
          // Si el intervalo de tiempo entre vuelos es < 0 o > 30 horas, NO es una escala/conexión sino tramos separados
          if (diffHours < 0 || diffHours > 30) {
            break;
          }
        }

        stopsCount++;
        const arrTime = current.arrivalTime ? ` (Llegada ${current.arrivalTime}` : '';
        const depTime = next.departureTime ? ` - Sale ${next.departureTime})` : (arrTime ? ')' : '');
        layoverNotes.push(`Conexión en ${currentDest}${arrTime}${depTime}`);

        if (next.flightNumber && !flightNumbers.includes(String(next.flightNumber).trim())) {
          flightNumbers.push(String(next.flightNumber).trim());
        }
        current.to = next.to;
        if (next.arrivalDate) current.arrivalDate = next.arrivalDate;
        if (next.arrivalTime) current.arrivalTime = next.arrivalTime;
        i++;
      } else {
        break;
      }
    }

    if (stopsCount > 0) {
      current.stops = stopsCount === 1 ? "1 Escala" : `${stopsCount} Escalas`;
      current.layoverDetails = `${layoverNotes.join(' | ')} | Vuelos: ${flightNumbers.join(' + ')}`;
    } else if (!current.stops) {
      current.stops = "Directo";
    }

    current.flightNumber = flightNumbers.join(" / ");
    result.push(current);
    i++;
  }

  return result.map((seg, idx) => ({ ...seg, id: String(idx + 1) }));
}
