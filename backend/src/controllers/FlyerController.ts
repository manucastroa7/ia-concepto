import { Request, Response } from "express";
import { GeminiVisionService } from "../services/GeminiVisionService";
import { FlyerGeneratorService } from "../services/FlyerGeneratorService";
import { HotelSearchService } from "../services/HotelSearchService";
import { CloudinaryService } from "../services/CloudinaryService";
import { TouristAttractionService } from "../services/TouristAttractionService";
import { PexelsService } from "../services/PexelsService";
import { StoryVideoService } from "../services/StoryVideoService";
import { AppDataSource } from "../data-source";
import { FlyerDoc } from "../entities/FlyerDoc";
import { DestinationAsset } from "../entities/DestinationAsset";
import { AgencySettings } from "../entities/AgencySettings";
import { Circuit } from "../entities/Circuit";
import { createHash } from "crypto";

const geminiVision = new GeminiVisionService();
const flyerGen = new FlyerGeneratorService();
const hotelSvc = new HotelSearchService();
const cloudSvc = new CloudinaryService();
const attractionSvc = new TouristAttractionService();
const pexelsSvc = new PexelsService();
const storyVideoSvc = new StoryVideoService();

const normalizeText = (value?: string | null) =>
  (value || "").toLowerCase().trim().replace(/\s+/g, " ");

