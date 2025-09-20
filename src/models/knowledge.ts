export interface KnowledgeBase {
	id: string;
	vector: number[];
	payload?: {
		problem: string;
		solution: string;
		createdAt: string;
	};
}

export interface KnowledgeBaseResult {
	id: string;
	version: number;
	score: number;
	payload: {
		problem: string;
		solution: string;
		createdAt: string;
	};
}

export interface KnowledgeBasePayloadResult {
	id: string;
	payload: {
		problem: string;
		solution: string;
		createdAt: string;
	};
}

export interface KnowledgeSearchResult {
	data: KnowledgeBasePayloadResult[];
	nextCursor: string | null;
	hasMore: boolean;
}
