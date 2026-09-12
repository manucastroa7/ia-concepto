import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ManualQuote } from "../entities/ManualQuote";

export class ManualQuoteController {
    static async create(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(ManualQuote);
            const manualQuote = repo.create(req.body);
            await repo.save(manualQuote);
            return res.status(201).json(manualQuote);
        } catch (error) {
            console.error("Error creating manual quote:", error);
            return res.status(500).json({ message: "Error al crear la cotización" });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const repo = AppDataSource.getRepository(ManualQuote);
            let quote = await repo.findOneBy({ id });
            if (!quote) return res.status(404).json({ message: "Cotización no encontrada" });
            
            repo.merge(quote, req.body);
            await repo.save(quote);
            return res.json(quote);
        } catch (error) {
            console.error("Error updating manual quote:", error);
            return res.status(500).json({ message: "Error al actualizar la cotización" });
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(ManualQuote);
            const quotes = await repo.find({ 
                order: { createdAt: "DESC" },
                relations: ["passenger"]
            });
            return res.json(quotes);
        } catch (error) {
            console.error("Error listing quotes:", error);
            return res.status(500).json({ message: "Error al listar cotizaciones" });
        }
    }

    static async get(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const repo = AppDataSource.getRepository(ManualQuote);
            const quote = await repo.findOne({ 
                where: { id },
                relations: ["passenger"]
            });
            if (!quote) return res.status(404).json({ message: "Cotización no encontrada" });
            return res.json(quote);
        } catch (error) {
            console.error("Error getting quote:", error);
            return res.status(500).json({ message: "Error al obtener la cotización" });
        }
    }

    static async generateWhatsAppText(req: Request, res: Response) {
        try {
            const { quoteData } = req.body;
            const agencyName = process.env.AGENCY_NAME || "Concepto Evt";
            
            let text = `*¡HOLA! AQUÍ TENÉS TU COTIZACIÓN PERSONALIZADA DE ${agencyName.toUpperCase()}* ✈️🌍\n\n`;
            
            if (quoteData.title) text += `*PROYECTO:* ${quoteData.title.toUpperCase()}\n`;
            if (quoteData.destination) text += `*DESTINO:* ${quoteData.destination}\n\n`;

            const flights = quoteData.items.filter((i: any) => i.type === 'flight');
            const hotels = quoteData.items.filter((i: any) => i.type === 'hotel');
            const transfers = quoteData.items.filter((i: any) => i.type === 'transfer');
            const others = quoteData.items.filter((i: any) => i.type === 'service' || i.type === 'assistance');

            if (flights.length > 0) {
                text += `✈️ *VUELOS:*\n`;
                flights.forEach((f: any) => {
                    text += `*${f.details.airline || 'Aéreo'}*`;
                    if (f.details.bookingCode) text += ` _(Reserva: ${f.details.bookingCode})_`;
                    text += `\n`;
                    (f.details.segments || []).forEach((seg: any, idx: number) => {
                        const arrow = idx === 0 ? '🛫' : '🔄';
                        const dateInfo = seg.departureDate ? `[${seg.departureDate}] ` : '';
                        const stopsInfo = seg.stops && seg.stops !== 'Directo' ? ` (${seg.stops})` : '';
                        text += `${arrow} ${dateInfo}${seg.from} ➔ ${seg.to}${stopsInfo} | ${seg.departureTime} - ${seg.arrivalTime}\n`;
                        if (seg.layoverDetails) text += `   ↳ _${seg.layoverDetails}_\n`;
                    });
                    
                    const bg = f.details.baggage;
                    const items = [];
                    if (bg.hasHand) items.push(bg.handDesc || 'Mochila');
                    if (bg.hasCarryOn) items.push(`Carry-on (${bg.carryOnDesc || '10kg'})`);
                    if (bg.hasChecked) items.push(`Bodega (${bg.checkedDesc || '23kg'})`);
                    
                    if (items.length > 0) text += `👜 _Equipaje Incluído: ${items.join(' + ')}_\n`;
                    text += `\n`;
                });
            }

            if (hotels.length > 0) {
                text += `🏨 *ALOJAMIENTO:*\n`;
                hotels.forEach((h: any) => {
                    text += `🏨 *${h.details.hotelName || 'Hotel'}*`;
                    if (h.details.confirmationNumber) text += ` _(Nº Conf: ${h.details.confirmationNumber})_`;
                    text += `\n`;
                    if (h.details.checkIn || h.details.checkOut) {
                        text += `📅 _Estadía: ${h.details.checkIn || '?'} al ${h.details.checkOut || '?'}\n_`;
                    }
                    (h.details.rooms || []).forEach((r: any) => {
                        text += `  • Hab: ${r.type || 'Standard'} | Régimen: ${r.board || 'Desayuno'} (${r.paxCount} pax)\n`;
                    });
                    if (h.details.cancellationDate) {
                        text += `⚠️ _Política: Límite de cancelación ${h.details.cancellationDate}_\n`;
                    }
                    text += `\n`;
                });
            }

            if (transfers.length > 0) {
                text += `🚖 *TRASLADOS:*\n`;
                transfers.forEach((t: any) => {
                    const typeStr = t.details.isRoundTrip ? 'IDA Y VUELTA' : 'SÓLO IDA';
                    text += `🚖 *${t.details.origin || '?'} ➔ ${t.details.destination || '?'}* (${typeStr})\n`;
                    if (t.details.date) text += `📅 _Fecha: ${t.details.date} | Hora: ${t.details.time || '--:--'}_\n`;
                    if (t.details.confirmationNumber) text += `🏷️ _Confirmación: ${t.details.confirmationNumber}_\n`;
                    text += `\n`;
                });
            }

            if (others.length > 0) {
                text += `✅ *INCLUYE ADEMÁS:*\n`;
                others.forEach((s: any) => {
                    text += `• ${s.details.description || 'Servicio'}`;
                    if (s.details.confirmationNumber) text += ` _(Nº Conf: ${s.details.confirmationNumber})_`;
                    text += `\n`;
                });
                text += `\n`;
            }

            // Calculate total from items with pricing model logic
            const totalSale = quoteData.items.reduce((acc: number, item: any) => {
                const { baseNetCost, adjustments, pricingModel, passengerCount, commissionValue, commissionType } = item.economics;
                let unitTotal = Number(baseNetCost);
                
                // Custom adjustments
                (adjustments || []).forEach((adj: any) => {
                    if (adj.type === 'fixed') unitTotal += Number(adj.value);
                    else unitTotal += (Number(baseNetCost) * Number(adj.value)) / 100;
                });

                // Dedicated commission (Option A: Based only on Neto)
                let unitProfit = 0;
                if (commissionType === 'fixed') unitProfit = Number(commissionValue || 0);
                else unitProfit = (Number(baseNetCost) * Number(commissionValue || 0)) / 100;
                
                const multiplier = (pricingModel === 'per_passenger') ? (Number(passengerCount) || 1) : 1;
                return acc + ((unitTotal + unitProfit) * multiplier);
            }, 0);

            const currency = quoteData.currency || "USD";
            text += `💰 *PRECIO TOTAL FINAL:* ${currency} ${Math.ceil(totalSale).toLocaleString(undefined, { maximumFractionDigits: 0 })}\n`;
            
            // Helpful breakdown if it's per passenger
            const perPaxItems = quoteData.items.filter((i: any) => i.economics.pricingModel === 'per_passenger');
            if (perPaxItems.length > 0) {
                text += `_(Valores calculados por el total de pasajeros indicados)_\n`;
            }
            
            if (quoteData.notes) {
                text += `\n📝 *NOTAS:* ${quoteData.notes}\n`;
            }

            text += `\n_Cotización válida por 24hs. Sujeta a disponibilidad al momento de reservar._\n\n`;
            text += `*¿Te gustaría confirmar o tenés alguna duda?* 📱`;

            return res.json({ text });
        } catch (error) {
            console.error("Error in generateWhatsAppText:", error);
            return res.status(500).json({ message: "Error al generar texto" });
        }
    }

    static async parseFlightTicket(req: Request, res: Response) {
        try {
            if (!req.file) return res.status(400).json({ message: "No se subió archivo o imagen" });
            const { GeminiVisionService } = require("../services/GeminiVisionService");
            const vision = new GeminiVisionService();
            const result = await vision.extractFlightTicketData(req.file.buffer, req.file.mimetype);
            return res.json(result);
        } catch (error: any) {
            console.error("Error parsing flight ticket:", error);
            return res.status(500).json({ message: error.message || "Error al procesar la reserva aérea" });
        }
    }

    static async parseServiceVoucher(req: Request, res: Response) {
        try {
            if (!req.file) return res.status(400).json({ message: "No se subió archivo o imagen" });
            const { GeminiVisionService } = require("../services/GeminiVisionService");
            const vision = new GeminiVisionService();
            const result = await vision.extractServiceVoucherData(req.file.buffer, req.file.mimetype);
            return res.json(result);
        } catch (error: any) {
            console.error("Error parsing service voucher:", error);
            return res.status(500).json({ message: error.message || "Error al procesar el comprobante" });
        }
    }

    static async parsePaymentReceipt(req: Request, res: Response) {
        try {
            if (!req.file) return res.status(400).json({ message: "No se subió archivo o imagen" });
            const { GeminiVisionService } = require("../services/GeminiVisionService");
            const vision = new GeminiVisionService();
            const result = await vision.extractPaymentReceiptData(req.file.buffer, req.file.mimetype);
            return res.json(result);
        } catch (error: any) {
            console.error("Error parsing payment receipt:", error);
            return res.status(500).json({ message: error.message || "Error al procesar el comprobante de pago" });
        }
    }

    static async parseExpressQuote(req: Request, res: Response) {
        try {
            const { images, prompt } = req.body;
            if (!images || !Array.isArray(images) || images.length === 0) {
                return res.status(400).json({ message: "Se requiere al menos una imagen en base64" });
            }

            const { GeminiVisionService } = require("../services/GeminiVisionService");
            const vision = new GeminiVisionService();
            const agencyName = process.env.AGENCY_NAME || "Concepto Evt";
            
            const result = await vision.parseExpressQuote(images, prompt, agencyName);
            return res.json(result);
        } catch (error: any) {
            console.error("Error in parseExpressQuote:", error);
            return res.status(500).json({ message: error.message || "Error al procesar la cotización exprés con la IA" });
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const repo = AppDataSource.getRepository(ManualQuote);
            const quote = await repo.findOneBy({ id });
            if (!quote) return res.status(404).json({ message: "Cotización no encontrada" });
            await repo.remove(quote);
            return res.json({ message: "Cotización eliminada exitosamente" });
        } catch (error) {
            console.error("Error deleting quote:", error);
            return res.status(500).json({ message: "Error al eliminar la cotización" });
        }
    }
}
