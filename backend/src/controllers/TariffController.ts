import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Circuit } from "../entities/Circuit";
import { WebPackage } from "../entities/WebPackage";
import { GeminiVisionService } from "../services/GeminiVisionService";
import { FlyerGeneratorService } from "../services/FlyerGeneratorService";
import { OpenAIService } from "../services/OpenAIService";
import { HotelSearchService } from "../services/HotelSearchService";
import { TouristAttractionService } from "../services/TouristAttractionService";
import { DestinationAsset } from "../entities/DestinationAsset";
import { AgencySettings } from "../entities/AgencySettings";

const openai = new OpenAIService();
const hotelSvc = new HotelSearchService();
const attractionSvc = new TouristAttractionService();

const normalizeText = (value?: string | null) =>
  (value || "").toLowerCase().trim().replace(/\s+/g, " ");

const buildSuggestedItemImages = (hotelNames: string[] = [], assets: DestinationAsset[] = []) => {
  const mapping: Record<string, string> = {};

  for (const hotelName of hotelNames) {
    if (!hotelName) continue;
    const normalizedHotel = normalizeText(hotelName);
    const matched = assets.find((asset) => {
      const assetHotel = normalizeText(asset.hotelName);
      return assetHotel && (
        assetHotel === normalizedHotel ||
        assetHotel.includes(normalizedHotel) ||
        normalizedHotel.includes(assetHotel)
      );
    });

    if (matched?.imageUrl) {
      mapping[hotelName] = matched.imageUrl;
    }
  }

  return mapping;
};

export class TariffController {
  private static async getSettings() {
    try {
      const repo = AppDataSource.getRepository(AgencySettings);
      return await repo.findOne({ where: { id: 1 } });
    } catch (e) {
      return null;
    }
  }

