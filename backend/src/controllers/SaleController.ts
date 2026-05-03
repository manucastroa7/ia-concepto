import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Sale } from "../entities/Sale";
import { ManualQuote } from "../entities/ManualQuote";

export class SaleController {
    static async createFromQuote(req: Request, res: Response) {
        try {
            const { quoteId, passengerName, totalAmount, travelDate, notes } = req.body;
            const quoteRepo = AppDataSource.getRepository(ManualQuote);
            const saleRepo = AppDataSource.getRepository(Sale);

            const quote = await quoteRepo.findOneBy({ id: quoteId });
            
            const sale = saleRepo.create({
                quote: quote || undefined,
                passengerName,
                totalAmount,
                travelDate: travelDate ? new Date(travelDate) : undefined,
                internalNotes: notes,
                paymentStatus: "pending",
                paidAmount: 0,
                currency: quote?.currency || "USD"
            });

            await saleRepo.save(sale);

            if (quote) {
                quote.status = "sold";
                await quoteRepo.save(quote);
            }

            return res.status(201).json(sale);
        } catch (error) {
            console.error("Error converting quote to sale:", error);
            return res.status(500).json({ message: "Error al registrar la venta" });
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Sale);
            const sales = await repo.find({ 
                relations: ["quote"],
                order: { createdAt: "DESC" } 
            });
            return res.json(sales);
        } catch (error) {
            return res.status(500).json({ message: "Error al listar ventas" });
        }
    }

    static async updatePayment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { amount, note } = req.body;
            const repo = AppDataSource.getRepository(Sale);
            
            const sale = await repo.findOneBy({ id });
            if (!sale) return res.status(404).json({ message: "Venta no encontrada" });

            sale.paidAmount = Number(sale.paidAmount) + Number(amount);
            
            if (sale.paidAmount >= sale.totalAmount) {
                sale.paymentStatus = "paid";
            } else if (sale.paidAmount > 0) {
                sale.paymentStatus = "partial";
            }

            sale.paymentHistory = [
                ...(sale.paymentHistory || []),
                { date: new Date(), amount, note }
            ];

            await repo.save(sale);
            return res.json(sale);
        } catch (error) {
            return res.status(500).json({ message: "Error al actualizar pago" });
        }
    }
}
