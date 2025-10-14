export interface StockHistoryRepository {
	create(
		action: string,
		solutionId: number,
	): Promise<{ stockHistoryId: number }>;
}
