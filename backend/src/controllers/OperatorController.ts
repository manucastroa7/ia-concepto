import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Operator } from "../entities/Operator";

export class OperatorController {
    static async list(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Operator);
            const operators = await repo.find({ order: { name: "ASC" } });
            return res.json(operators);
        } catch (error) {
            return res.status(500).json({ message: "Error al listar operadores" });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Operator);
            const operator = repo.create(req.body);
            await repo.save(operator);
            return res.status(201).json(operator);
        } catch (error) {
            return res.status(500).json({ message: "Error al crear operador", error });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const repo = AppDataSource.getRepository(Operator);
            const operator = await repo.findOneBy({ id });
            if (!operator) return res.status(404).json({ message: "Operador no encontrado" });
            
            repo.merge(operator, req.body);
            await repo.save(operator);
            return res.json(operator);
        } catch (error) {
            return res.status(500).json({ message: "Error al actualizar operador" });
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const repo = AppDataSource.getRepository(Operator);
            await repo.delete(id);
            return res.json({ ok: true });
        } catch (error) {
            return res.status(500).json({ message: "Error al eliminar operador" });
        }
    }
}