  static async uploadTariff(req: Request, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const { buffer, mimetype, originalname } = req.file;
      console.log("TariffController - processing:", originalname);

      const base64 = buffer.toString("base64");

      const prompt = `Actúas como un experto en extracción de datos y estructuración de catálogos turísticos (ETL especializado en viajes).
Tu tarea es analizar el documento adjunto y extraer CADA UNO de los circuitos/paquetes sin omitir ninguno.
La salida debe ser estrictamente un objeto JSON con la clave "circuits" que contenga la lista de circuitos.

ESQUEMA DE DATOS (JSON) POR CIRCUITO:
{
  "codigo_circuito": "Código alfanumérico si existe, si no null",
  "nombre": "Nombre completo del tour",
  "duracion": {
    "dias": 0,
    "noches": 0
  },
  "paises_visitados": ["País 1", "País 2"],
  "ciudades_itinerario": ["Ciudad A", "Ciudad B"],
  "fechas_operacion_exactas": ["12 May 2025", "19 May 2025"], 
  "precio_base_eur": 0,
  "itinerario_resumido": [
    {"dia": 1, "descripcion": "..."},
    {"dia": 2, "descripcion": "..."}
  ],
  "incluye": ["Servicio 1", "Servicio 2"],
  "hoteles_previstos": ["Hotel A", "Hotel B"],
  "categoria": "Escribe PAQUETE, SALIDA GRUPAL o CIRCUITO"
}

REGLAS CRÍTICAS:
1. NO inventes información. Si un dato no está pon null.
2. PRECIOS: Extrae siempre el precio "Desde" numérico, ponlo en precio_base_eur.
3. FECHAS: Busca fechas EXACTAS de inicio de salida si existen (e.g. 19 de Mayo), si son salidas regulares pon los meses de operación. Usa "fechas_operacion_exactas".
4. CATEGORÍA: Deduce según el contenido y asigna obligatoriamente el valor "PAQUETE" (suele incluir vuelos fijos), "SALIDA GRUPAL" (fechas grupales muy cerradas) o "CIRCUITO" (tour terrestre regular).
5. Extrae TODOS los viajes/paquetes.
6. Devuelve ÚNICAMENTE el JSON puro con la clave "circuits": [{...}]. Sin saludos.`;

      let rawText = "";
      try {
        rawText = await openai.generateFromImage(prompt, base64, mimetype);
      } catch (e: any) {
        console.warn("Tariff extraction error:", e.response?.data || e.message);
        return res.status(500).json({ message: "AI extraction failed: " + (e.response?.data?.error?.message || e.message) });
      }

      // Parse circuits from response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return res.status(422).json({ message: "Could not parse tariff data" });

      const parsed = JSON.parse(jsonMatch[0]);
      const circuits = parsed.circuits || [];

      const repo = AppDataSource.getRepository(Circuit);
      const customOperator = req.body.operator;
      const operatorName = customOperator || (originalname ? originalname.split('.')[0] : "Unknown Operator");

      // Anti-duplication: Delete previous circuits that were generated from this exact same file + operator
      if (originalname) {
        await repo.delete({ sourceFile: originalname, operator: operatorName });
      }

      const saved: Circuit[] = [];

      for (const c of circuits) {
        let circuit: Circuit | null = null;
        
        // Try to find existing circuit to update
        if (c.codigo_circuito) {
          circuit = await repo.findOneBy({ codigo_circuito: c.codigo_circuito });
        }
        if (!circuit && c.nombre) {
          circuit = await repo.findOneBy({ nombre: c.nombre, operator: operatorName });
        }

        if (!circuit) {
          circuit = repo.create();
        }

        // Enforce Arrays
        const paisesArr = Array.isArray(c.paises_visitados) ? c.paises_visitados : (c.paises_visitados ? [c.paises_visitados] : []);
        const ciudadesArr = Array.isArray(c.ciudades_itinerario) ? c.ciudades_itinerario : (c.ciudades_itinerario ? [c.ciudades_itinerario] : []);
        const mesesArr = Array.isArray(c.fechas_operacion_exactas) ? c.fechas_operacion_exactas : (c.fechas_operacion_exactas ? [c.fechas_operacion_exactas] : []);
        const incluyeArr = Array.isArray(c.incluye) ? c.incluye : (c.incluye ? [c.incluye] : []);
        const hotelesArr = Array.isArray(c.hoteles_previstos) ? c.hoteles_previstos : (c.hoteles_previstos ? [c.hoteles_previstos] : []);

        // Update fields
        circuit.codigo_circuito = c.codigo_circuito || circuit.codigo_circuito;
        circuit.nombre = c.nombre || circuit.nombre;
        circuit.duracion = c.duracion || circuit.duracion;
        circuit.paises_visitados = paisesArr.length > 0 ? paisesArr : circuit.paises_visitados;
        circuit.ciudades_itinerario = ciudadesArr.length > 0 ? ciudadesArr : circuit.ciudades_itinerario;
        circuit.meses_operacion = mesesArr.length > 0 ? mesesArr : circuit.meses_operacion;
        
        // Manual override for category
        const selectedCategory = req.body.categoria;
        circuit.categoria = (selectedCategory && selectedCategory !== 'AUTO') ? selectedCategory : (c.categoria || "CIRCUITO");
        
        // Parse numeric price safely
        let pBase = typeof c.precio_base_eur === 'number' ? c.precio_base_eur : parseFloat(c.precio_base_eur);
        circuit.precio_base_eur = isNaN(pBase) ? circuit.precio_base_eur : pBase;
        
        circuit.itinerario_resumido = c.itinerario_resumido || circuit.itinerario_resumido;
        circuit.hoteles_previstos = hotelesArr.length > 0 ? hotelesArr : circuit.hoteles_previstos;

        // Legacy mappings to keep the frontend running temporarily
        circuit.operator = operatorName;
        circuit.destination = paisesArr.length ? paisesArr.join(', ') : (ciudadesArr.length ? ciudadesArr.join(', ') : "Varios");
        circuit.title = c.nombre;
        circuit.duration = c.duracion ? `${c.duracion.dias || 0} D / ${c.duracion.noches || 0} N` : "";
        circuit.price = !isNaN(pBase) ? String(pBase) : "";
        circuit.currency = "EUR"; // Requested schema uses EUR
        circuit.dates = mesesArr.length ? mesesArr.join(', ') : "";
        circuit.inclusions = incluyeArr;
        circuit.exclusions = [];
        circuit.rawText = JSON.stringify(c);
        circuit.sourceFile = originalname;

        saved.push(await repo.save(circuit));
      }

      console.log(`TariffController - saved/updated ${saved.length} circuits`);
      return res.json({ count: saved.length, circuits: saved });
    } catch (error: any) {
      console.error("TariffController error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async aiSearch(req: Request, res: Response) {
    try {
      const { quote } = req.body;
      if (!quote) return res.status(400).json({ message: "Quote is required" });

      const repo = AppDataSource.getRepository(Circuit);
      // Fetch up to 200 circuits to avoid blowing up the context window completely
      // You could optimize this to semantic vector search later, but Gemini 2.0 has 1M-2M context window.
      const allCircuits = await repo.find({ take: 200, order: { createdAt: "DESC" } });

      const prompt = `Eres un agente de viajes experto y sofisticado. Tienes acceso a esta base de datos de paquetes turísticos:
${JSON.stringify(allCircuits.map(c => ({
  id: c.id, operator: c.operator, titulo: c.title, destino: c.destination, duracion: c.duration, precio: c.price,
  moneda: c.currency, meses: c.dates, incluye: c.inclusions, hoteles: c.hoteles_previstos
}))) }

REQUERIMIENTO DEL PASAJERO:
"${quote}"

Tu tarea es analizar la base de datos de paquetes y buscar los 3 mejores circuitos que coincidan con la necesidad del pasajero (por destino, presupuesto si lo dió, duración, fechas, etc).
Devuelve un JSON estrictamente con la siguiente estructura, evaluando y justificando tu respuesta:
{
  "matches": [
    {
      "circuitId": "el uuid exacto del paquete de la BD",
      "score": 95, // porcentaje de compatibilidad de 1 a 100
      "justificacion": "Por qué este paquete cumple con la cotización del pasajero de manera concisa."
    }
  ]
}
No devuelvas texto fuera del JSON.`;

      const rawText = await openai.generateText(prompt);
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) return res.status(500).json({ message: "AI response parse failed" });
      const parsedMatches = JSON.parse(jsonMatch[0]).matches || [];

      // Hydrate matches with Circuit records
      const fullMatches = parsedMatches.map((match: any) => {
        const c = allCircuits.find(circ => circ.id === match.circuitId);
        return {
          ...match,
          circuit: c
        };
      }).filter((m: any) => m.circuit);

      return res.json(fullMatches);
    } catch (e: any) {
      console.error("aiSearch error:", e.message);
      return res.status(500).json({ message: "AI search failed" });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { destination, operator, maxPrice, categoria } = req.query as Record<string, string>;
      const repo = AppDataSource.getRepository(Circuit);
      
      let query = repo.createQueryBuilder("circuit");
      
      if (destination) {
        query = query.where(
          "LOWER(circuit.destination) LIKE LOWER(:dest) OR LOWER(circuit.title) LIKE LOWER(:dest)",
          { dest: `%${destination}%` }
        );
      }
      if (operator) {
        query = query.andWhere("LOWER(circuit.operator) LIKE LOWER(:op)", { op: `%${operator}%` });
      }
      if (maxPrice) {
        query = query.andWhere("circuit.precio_base_eur <= :max", { max: parseFloat(maxPrice) });
      }
      if (categoria) {
        query = query.andWhere("circuit.categoria = :cat", { cat: categoria });
      }

      const circuits = await query.orderBy("circuit.createdAt", "DESC").take(500).getMany();
      return res.json(circuits);
    } catch (e) {
      return res.status(500).json({ message: "Search failed" });
    }
  }

