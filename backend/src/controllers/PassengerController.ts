import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Passenger } from "../entities/Passenger";
import { ManualQuote } from "../entities/ManualQuote";
import { ILike } from "typeorm";
import { GeminiVisionService } from "../services/GeminiVisionService";

export class PassengerController {
    static async list(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Passenger);
            const list = await repo.find({ order: { createdAt: "DESC" } });
            return res.json(list);
        } catch (error) {
            console.error("Error listing passengers:", error);
            return res.status(500).json({ message: "Error al listar pasajeros" });
        }
    }

    static async search(req: Request, res: Response) {
        try {
            const { q } = req.query;
            const repo = AppDataSource.getRepository(Passenger);
            const list = await repo.find({
                where: q ? [
                    { name: ILike(`%${q}%`) },
                    { surname: ILike(`%${q}%`) },
                    { whatsapp: ILike(`%${q}%`) },
                    { passportNumber: ILike(`%${q}%`) },
                    { email: ILike(`%${q}%`) }
                ] : {},
                take: 20,
                order: { name: "ASC" }
            });
            return res.json(list);
        } catch (error) {
            return res.status(500).json({ message: "Error al buscar pasajeros" });
        }
    }

    static async getDetails(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const passengerRepo = AppDataSource.getRepository(Passenger);
            const quoteRepo = AppDataSource.getRepository(ManualQuote);

            const passenger = await passengerRepo.findOneBy({ id });
            if (!passenger) return res.status(404).json({ message: "Pasajero no encontrado" });

            const quotes = await quoteRepo.find({
                where: [
                    { passengerId: id },
                    { passenger: { id: id } }
                ],
                order: { createdAt: "DESC" }
            });

            return res.json({
                ...passenger,
                quotes
            });
        } catch (error) {
            console.error("Error fetching passenger details:", error);
            return res.status(500).json({ message: "Error al obtener ficha de pasajero" });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Passenger);
            const passenger = repo.create(req.body);
            await repo.save(passenger);
            return res.status(201).json(passenger);
        } catch (error) {
            return res.status(500).json({ message: "Error al crear pasajero" });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const repo = AppDataSource.getRepository(Passenger);
            let passenger = await repo.findOneBy({ id });
            if (!passenger) return res.status(404).json({ message: "Pasajero no encontrado" });
            
            repo.merge(passenger, req.body);
            await repo.save(passenger);
            return res.json(passenger);
        } catch (error) {
            return res.status(500).json({ message: "Error al actualizar pasajero" });
        }
    }

    static async extractPassport(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No se envió ningún archivo de pasaporte" });
            }
            const vision = new GeminiVisionService();
            const data = await vision.extractPassportData(req.file.buffer, req.file.mimetype);
            return res.json(data);
        } catch (error: any) {
            console.error("Error al extraer pasaporte:", error);
            return res.status(500).json({ message: error.message || "Error al procesar el pasaporte" });
        }
    }
}
