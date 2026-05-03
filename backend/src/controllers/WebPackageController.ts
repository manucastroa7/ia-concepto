import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { WebPackage } from "../entities/WebPackage";
import { Circuit } from "../entities/Circuit";

export class WebPackageController {
  static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(WebPackage);
      const circuitRepo = AppDataSource.getRepository(Circuit);

      // --- Auto-Sync Logic ---
      const publishedCircuits = await circuitRepo.find({ where: { isPublished: true } });
      const currentWebPkgs = await repo.find();

      for (const circ of publishedCircuits) {
        const exists = currentWebPkgs.find(wp => wp.sourceId === circ.id || wp.title === (circ.title || circ.nombre));
        if (!exists) {
          let parsed: any = null;
          let desc = `Paquete ${circ.destination}. Incluye: ${circ.inclusions?.join(', ') || 'Consultar'}.`;
          let inc = circ.inclusions || [];
          let exc = circ.exclusions || [];
          let it = circ.itinerario_resumido?.map(i => ({ day: i.dia, title: `Día ${i.dia}`, activities: [i.descripcion] })) || [];
          let cust: any[] = [];

          if (circ.rawText) {
            try {
              parsed = JSON.parse(circ.rawText);
              desc = parsed.description || `Excelente propuesta a ${parsed.destination}. Salida: ${parsed.dates || 'A consultar'}.`;
              if (parsed.inclusions && parsed.inclusions.length > 0) inc = parsed.inclusions;
              if (parsed.exclusions && parsed.exclusions.length > 0) exc = parsed.exclusions;
              if (parsed.itinerary && parsed.itinerary.length > 0) {
                it = parsed.itinerary.map((item: string, idx: number) => ({
                  day: idx + 1,
                  title: `Día ${idx + 1}`,
                  activities: [item]
                }));
              }
              if (parsed.packages && parsed.packages.length > 0) {
                 cust.push({
                   title: "Hoteles Previstos",
                   content: parsed.packages.map((p:any) => `- ${p.hotelName} (${p.boardBasis || 'Consultar'})`).join('\n')
                 });
              }
            } catch (e) {
              desc = circ.rawText.substring(0, 500) + "...";
            }
          }

          const newWP = repo.create({
            sourceId: circ.id,
            title: circ.title || circ.nombre || "Sin Título",
            description: desc,
            price: circ.precio_base_eur || (circ.price ? parseFloat(circ.price) : 0),
            currency: circ.currency || "EUR",
            duration: circ.duration || (circ.duracion ? `${circ.duracion.dias} Días` : ""),
            location: circ.destination,
            webCategory: circ.webCategory || "EUROPA",
            imageUrl: circ.imageUrl,
            included: inc,
            excluded: exc,
            highlights: circ.highlights,
            itinerary: it,
            customSections: cust,
            isPublished: true
          });
          await repo.save(newWP);
        }
      }

      const packages = await repo.find({ order: { createdAt: "DESC" } });
      res.json(packages);
    } catch (e) {
      console.error("Error in WebPackage list sync:", e);
      res.status(500).json({ error: "Error listing packages" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(WebPackage);
      const pkg = repo.create(req.body);
      const saved = await repo.save(pkg);
      res.json(saved);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error creating package" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(WebPackage);
      const pkg = await repo.findOneBy({ id: req.params.id });
      if (!pkg) return res.status(404).json({ error: "Not found" });
      Object.assign(pkg, req.body);
      const saved = await repo.save(pkg);
      res.json(saved);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error updating package" });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(WebPackage);
      const pkg = await repo.findOneBy({ id: req.params.id });
      if (!pkg) return res.status(404).json({ error: "Not found" });
      await repo.remove(pkg);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: "Error deleting package" });
    }
  }

  static async togglePublish(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(WebPackage);
      const pkg = await repo.findOneBy({ id: req.params.id });
      if (!pkg) return res.status(404).json({ error: "Not found" });
      pkg.isPublished = !pkg.isPublished;
      const saved = await repo.save(pkg);
      res.json(saved);
    } catch (e) {
      res.status(500).json({ error: "Error toggling publish" });
    }
  }

  static async uploadImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });

      const { CloudinaryService } = require("../services/CloudinaryService");
      const cloudinarySvc = new CloudinaryService();
      
      const uploadResult = await cloudinarySvc.uploadImage(req.file.buffer, "web_package_image");
      const imageUrl = uploadResult.url;
      
      const repo = AppDataSource.getRepository(WebPackage);
      await repo.update(id, { imageUrl });

      return res.json({ imageUrl });
    } catch (e: any) {
      console.error("Failed to upload web package image:", e);
      return res.status(500).json({ message: "Upload failed: " + e.message });
    }
  }
}
