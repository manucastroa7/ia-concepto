import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Circuit } from "../entities/Circuit";
import { GroupDeparture } from "../entities/GroupDeparture";
import { WebPackage } from "../entities/WebPackage";

export class PublicPackageController {
  static async getPublicPackages(req: Request, res: Response) {
    try {
      const circuitRepo = AppDataSource.getRepository(Circuit);
      const departureRepo = AppDataSource.getRepository(GroupDeparture);
      const webPackageRepo = AppDataSource.getRepository(WebPackage);

      const [circuits, departures, webPackages] = await Promise.all([
        circuitRepo.find({ where: { isPublished: true } }),
        departureRepo.find({ where: { isPublished: true } }),
        webPackageRepo.find({ where: { isPublished: true } }),
      ]);

      // --- Deduplication Logic ---
      const webPkgSourceIds = new Set(webPackages.filter(w => w.sourceId).map(w => w.sourceId));
      const webPkgTitles = new Set(webPackages.filter(w => w.title).map(w => w.title));
      
      const filteredCircuits = circuits.filter(c => 
        !webPkgSourceIds.has(c.id) && 
        !webPkgTitles.has(c.title) && 
        !webPkgTitles.has(c.nombre)
      );

      const mappedCircuits = filteredCircuits.map((c) => {
        let desc = "Explora este increíble paquete turístico.";
        let parsed: any = null;
        let highlights = c.highlights || [];
        let itinerary = c.itinerario_resumido ? c.itinerario_resumido.map(i => ({
          day: i.dia,
          title: `Día ${i.dia}`,
          activities: [i.descripcion]
        })) : [];

        if (c.rawText) {
          try {
            parsed = JSON.parse(c.rawText);
            desc = `Excelente propuesta a ${parsed.destination}. Salida: ${parsed.dates || 'A consultar'}.`;
            if (parsed.packages && parsed.packages.length > 0) {
              desc += ` Incluye estadía en hoteles seleccionados como ${parsed.packages.map((p:any) => p.hotelName).join(', ')}.`;
            }
            if (parsed.highlights && parsed.highlights.length > 0 && highlights.length === 0) {
              highlights = parsed.highlights;
            }
            if (parsed.itinerary && parsed.itinerary.length > 0 && itinerary.length === 0) {
              itinerary = parsed.itinerary.map((item: string, idx: number) => ({
                day: idx + 1,
                title: `Día ${idx + 1}`,
                activities: [item]
              }));
            }
          } catch (e) {
            desc = c.rawText.substring(0, 200) + "...";
          }
        }

          let finalImageUrl = c.imageUrl;
          if (finalImageUrl && finalImageUrl.startsWith('{')) {
            try { finalImageUrl = JSON.parse(finalImageUrl).url || finalImageUrl; } catch(e) {}
          }

          return {
            id: c.id,
            sourceType: "CIRCUIT",
            title: c.title || c.nombre || "Circuito Sin Título",
            description: desc,
            price: c.precio_base_eur || parseFloat(c.price) || 0,
            currency: c.currency || "USD",
            category: c.webCategory || "EUROPA",
            duration: c.duration || (c.duracion ? `${c.duracion.dias} Días` : "7 Días"),
            imageUrl: finalImageUrl || "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=800",
            location: c.destination || "Varios Destinos",
          tags: c.tags || ["CIRCUITO", "VIAJE"],
          included: c.inclusions || (parsed?.inclusions) || [],
          excluded: c.exclusions || (parsed?.exclusions) || [],
          highlights: highlights,
          itinerary: itinerary
        };
      });

      const mappedDepartures = departures.map((d) => ({
        id: d.id,
        sourceType: "GROUP_DEPARTURE",
        title: d.title || "Salida Grupal",
        description: `Salida grupal hacia ${d.destination} con cupo para ${d.capacity || "varios"} pasajeros. Salida: ${d.departureDate}.`,
        price: parseFloat(d.price) || 0,
        currency: d.currency || "USD",
        category: d.webCategory || "SALIDAS_GRUPALES",
        duration: d.departureDate && d.returnDate ? `${d.departureDate} - ${d.returnDate}` : "Consultar fechas",
        imageUrl: d.imageUrl || "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=800",
        location: d.destination || "Varios Destinos",
        tags: d.tags || ["GRUPAL", "SALIDA ACOMPAÑADA"],
        included: d.inclusions || [],
        excluded: [],
        highlights: d.highlights || [],
        itinerary: []
      }));

      const mappedWebPackages = webPackages.map((w) => ({
        id: w.id,
        sourceType: "WEB_PACKAGE",
        title: w.title,
        description: w.description,
        price: w.price,
        currency: w.currency || "USD",
        category: w.webCategory,
        duration: w.duration || "Consultar",
        imageUrl: w.imageUrl || "https://images.unsplash.com/photo-1544551763-47a0159f9234?auto=format&fit=crop&q=80&w=800",
        location: w.location || "Varios Destinos",
        tags: w.tags || [],
        included: w.included || [],
        excluded: w.excluded || [],
        highlights: w.highlights || [],
        itinerary: w.itinerary || [],
        customSections: w.customSections || [],
        // Promo fields
        isPromo: w.isPromo || false,
        promoLabel: w.promoLabel || null,
        originalPrice: w.originalPrice || null,
        promoEndsAt: w.promoEndsAt || null,
        isHeroBanner: w.isHeroBanner || false,
        heroBannerText: w.heroBannerText || null,
      }));

      const allPackages = [...mappedCircuits, ...mappedDepartures, ...mappedWebPackages];

      res.json(allPackages);
    } catch (error) {
      console.error("Error fetching public packages:", error);
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  }
}
