import type {
	KnowledgeBase,
	KnowledgeBaseResult,
} from "../../models/knowledge";

export interface KnowledgeBaseRepository {
	create(data: KnowledgeBase): Promise<{ knowledgeId: string }>;
	searchMatch(search: number[]): Promise<{ data: KnowledgeBaseResult[] }>;
}
