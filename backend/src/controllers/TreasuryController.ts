import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { TreasuryAccount } from "../entities/TreasuryAccount";
import { TreasuryTransaction } from "../entities/TreasuryTransaction";

const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeTransaction = (body: any) => ({
    ...body,
    amount: Math.abs(toNumber(body.amount)),
    type: body.type || "expense",
    category: body.category || "other",
    date: body.date || new Date().toISOString().slice(0, 10),
    bookingFileId: body.bookingFileId || null,
    invoiceId: body.invoiceId || null,
});

export class TreasuryController {
    static async listAccounts(req: Request, res: Response) {
        try {
            const accountRepo = AppDataSource.getRepository(TreasuryAccount);
            const txRepo = AppDataSource.getRepository(TreasuryTransaction);
            const [accounts, transactions] = await Promise.all([
                accountRepo.find({ order: { createdAt: "ASC" } }),
                txRepo.find(),
            ]);

            const movementByAccount = transactions.reduce<Record<string, number>>((acc, tx) => {
                const sign = tx.type === "expense" ? -1 : 1;
                acc[tx.accountId] = (acc[tx.accountId] || 0) + sign * toNumber(tx.amount);
                return acc;
            }, {});

            return res.json(accounts.map((account) => ({
                ...account,
                balance: toNumber(account.initialBalance) + (movementByAccount[account.id] || 0),
            })));
        } catch (error) {
            console.error("Error listing treasury accounts:", error);
            return res.status(500).json({ message: "Error al listar cuentas" });
        }
    }

    static async createAccount(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(TreasuryAccount);
            const account = repo.create({
                name: req.body.name,
                currency: req.body.currency || "ARS",
                initialBalance: toNumber(req.body.initialBalance),
            });
            await repo.save(account);
            return res.status(201).json(account);
        } catch (error) {
            console.error("Error creating treasury account:", error);
            return res.status(500).json({ message: "Error al crear cuenta" });
        }
    }

    static async updateAccount(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(TreasuryAccount);
            const account = await repo.findOneBy({ id: req.params.id });
            if (!account) return res.status(404).json({ message: "Cuenta no encontrada" });

            repo.merge(account, {
                name: req.body.name ?? account.name,
                currency: req.body.currency ?? account.currency,
                initialBalance: req.body.initialBalance === undefined ? account.initialBalance : toNumber(req.body.initialBalance),
            });
            await repo.save(account);
            return res.json(account);
        } catch (error) {
            console.error("Error updating treasury account:", error);
            return res.status(500).json({ message: "Error al actualizar cuenta" });
        }
    }

    static async listTransactions(req: Request, res: Response) {
        try {
            const txRepo = AppDataSource.getRepository(TreasuryTransaction);
            const accountRepo = AppDataSource.getRepository(TreasuryAccount);
            const where = req.query.accountId ? { accountId: String(req.query.accountId) } : {};
            const [transactions, accounts] = await Promise.all([
                txRepo.find({ where, order: { date: "DESC", createdAt: "DESC" } }),
                accountRepo.find(),
            ]);
            const accountById = new Map(accounts.map((account) => [account.id, account]));

            return res.json(transactions.map((transaction) => ({
                ...transaction,
                account: accountById.get(transaction.accountId) || null,
            })));
        } catch (error) {
            console.error("Error listing treasury transactions:", error);
            return res.status(500).json({ message: "Error al listar movimientos" });
        }
    }

    static async createTransaction(req: Request, res: Response) {
        try {
            const accountRepo = AppDataSource.getRepository(TreasuryAccount);
            const account = await accountRepo.findOneBy({ id: req.body.accountId });
            if (!account) return res.status(400).json({ message: "Cuenta invalida" });

            const txRepo = AppDataSource.getRepository(TreasuryTransaction);
            const transaction = txRepo.create(normalizeTransaction(req.body));
            await txRepo.save(transaction);
            return res.status(201).json(transaction);
        } catch (error) {
            console.error("Error creating treasury transaction:", error);
            return res.status(500).json({ message: "Error al crear movimiento" });
        }
    }

    static async updateTransaction(req: Request, res: Response) {
        try {
            const txRepo = AppDataSource.getRepository(TreasuryTransaction);
            const transaction = await txRepo.findOneBy({ id: req.params.id });
            if (!transaction) return res.status(404).json({ message: "Movimiento no encontrado" });

            txRepo.merge(transaction, normalizeTransaction({ ...transaction, ...req.body }));
            await txRepo.save(transaction);
            return res.json(transaction);
        } catch (error) {
            console.error("Error updating treasury transaction:", error);
            return res.status(500).json({ message: "Error al actualizar movimiento" });
        }
    }

    static async removeTransaction(req: Request, res: Response) {
        try {
            const txRepo = AppDataSource.getRepository(TreasuryTransaction);
            await txRepo.delete(req.params.id);
            return res.json({ ok: true });
        } catch (error) {
            console.error("Error deleting treasury transaction:", error);
            return res.status(500).json({ message: "Error al eliminar movimiento" });
        }
    }
}
