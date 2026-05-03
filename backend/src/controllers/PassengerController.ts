import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Passenger } from "../entities/Passenger";
import { ILike } from "typeorm";

export class PassengerController {
    static async list(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Passenger);
            const list = await repo.find({ order: { name: "ASC" } });
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
                    { whatsapp: ILike(`%${q}%`) }
                ] : {},
                take: 10,
                order: { name: "ASC" }
            });
            return res.json(list);
        } catch (error) {
            return res.status(500).json({ message: "Error al buscar pasajeros" });
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
}