const buildSuggestedItemImages = (packages: any[] = [], assets: DestinationAsset[] = []) => {
  const mapping: Record<string, string> = {};

  for (const pkg of packages || []) {
    const hotelName = pkg?.hotelName;
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

export class FlyerController {
  private static async getSettings() {
    try {
      const repo = AppDataSource.getRepository(AgencySettings);
      return await repo.findOne({ where: { id: 1 } });
    } catch (e) {
      return null;
    }
  }

  static async extractFlyer(req: Request, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const { buffer, mimetype } = req.file;
      const contentHash = createHash("md5").update(buffer).digest("hex");
      const settings = await FlyerController.getSettings();
      const repo = AppDataSource.getRepository(FlyerDoc);

      // Cache hit: reuse previous extraction to ahorrar llamadas a IA
      const cached = await repo.findOne({ where: { contentHash } });
      if (cached?.extractedData) {
        const extracted = JSON.parse(JSON.stringify(cached.extractedData));
        
        // Re-generate WhatsApp message so it uses latest settings (phone/name)
        const whatsapp = await geminiVision.generateWhatsAppMessage(
          extracted,
          settings?.name || process.env.AGENCY_NAME || "Concepto Evt",
          settings?.phone || process.env.AGENCY_PHONE || ""
        );

        // Re-run hotel enrichment so ratings/photos estén frescos
        let hotels: any[] = [];
        const hotelList = extracted.packages && extracted.packages.length > 0 
          ? extracted.packages.map((p: any) => p.hotelName) 
          : extracted.hotelNames || [];
        
        if (hotelList.length > 0) {
          try {
            const queries = hotelList.slice(0, 4).map((hName: string) => 
              hotelSvc.searchHotels({
                destination: `${hName}, ${extracted.destination || ''}`,
                accommodationType: "hotel",
                hotelCategory: "",
                count: 1,
                includeReviews: true,
              })
            );
            const results = await Promise.allSettled(queries);
            results.forEach(r => {
              if (r.status === 'fulfilled' && r.value && r.value.length > 0) {
                hotels.push(r.value[0]);
              }
            });
          } catch (e) {}
        }

        if (extracted.packages && hotels.length > 0) {
          extracted.packages = extracted.packages.map((pkg: any) => {
            const matchingHotel = hotels.find((h: any) => 
              h.name.toLowerCase().includes(pkg.hotelName.toLowerCase()) ||
              pkg.hotelName.toLowerCase().includes(h.name.toLowerCase())
            );
            if (matchingHotel) {
              return {
                ...pkg,
                rating: matchingHotel.rating,
                numReviews: matchingHotel.numReviews,
                googlePhoto: matchingHotel.photoUrl,
                mapsUrl: matchingHotel.mapsUrl,
                reviewSummary: matchingHotel.reviewSummary,
                reviews: matchingHotel.reviews || []
              };
            }
            return pkg;
          });
        }

        let heroImages: string[] = [];
        let suggestedItemImages: Record<string, string> = {};
        if (extracted.destination) {
          try {
            const assetRepo = AppDataSource.getRepository(DestinationAsset);
            const assets = await assetRepo.find({
              where: { destination: extracted.destination.toLowerCase().trim() },
              order: { createdAt: 'DESC' },
            });
            heroImages = assets.filter(a => !a.hotelName).slice(0, 3).map(a => a.imageUrl);
            suggestedItemImages = buildSuggestedItemImages(extracted.packages || [], assets);
          } catch (e) {}
        }

        const attractions = extracted.destination
          ? await attractionSvc.searchAttractions(extracted.destination, 6)
          : [];
        if (heroImages.length === 0) {
          heroImages = attractions
            .filter((place: any) => place.photoUrl)
            .slice(0, 3)
            .map((place: any) => place.photoUrl as string);
        }

        const flyerHtml = await flyerGen.generateFlyerHtml(extracted, {
          heroImages,
          itemImages: suggestedItemImages,
          attractions,
          format: ((req.query.format as string) || "post") as "post" | "story",
          agencySettings: settings
        });

        return res.json({ extracted, whatsapp, hotels, attractions, flyerHtml, suggestedImages: heroImages, suggestedItemImages });
      }

      // 1. Extract data
      const extracted = await geminiVision.extractFlyerData(buffer, mimetype);

      // 2. WhatsApp
      const whatsapp = await geminiVision.generateWhatsAppMessage(
        extracted,
        settings?.name || process.env.AGENCY_NAME || "Concepto Evt",
        settings?.phone || process.env.AGENCY_PHONE || ""
      );

      // 3. Hotels
      let hotels: any[] = [];
      const hotelList = extracted.packages && extracted.packages.length > 0 
        ? extracted.packages.map((p: any) => p.hotelName) 
        : extracted.hotelNames || [];
        
      if (hotelList.length > 0) {
        try {
          const queries = hotelList.slice(0, 4).map((hName: string) => 
            hotelSvc.searchHotels({
              destination: `${hName}, ${extracted.destination || ''}`,
              accommodationType: "hotel",
              hotelCategory: "",
              count: 1,
              includeReviews: true,
            })
          );
          const results = await Promise.allSettled(queries);
          results.forEach(res => {
            if (res.status === 'fulfilled' && res.value && res.value.length > 0) {
              hotels.push(res.value[0]);
            }
          });
        } catch (e) {}
      }

      // 4. Hero Assets
      let heroImages: string[] = [];
      let suggestedItemImages: Record<string, string> = {};
      if (extracted.destination) {
        try {
          const assetRepo = AppDataSource.getRepository(DestinationAsset);
          const assets = await assetRepo.find({
            where: { destination: extracted.destination.toLowerCase().trim() },
            order: { createdAt: 'DESC' },
          });
          heroImages = assets.filter(a => !a.hotelName).slice(0, 3).map(a => a.imageUrl);
          suggestedItemImages = buildSuggestedItemImages(extracted.packages || [], assets);
        } catch (e) {}
      }

      // 5. Merge Hotel Ratings into extracted packages
      if (extracted.packages && hotels.length > 0) {
        extracted.packages = extracted.packages.map((pkg: any) => {
          const matchingHotel = hotels.find((h: any) => 
            h.name.toLowerCase().includes(pkg.hotelName.toLowerCase()) ||
            pkg.hotelName.toLowerCase().includes(h.name.toLowerCase())
          );
          if (matchingHotel) {
            return {
              ...pkg,
              rating: matchingHotel.rating,
              numReviews: matchingHotel.numReviews,
              googlePhoto: matchingHotel.photoUrl,
              mapsUrl: matchingHotel.mapsUrl,
              reviewSummary: matchingHotel.reviewSummary,
              reviews: matchingHotel.reviews || []
            };
          }
          return pkg;
        });
      }

      // 6. Generate HTML with dynamic settings
      const attractions = extracted.destination
        ? await attractionSvc.searchAttractions(extracted.destination, 6)
        : [];
      if (heroImages.length === 0) {
        heroImages = attractions
          .filter((place: any) => place.photoUrl)
          .slice(0, 3)
          .map((place: any) => place.photoUrl as string);
      }

      const flyerHtml = await flyerGen.generateFlyerHtml(extracted, { 
        heroImages,
        itemImages: suggestedItemImages,
        attractions,
        format: ((req.query.format as string) || "post") as "post" | "story",
        agencySettings: settings 
      });

      // 6. Save FlyerDoc cache
      try {
        const doc = repo.create({
          originalName: req.file.originalname,
          mimeType: mimetype,
          contentHash,
          extractedData: extracted,
          whatsappMessage: whatsapp,
          flyerHtml,
        });
        await repo.save(doc);
      } catch (e) {}

      // 7. Save as Circuit so it appears in the "Ofertas / Historial" UI
      try {
        const circuitRepo = AppDataSource.getRepository(Circuit);
        const circuitTitle = extracted.destination 
          ? `Paquete a ${extracted.destination} (${extracted.dates || 'Fechas a confirmar'})` 
          : (req.file.originalname || "Flyer Extraído");
          
        // Check if we already have this flyer saved as a circuit (by sourceFile)
        let circuit = await circuitRepo.findOne({ where: { sourceFile: req.file.originalname } });
        if (!circuit) circuit = circuitRepo.create();

        circuit.operator = extracted.operator || "Flyer";
        circuit.destination = extracted.destination || "Varios";
        circuit.title = circuitTitle;
        circuit.nombre = circuitTitle;
        circuit.duration = extracted.duration || "";
        circuit.price = extracted.price || "";
        circuit.currency = extracted.currency || "USD";
        circuit.dates = extracted.dates || "";
        circuit.inclusions = extracted.inclusions || [];
        circuit.exclusions = extracted.exclusions || [];
        circuit.hoteles_previstos = extracted.hotelNames || [];
        circuit.categoria = extracted.category || "PAQUETE";
        circuit.sourceFile = req.file.originalname;
        circuit.rawText = JSON.stringify(extracted);
        // numeric price
        const numPrice = parseFloat(circuit.price.replace(/[^0-9.]/g, ''));
        circuit.precio_base_eur = isNaN(numPrice) ? 0 : numPrice;
        
        await circuitRepo.save(circuit);
      } catch (e) {
        console.error("Failed to save flyer as Circuit:", e);
      }

      return res.json({ extracted, whatsapp, hotels, attractions, flyerHtml, suggestedImages: heroImages, suggestedItemImages });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Extraction failed" });
    }
  }

  static async renderFlyer(req: Request, res: Response) {
    try {
      const { data, options } = req.body;
      const settings = await FlyerController.getSettings();
      const flyerHtml = await flyerGen.generateFlyerHtml(data, { 
        ...options, 
        agencySettings: settings 
      });
      return res.json({ flyerHtml });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async uploadAsset(req: Request, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ message: "No file" });
      const { destination, hotelName } = req.body;
      if (!destination) return res.status(400).json({ message: "Destination required" });

      const result = await cloudSvc.uploadImage(req.file.buffer, destination);
      
      const repo = AppDataSource.getRepository(DestinationAsset);
      const asset = repo.create({
        destination: destination.toLowerCase().trim(),
        imageUrl: result.url,
        publicId: result.publicId,
        hotelName: hotelName ? String(hotelName).trim() : null
      });
      await repo.save(asset);

      return res.json(asset);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async getAssets(req: Request, res: Response) {
    try {
      const { destination } = req.query;
      const repo = AppDataSource.getRepository(DestinationAsset);
      const query: any = { order: { createdAt: 'DESC' } };
      if (destination) {
        query.where = { destination: (destination as string).toLowerCase().trim() };
      }
      const assets = await repo.find(query);
      return res.json(assets);
    } catch (e) {
      return res.json([]);
    }
  }

  static async updateAsset(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(DestinationAsset);
      const asset = await repo.findOne({ where: { id: Number(req.params.id) } });
      if (!asset) return res.status(404).json({ message: "Asset not found" });

      asset.hotelName = req.body?.hotelName ? String(req.body.hotelName).trim() : null;
      await repo.save(asset);
      return res.json(asset);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async deleteAsset(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(DestinationAsset);
      const asset = await repo.findOne({ where: { id: Number(req.params.id) } });
      if (!asset) return res.status(404).json({ message: "Asset not found" });

      if (asset.publicId) {
        try {
          await cloudSvc.deleteImage(asset.publicId);
        } catch (e) {}
      }

      await repo.delete(asset.id);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async getFlyers(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(FlyerDoc);
      const flyers = await repo.find({ order: { createdAt: "DESC" }, take: 20 });
      return res.json(flyers);
    } catch (e) {
      return res.json([]);
    }
  }

  static async deleteFlyer(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(FlyerDoc);
      await repo.delete(req.params.id);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async deleteMultipleFlyers(req: Request, res: Response) {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: "No ids provided" });
      const repo = AppDataSource.getRepository(FlyerDoc);
      await repo.delete(ids);
      return res.json({ ok: true, deleted: ids.length });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async deleteAllFlyers(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(FlyerDoc);
      await repo.clear();
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async getAttractions(req: Request, res: Response) {
    try {
      const destination = String(req.query.destination || "").trim();
      if (!destination) return res.status(400).json({ message: "Destination required" });

      const attractions = await attractionSvc.searchAttractions(destination, 6);
      return res.json(attractions);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async generateInstagramStories(req: Request, res: Response) {
    try {
      const { data } = req.body;
      if (!data) return res.status(400).json({ message: "Flyer data required" });

      const settings = await FlyerController.getSettings();
      const stories = await geminiVision.generateInstagramStoriesPlan(
        data,
        settings?.name || process.env.AGENCY_NAME || "Concepto Evt",
        settings?.phone || process.env.AGENCY_PHONE || ""
      );

      const videos = stories.story1?.searchTerms
        ? await pexelsSvc.searchVideos(stories.story1.searchTerms, 6)
        : [];

      return res.json({ ...stories, videos });
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async generateStoryVideo(req: Request, res: Response) {
    try {
      const { videoUrl, hookText, overlayText, ctaText, destination } = req.body || {};
      if (!videoUrl) return res.status(400).json({ message: "videoUrl required" });

      const buffer = await storyVideoSvc.generateStoryVideo({
        videoUrl,
        hookText: hookText || "",
        overlayText: overlayText || "",
        ctaText: ctaText || "",
      });

      const safeName = String(destination || "story").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="story-${safeName}.mp4"`);
      return res.send(buffer);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }
}
