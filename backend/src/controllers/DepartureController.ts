import { Request, Response } from "express";
import { GeminiVisionService } from "../services/GeminiVisionService";
import { FlyerGeneratorService } from "../services/FlyerGeneratorService";
import { AppDataSource } from "../data-source";
import { GroupDeparture } from "../entities/GroupDeparture";

const geminiVision = new GeminiVisionService();
const flyerGen = new FlyerGeneratorService();

export class DepartureController {
  static async create(req: Request, res: Response) {
    try {
      const { operator, destination, title, departureDate, returnDate, price, currency, inclusions, capacity, deadline, guide } = req.body;

      const data = { operator, destination, title, departureDate, returnDate, price, currency, inclusions, capacity, deadline, guide };

      // Generate WhatsApp message
      const { whatsapp } = await geminiVision.generateGroupDepartureContent(
        data,
        process.env.AGENCY_NAME || "Concepto Evt",
        process.env.AGENCY_PHONE || ""
      );

      // Generate flyer HTML
      const flyerHtml = await flyerGen.generateFlyerHtml({
        ...data,
        dates: `${departureDate || ''} - ${returnDate || ''}`.trim(),
        highlights: [],
        category: 'salida grupal'
      }, {});

      const repo = AppDataSource.getRepository(GroupDeparture);
      const dep = repo.create({ ...data, whatsappMessage: whatsapp, flyerHtml });
      await repo.save(dep);

      return res.status(201).json({ departure: dep, whatsapp, flyerHtml });
    } catch (error: any) {
      console.error("DepartureController error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async uploadAndExtract(req: Request, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const { buffer, mimetype } = req.file;
      const extracted = await geminiVision.extractFlyerData(buffer, mimetype);

      // Auto-map to departure format
      const data = {
        operator: extracted.operator || "Operadora",
        destination: extracted.destination,
        title: extracted.title,
        departureDate: extracted.dates,
        price: extracted.price,
        currency: extracted.currency,
        inclusions: extracted.inclusions,
        capacity: undefined,
        deadline: extracted.deadline,
        category: 'salida grupal'
      };

      const { whatsapp } = await geminiVision.generateGroupDepartureContent(
        data,
        process.env.AGENCY_NAME || "Concepto Evt",
        process.env.AGENCY_PHONE || ""
      );

      const flyerHtml = await flyerGen.generateFlyerHtml({ ...data, dates: data.departureDate, highlights: extracted.highlights }, {});

      const repo = AppDataSource.getRepository(GroupDeparture);
      
      let dep = null;
      if (data.title || data.destination) {
        dep = await repo.findOneBy({ 
          destination: data.destination,
          title: data.title 
        });
      }

      if (dep) {
        dep.operator = data.operator;
        dep.departureDate = data.departureDate || "";
        dep.price = data.price || "";
        dep.currency = data.currency || "";
        dep.inclusions = data.inclusions;
        dep.deadline = data.deadline || "";
        dep.whatsappMessage = whatsapp;
        dep.flyerHtml = flyerHtml;
      } else {
        dep = repo.create({ ...data, whatsappMessage: whatsapp, flyerHtml });
      }
      
      await repo.save(dep);

      return res.status(201).json({ departure: dep, whatsapp, flyerHtml, extracted });
    } catch (error: any) {
      console.error("DepartureController upload error:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(GroupDeparture);
      const all = await repo.find({ order: { createdAt: "DESC" }, take: 30 });
      return res.json(all);
    } catch (e) {
      return res.json([]);
    }
  }

  static async regenerate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(GroupDeparture);
      const dep = await repo.findOneBy({ id });
      if (!dep) return res.status(404).json({ message: "Not found" });

      const { whatsapp } = await geminiVision.generateGroupDepartureContent(
        dep,
        process.env.AGENCY_NAME || "Concepto Evt",
        process.env.AGENCY_PHONE || ""
      );

      const flyerHtml = await flyerGen.generateFlyerHtml({ ...dep, dates: dep.departureDate, highlights: [] }, {});
      dep.whatsappMessage = whatsapp;
      dep.flyerHtml = flyerHtml;
      await repo.save(dep);

      return res.json({ whatsapp, flyerHtml });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(GroupDeparture);
      await repo.delete(id);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ message: "Delete failed" });
    }
  }

  static async publishDeparture(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isPublished, webCategory } = req.body;
      const repo = AppDataSource.getRepository(GroupDeparture);
      const copy = await repo.findOneBy({ id: id as any });
      
      if (!copy) return res.status(404).json({ message: "Departure not found" });
      
      copy.isPublished = isPublished;
      if (webCategory) copy.webCategory = webCategory;
      
      await repo.save(copy);
      return res.json({ ok: true, departure: copy });
    } catch (e: any) {
      return res.status(500).json({ message: "Publish failed: " + e.message });
    }
  }
}