  static async listAll(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Circuit);
      const all = await repo.find({ order: { createdAt: "DESC" }, take: 100 });
      return res.json(all);
    } catch (e) {
      return res.json([]);
    }
  }

  static async resetDatabase(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Circuit);
      await repo.clear();
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ message: "Reset failed" });
    }
  }

  static async generateDiffusion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Circuit);
      const circuit = await repo.findOneBy({ id });
      
      if (!circuit) {
        return res.status(404).json({ message: "Circuit not found" });
      }

      const force = req.query.force === 'true';

      let whatsapp = circuit.whatsappMessage;
      let flyerData = circuit.flyerData;
      let generatedNew = false;

      const geminiVision = new GeminiVisionService();
      const flyerGen = new FlyerGeneratorService();
      const settings = await TariffController.getSettings();
      const hotelNames = Array.isArray(circuit.hoteles_previstos) ? circuit.hoteles_previstos.filter(Boolean) : [];
      let hotels: any[] = [];

      if (hotelNames.length > 0) {
        const queries = hotelNames.slice(0, 4).map((hotelName: string) =>
          hotelSvc.searchHotels({
            destination: `${hotelName}, ${circuit.destination || ""}`,
            accommodationType: "hotel",
            hotelCategory: "",
            count: 1,
            includeReviews: true,
          })
        );

        const results = await Promise.allSettled(queries);
        hotels = results.flatMap((result) =>
          result.status === "fulfilled" && result.value?.[0] ? [result.value[0]] : []
        );
      }

      let heroImages: string[] = [];
      let suggestedItemImages: Record<string, string> = {};
      if (circuit.destination) {
        try {
          const assetRepo = AppDataSource.getRepository(DestinationAsset);
          const assets = await assetRepo.find({
            where: { destination: circuit.destination.toLowerCase().trim() },
            order: { createdAt: "DESC" },
          });
          heroImages = assets.filter(asset => !asset.hotelName).slice(0, 3).map(asset => asset.imageUrl);
          suggestedItemImages = buildSuggestedItemImages(hotelNames, assets);
        } catch (e) {}
      }

      const attractions = circuit.destination
        ? await attractionSvc.searchAttractions(circuit.destination, 6)
        : [];

      if (heroImages.length === 0) {
        heroImages = attractions
          .filter((place: any) => place.photoUrl)
          .slice(0, 3)
          .map((place: any) => place.photoUrl as string);
      }

      if (!whatsapp || !flyerData || force) {
        const packages = hotelNames.map((hotelName: string) => {
          const matchingHotel = hotels.find((hotel: any) => {
            const hotelResultName = normalizeText(hotel.name);
            const requestedName = normalizeText(hotelName);
            return hotelResultName.includes(requestedName) || requestedName.includes(hotelResultName);
          });

          return {
            hotelName,
            boardBasis: "",
            prices: circuit.price ? [{
              type: "base",
              amount: String(circuit.price),
              currency: circuit.currency || "EUR",
              currencyIcon: circuit.currency || "EUR",
            }] : [],
            showInFlyer: true,
            rating: matchingHotel?.rating,
            numReviews: matchingHotel?.numReviews,
            googlePhoto: matchingHotel?.photoUrl,
            mapsUrl: matchingHotel?.mapsUrl,
            reviewSummary: matchingHotel?.reviewSummary,
            reviews: matchingHotel?.reviews || [],
          };
        });

        // Transform circuit data to expected format for WhatsApp prompt
        const dataForWa = {
          operator: circuit.operator || "Operador",
          destination: circuit.destination || "Destino",
          title: circuit.title || circuit.nombre,
          departureDate: circuit.dates,
          price: circuit.price,
          currency: circuit.currency,
          inclusions: Array.isArray(circuit.inclusions) ? circuit.inclusions.join(', ') : circuit.inclusions,
        };

        const resWa = await geminiVision.generateGroupDepartureContent(
          dataForWa,
          settings?.name || process.env.AGENCY_NAME || "Concepto Evt",
          settings?.phone || process.env.AGENCY_PHONE || ""
        );
        whatsapp = resWa.whatsapp;

        // Transform for Flyer
        flyerData = {
          operator: circuit.operator,
          destination: circuit.destination,
          title: circuit.title,
          duration: circuit.duration,
          dates: circuit.dates,
          price: circuit.price,
          currency: circuit.currency,
          inclusions: circuit.inclusions,
          itinerary: circuit.ciudades_itinerario || [],
          highlights: circuit.highlights || [],
          hotelNames,
          packages,
          category: circuit.categoria || "Otro",
        };

        circuit.whatsappMessage = whatsapp;
        circuit.flyerData = flyerData;
        await repo.save(circuit);
        generatedNew = true;
      }

      const flyerHtml = await flyerGen.generateFlyerHtml(flyerData, {
        heroImages,
        itemImages: suggestedItemImages,
        attractions,
        agencySettings: settings,
      });

      return res.json({
        whatsapp,
        flyerHtml,
        flyerData,
        hotels,
        attractions,
        suggestedImages: heroImages,
        suggestedItemImages,
      });
    } catch (e: any) {
      console.error("TariffController.generateDiffusion error:", e);
      return res.status(500).json({ message: "Failed to generate diffusion: " + e.message });
    }
  }

  static async deleteCircuit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Circuit);
      await repo.delete(id);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ message: "Delete failed" });
    }
  }

  static async publishCircuit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isPublished, webCategory } = req.body;
      const repo = AppDataSource.getRepository(Circuit);
      const circuit = await repo.findOneBy({ id: id as any });
      
      if (!circuit) return res.status(404).json({ message: "Circuit not found" });
      
      circuit.isPublished = isPublished;
      if (webCategory) circuit.webCategory = webCategory;
      
      await repo.save(circuit);

      // --- Sync to WebPackage ---
      const wpRepo = AppDataSource.getRepository(WebPackage);
      if (isPublished) {
        let wp = await wpRepo.findOneBy({ sourceId: circuit.id });
        if (!wp) wp = await wpRepo.findOneBy({ title: circuit.title || circuit.nombre });
        if (!wp) wp = wpRepo.create({ sourceId: circuit.id });
        
        wp.sourceId = circuit.id;
        Object.assign(wp, {
          title: circuit.title || circuit.nombre || "Sin Título",
          description: wp.description || `Paquete ${circuit.destination}. Incluye: ${circuit.inclusions?.join(', ') || 'Consultar'}.`,
          price: circuit.precio_base_eur || (circuit.price ? parseFloat(circuit.price) : 0),
          currency: circuit.currency || "EUR",
          duration: circuit.duration || (circuit.duracion ? `${circuit.duracion.dias} Días` : ""),
          location: circuit.destination,
          webCategory: webCategory || circuit.webCategory || "EUROPA",
          imageUrl: circuit.imageUrl,
          included: circuit.inclusions,
          highlights: circuit.highlights,
          itinerary: circuit.itinerario_resumido?.map(i => ({ day: i.dia, title: `Día ${i.dia}`, activities: [i.descripcion] })) || [],
          isPublished: true
        });
        await wpRepo.save(wp);
      } else {
        // If unpublished, we could optionally unpublish or delete from WebPackage, 
        // but usually we want to keep it in Vidriera CRM for manual editing.
      }

      return res.json({ ok: true, circuit });
    } catch (e: any) {
      return res.status(500).json({ message: "Publish failed: " + e.message });
    }
  }

  static async uploadCircuitImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const { CloudinaryService } = require("../services/CloudinaryService");
      const cloudinarySvc = new CloudinaryService();
      
      const uploadResult = await cloudinarySvc.uploadImage(req.file.buffer, "circuit_web_image");
      const imageUrl = uploadResult.url;
      
      const repo = AppDataSource.getRepository(Circuit);
      await repo.update(id, { imageUrl });

      // --- Sync Image to WebPackage ---
      const circuit = await repo.findOneBy({ id: id as any });
      if (circuit && circuit.isPublished) {
        const wpRepo = AppDataSource.getRepository(WebPackage);
        const wp = await wpRepo.findOneBy({ title: circuit.title || circuit.nombre });
        if (wp) {
          wp.imageUrl = imageUrl;
          await wpRepo.save(wp);
        }
      }

      return res.json({ imageUrl });
    } catch (e: any) {
      console.error("Failed to upload circuit image:", e);
      return res.status(500).json({ message: "Upload failed: " + e.message });
    }
  }
}
