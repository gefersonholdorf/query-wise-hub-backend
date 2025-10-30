export interface StockHistoryRepository {
	create(
		action: string,
		knowledgeId: number,
	): Promise<{ stockHistoryId: number }>;
}
