import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { AgencySettings } from "../entities/AgencySettings";
import { CloudinaryService } from "../services/CloudinaryService";

const cloudSvc = new CloudinaryService();

export class SettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(AgencySettings);
      let settings = await repo.findOne({ where: { id: 1 } });
      
      if (!settings) {
        // Create initial default settings
        settings = repo.create({
          id: 1,
          name: process.env.AGENCY_NAME || "Concepto Evt",
          phone: process.env.AGENCY_PHONE || "",
          slogan: process.env.AGENCY_SLOGAN || "Viajá con quien sabe",
          colorPrimary: process.env.AGENCY_COLOR_PRIMARY || "#1e3a5f",
          colorAccent: process.env.AGENCY_COLOR_ACCENT || "#f97316"
        });
        await repo.save(settings);
      }
      
      return res.json(settings);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(AgencySettings);
      let settings = await repo.findOne({ where: { id: 1 } });
      
      if (!settings) {
        settings = repo.create({ id: 1 });
      }

      const { name, phone, slogan, colorPrimary, colorAccent } = req.body;
      if (name) settings.name = name;
      if (phone) settings.phone = phone;
      if (slogan) settings.slogan = slogan;
      if (colorPrimary) settings.colorPrimary = colorPrimary;
      if (colorAccent) settings.colorAccent = colorAccent;

      await repo.save(settings);
      return res.json(settings);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }

  static async uploadLogo(req: Request, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ message: "No file" });
      const { type } = req.body; // 'full' or 'compact'
      
      const result = await cloudSvc.uploadImage(req.file.buffer, "agency_branding");
      
      const repo = AppDataSource.getRepository(AgencySettings);
      let settings = await repo.findOne({ where: { id: 1 } });
      if (!settings) settings = repo.create({ id: 1 });

      if (type === 'compact') {
        settings.logoCompactUrl = result.url;
      } else {
        settings.logoFullUrl = result.url;
      }

      await repo.save(settings);
      return res.json(settings);
    } catch (e: any) {
      return res.status(500).json({ message: e.message });
    }
  }
}
