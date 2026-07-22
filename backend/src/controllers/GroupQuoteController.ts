import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { GroupQuote } from "../entities/GroupQuote";

const numberOrZero = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const makeQuoteNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `COT-G-${date}-${suffix}`;
};

const calculateTotals = (payload: Partial<GroupQuote>) => {
    const pax = Math.max(0, Math.round(numberOrZero(payload.pax)));
    const services = Array.isArray(payload.services) ? payload.services : [];
    let totalNet = 0;
    let serviceProfit = 0;
    let liberatedPax = 0;

    services.forEach((service: any) => {
        const quantity = Math.max(1, numberOrZero(service.quantity) || 1);
        const serviceLiberados = Math.max(0, Math.round(numberOrZero(service.liberados)));
        const categories = Array.isArray(service.categories) ? service.categories : [];
        const zeroValueCategoryPax = categories.reduce((sum: number, category: any) => {
            const label = String(category.label || "").toLowerCase();
            const isLiberado = label.includes("liberado") || numberOrZero(category.value) === 0;
            return isLiberado ? sum + Math.max(0, Math.round(numberOrZero(category.quantity))) : sum;
        }, 0);

        liberatedPax = Math.max(liberatedPax, serviceLiberados, zeroValueCategoryPax);

        const categoryTotal = categories.reduce((sum: number, category: any) => {
            return sum + numberOrZero(category.value) * Math.max(0, numberOrZero(category.quantity));
        }, 0);

        let serviceNet = 0;
        if (categories.length > 0) {
            serviceNet = categoryTotal;
        } else if (service.billingMode === "per_group") {
            serviceNet = numberOrZero(service.netUnitCost) * quantity;
        } else {
            const paidPaxForService = Math.max(0, pax - serviceLiberados);
            serviceNet = numberOrZero(service.netUnitCost) * paidPaxForService;
        }

        const commission = numberOrZero(service.commission);
        const commissionAmount = service.commissionMode === "fixed"
            ? commission
            : serviceNet * (commission / 100);

        totalNet += serviceNet;
        serviceProfit += commissionAmount;
    });

    const paidPax = Math.max(0, pax - liberatedPax);
    const rawOverride = (payload as any).priceOverride;
    const override = rawOverride === null || rawOverride === undefined || rawOverride === ""
        ? 0
        : numberOrZero(rawOverride);

    let totalSelling = 0;
    let totalPerPerson = 0;

    if (override > 0) {
        totalPerPerson = override;
        totalSelling = override * (paidPax || pax || 1);
    } else {
        const globalCommission = numberOrZero(payload.globalCommission);
        const globalProfit = payload.commissionMode === "fixed"
            ? globalCommission * (paidPax || 1)
            : totalNet * (globalCommission / 100);
        totalSelling = Math.ceil(totalNet + serviceProfit + globalProfit);
        totalPerPerson = paidPax > 0 ? Math.ceil(totalSelling / paidPax) : totalSelling;
    }

    return {
        totalNet,
        totalSelling,
        totalPerPerson,
    };
};

const normalizePayload = (body: any) => {
    const payload = {
        ...body,
        quoteNumber: body.quoteNumber || makeQuoteNumber(),
        pax: Math.max(0, Math.round(numberOrZero(body.pax))),
        globalCommission: numberOrZero(body.globalCommission),
        services: Array.isArray(body.services) ? body.services : [],
        payments: Array.isArray(body.payments) ? body.payments : [],
        providerPayments: Array.isArray(body.providerPayments) ? body.providerPayments : [],
        passengerIds: Array.isArray(body.passengerIds) ? body.passengerIds : [],
        priceOverride: body.priceOverride === "" ? null : body.priceOverride,
    };

    return {
        ...payload,
        ...calculateTotals(payload),
    };
};

export class GroupQuoteController {
    static async list(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(GroupQuote);
            const quotes = await repo.find({ order: { createdAt: "DESC" } });
            return res.json(quotes);
        } catch (error) {
            console.error("Error listing group quotes:", error);
            return res.status(500).json({ message: "Error al listar cotizaciones grupales" });
        }
    }

    static async get(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(GroupQuote);
            const quote = await repo.findOneBy({ id: req.params.id });
            if (!quote) return res.status(404).json({ message: "Cotizacion grupal no encontrada" });
            return res.json(quote);
        } catch (error) {
            console.error("Error getting group quote:", error);
            return res.status(500).json({ message: "Error al obtener cotizacion grupal" });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(GroupQuote);
            const quote = repo.create(normalizePayload(req.body));
            await repo.save(quote);
            return res.status(201).json(quote);
        } catch (error) {
            console.error("Error creating group quote:", error);
            return res.status(500).json({ message: "Error al crear cotizacion grupal" });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(GroupQuote);
            const quote = await repo.findOneBy({ id: req.params.id });
            if (!quote) return res.status(404).json({ message: "Cotizacion grupal no encontrada" });

            repo.merge(quote, normalizePayload({ ...quote, ...req.body, quoteNumber: req.body.quoteNumber || quote.quoteNumber }));
            await repo.save(quote);
            return res.json(quote);
        } catch (error) {
            console.error("Error updating group quote:", error);
            return res.status(500).json({ message: "Error al actualizar cotizacion grupal" });
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(GroupQuote);
            await repo.delete(req.params.id);
            return res.json({ ok: true });
        } catch (error) {
            console.error("Error deleting group quote:", error);
            return res.status(500).json({ message: "Error al eliminar cotizacion grupal" });
        }
    }

    static async generateWhatsAppText(req: Request, res: Response) {
        try {
            const quote = normalizePayload(req.body.quoteData || req.body);
            const lines = [
                `*Cotizacion grupal ${quote.quoteNumber || ""}*`,
                quote.groupName ? `Grupo: ${quote.groupName}` : "",
                quote.clientName ? `Cliente: ${quote.clientName}` : "",
                quote.destination ? `Destino: ${quote.destination}` : "",
                `Pasajeros: ${quote.pax}`,
                "",
                "*Servicios:*",
                ...quote.services.map((service: any) => `- ${service.description || service.type || "Servicio"} (${service.billingMode || "per_person"})`),
                "",
                `*Total por persona:* ${quote.currency || "USD"} ${Number(quote.totalPerPerson).toLocaleString("es-AR")}`,
                `*Total grupo:* ${quote.currency || "USD"} ${Number(quote.totalSelling).toLocaleString("es-AR")}`,
                quote.clientNotes ? `\nNotas: ${quote.clientNotes}` : "",
            ].filter(Boolean);

            return res.json({ text: lines.join("\n") });
        } catch (error) {
            console.error("Error generating group quote WhatsApp:", error);
            return res.status(500).json({ message: "Error al generar texto" });
        }
    }
}
