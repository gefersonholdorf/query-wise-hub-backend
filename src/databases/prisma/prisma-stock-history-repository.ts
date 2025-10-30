import { prismaClient } from "../client";
import type { StockHistoryRepository } from "../repositories/stock-history-repository";

export class PrismaStockHistoryRepository implements StockHistoryRepository {
	async create(
		action: string,
		knowledgeId: number,
		status?: "PENDING" | "APPROVED" | "DENIED",
	): Promise<{ stockHistoryId: number }> {
		const newStockHistory = await prismaClient.stockHistory.create({
			data: {
				knowledgeId: knowledgeId,
				action,
				status,
			},
		});

		return {
			stockHistoryId: newStockHistory.id,
		};
	}
}
