import type {
	KnowledgeBase,
	KnowledgeBaseResult,
	KnowledgeSearchResult,
} from "../../models/knowledge";

export interface CursorPaginationParams {
	cursor?: string;
	limit?: number;
}

export interface Filtering {
	problem?: string;
}

export interface KnowledgeBaseRepository {
	create(data: KnowledgeBase): Promise<{ knowledgeId: string }>;
	search(
		params: CursorPaginationParams,
		filtering: Filtering,
	): Promise<KnowledgeSearchResult>;
	searchMatch(search: number[]): Promise<{ data: KnowledgeBaseResult[] }>;
}
