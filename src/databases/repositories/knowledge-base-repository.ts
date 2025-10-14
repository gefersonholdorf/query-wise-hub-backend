import type {
	KnowledgeBase,
	KnowledgeBaseResult,
} from "../../models/knowledge";

export interface PaginationParams {
	page?: number;
	quantityPerPage?: number;
}

export interface Filtering {
	problem?: string;
}

export interface KnowledgeBaseRepository {
	create(data: KnowledgeBase): Promise<{ knowledgeId: string }>;
	search(
		params: PaginationParams,
		filtering: Filtering,
	): Promise<{ data: string[] }>;
	searchBySolutionId(id: number): Promise<{ data: string[] }>;
	searchMatch(search: number[]): Promise<{ data: KnowledgeBaseResult[] }>;
	save(data: KnowledgeBase, solutionId: number): Promise<{}>;
	delete(solutionId: number): Promise<{}>;
}
